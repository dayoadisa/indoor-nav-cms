const postsCollection = require('../db').db().collection('posts')
const ObjectID = require('mongodb').ObjectID
const User = require('./User')
const Layer = require('./Layer')
const sanitizeHTML = require('sanitize-html')


let Post = function (data, userid, requestedPostId) {
    this.data = data
    this.errors = []
    this.userid = userid
    this.requestedPostId = requestedPostId
    
}


Post.prototype.cleanUp = function () {
    if (typeof (this.data.name) != "string") { this.data.name = "" }
    if (typeof (this.data.address) != "string") { this.data.address = "" }
    if (typeof (this.data.language) != "string") { this.data.language = "" }
    


    //get rid of bogus properties
    this.data = {
        name: this.data.name.trim(),
        address: this.data.address.trim(),
        language: this.data.language.trim(),
        createdDate: new Date(),
        author: ObjectID(this.userid),
        geometry: {
                    type: {
                    type: String, 
                    enum: ['Point'],
                    required: true
                    },
                coordinates:this.data.coordinates
            },
            properties: {
                description: this.data.name
            },
    
        
    }
    
    
}




Post.prototype.validate = function () {
    if (this.data.name == "") { this.errors.push("You must provide building name") }
    if (this.data.address == "") { this.errors.push("You must provide a address for new building") }
    if (this.data.language == "") { this.errors.push("You must select a language") }
}


Post.prototype.create = function () {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
            //save post into database
            postsCollection.insertOne(this.data).then((info) => {
                resolve(info.ops[0]._id)
            }).catch(() => {
                this.errors.push("Please try again later")
                reject(this.errors)
            })
        } else {
            reject(this.errors)
        }
    })
}

Post.prototype.update = function () {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(this.requestedPostId, this.userid)
            if (post.isVisitorOwner) {
                //actually update the db
                let status = await this.actuallyUpdate()
                resolve(status)
            } else {
                reject()
            }
        } catch {
            reject()
        }
    })
}

Post.prototype.actuallyUpdate = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
          
            await postsCollection.findOneAndUpdate({ _id: new ObjectID(this.requestedPostId) }, { $set: { name: this.data.name, address: this.data.address, 
                "geometry.coordinates": this.data.geometry.coordinates } })
            resolve("success")
        } else {
            resolve("failure")
        }
    })
}

Post.reusablePostQuery = function (uniqueOperations, visitorId) {
    return new Promise(async function (resolve, reject) {
        let aggOperations = uniqueOperations.concat([
            { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorDocument" } },
            {
                $project: {
                    name: 1,
                    address: 1,
                    createdDate: 1,
                    geometry: 1,
                    authorId: "$author",
                    author: { $arrayElemAt: ["$authorDocument", 0] }
                }
            }
        ])
        let posts = await postsCollection.aggregate(aggOperations).toArray()

        //clean up author property in each post object
        posts = posts.map(function (post) {

            post.isVisitorOwner = post.authorId.equals(visitorId)
            post.authorId = undefined

            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar

            }

            return post
            console.log(post)
        })

        resolve(posts)
    })
}


Post.findSingleById = function (id, visitorId) {
    return new Promise(async function (resolve, reject) {
        if (typeof (id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        }
       
        let posts = await Post.reusablePostQuery([
            { $match: { _id: new ObjectID(id) } }
        ], visitorId)

        if (posts.length) {
            console.log(posts[0])
            resolve(posts[0])
        } else {
            reject()
        }
    })
}



Post.findByAuthorId = function (authorId) {
    return Post.reusablePostQuery([
        { $match: { author: authorId } },
        { $sort: { createdDate: -1 } }
    ])
}

Post.delete = function (postIdToDelete, currentUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(postIdToDelete, currentUserId)
            if (post.isVisitorOwner) {
                await postsCollection.deleteOne({ _id: new ObjectID(postIdToDelete) })
                resolve()
            } else {
                reject()
            }
        } catch (error) {

        }
    })
}

Post.search = function (searchTerm) {
    return new Promise(async (resolve, reject) => {
        if (typeof (searchTerm) == "string") {
            let posts = await Post.reusablePostQuery([
                { $match: { $text: { $search: searchTerm } } },
                { $sort: { score: { $meta: "textScore" } } }
            ])
            resolve(posts)
        } else {
            reject()
        }
    })
}



Post.findAll =  function () {
    return new Promise((resolve, reject) => {
      let posts =  postsCollection.find({}).toArray((err, posts) => {
            err
            ? reject(err)
            : resolve(posts)
            console.log('post:', posts)
            
        })
    })

}



module.exports = Post