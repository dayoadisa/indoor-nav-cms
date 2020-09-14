const layersCollection = require('../db').db().collection('layers')
const ObjectID = require('mongodb').ObjectID
const User = require('./User')
const Post = require('./Post')
const sanitizeHTML = require('sanitize-html')



let Layer = function(data, userid, requestedPostId) {
    this.data = data
    this.errors = []
    this.userid = userid
    this.requestPostId = requestedPostId
}

Layer.prototype.cleanUp = function() {
 if(typeof (this.data.layerName) != 'string') {this.data.layerName = "" }
 if(typeof(this.data.floor) != 'string') {this.data.floor = ""}

        this.data = {
            name: this.data.name,
            address: this.data.address,
            createdDate: new Date(),
            author: ObjectID(this.userid),
            coordinates: this.data.coordinates,
            info: [
                    {
                        layerName: this.data.layerName,
                        floor: this.data.floor,
                        images: this.data.images
                    }
                ]
        }
        
}

Layer.prototype.validate = function() {
    if (this.data.info.layerName == "") { this.errors.push("You must provide floor name") }
    if (this.data.info.floor == "") { this.errors.push("You must provide floor number") }
}


Layer.prototype.create = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()

        if (!this.errors.length) {
            //create an index
            //layersCollection.createIndex( { "name": 1 }, { unique: true } )
            //save post into database
            layersCollection.insertOne(this.data).then((info) => {
                resolve(info.ops[0]._id)
                //console.log(JSON.stringify(info, null, 2))
            }).catch(() => {
                this.errors.push("Action not permitted")
                reject(this.errors)
            })
        } else {
            reject(this.errors)
        }
    })
}


Layer.prototype.update = function () {
    return new Promise(async (resolve, reject) => {
        try {
            let layer = await Layer.findSingleById(this.requestedPostId, this.userid)
            if (layer.isVisitorOwner) {
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

Layer.prototype.actuallyUpdate = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
            await layersCollection.findOneAndUpdate({ _id: new ObjectID(this.requestedPostId) }, { $set: { "info[0].layerName": this.info.data.layerName, "info[0].floor": this.info.data.floor, 
                "info[0].images": this.data.info.images, address: this.data.address, coordinates: this.data.coordinates } })
            resolve("success")
        } else {
            resolve("failure")
        }
    })
}

Layer.prototype.updateDoc = function () {
    return new Promise(async (resolve, reject) => {
        try {
            let layer = await Layer.findSingleById(this.requestedPostId, this.userid)
            if (layer.isVisitorOwner) {
                //actually update the db
                let status = await this.actuallyUpdateDoc()
                resolve(status)
            } else {
                reject()
            }
        } catch {
            reject()
        }
    })
}

Layer.prototype.actuallyUpdateDoc = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
            await layersCollection.update({ _id: new ObjectID(this.requestedPostId) }, { $push: {info: { layerName: this.data.layerName, floor: this.data.floor, 
                images: this.data.images} } })
            resolve("success")
        } else {
            resolve("failure")
        }
    })
}


Layer.reusablePostQuery = function (uniqueOperations, visitorId) {
    return new Promise(async function (resolve, reject) {
        let aggOperations = uniqueOperations.concat([
            { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorDocument" } },
            {
                $project: {
                    name: 1,
                    address: 1,
                    info: 1,
                    layerName: 1,
                    floor: 1,
                    images: 1,
                    createdDate: 1,
                    coordinates: 1,
                    authorId: "$author",
                    author: { $arrayElemAt: ["$authorDocument", 0] }
                }
            }
        ])
        let layers = await layersCollection.aggregate(aggOperations).toArray()

        //clean up author property in each post object
        layers = layers.map(function (layer) {
            layer.isVisitorOwner = layer.authorId.equals(visitorId)
            

            layer.author = {
                username: layer.author.username,
                //avatar: new User(post.author, true).avatar

            }

            return layer
            console.log(layer)
        })

        resolve(layers)
    })
}


Layer.findSingleById = function (id, visitorId) {
    return new Promise(async function (resolve, reject) {
        if (typeof(id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        }

        let layers = await Layer.reusablePostQuery([
            { $match: { _id: new ObjectID(id) } }
        ], visitorId)

        if (layers.length) {
            console.log(layers[0])
            resolve(layers[0])
        } else {
            reject()
        }

       
        
    })
}

Layer.findSingleById = function (id, visitorId) {
    return new Promise(async function (resolve, reject) {
        if (typeof(id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        }

        let layers = await Layer.reusablePostQuery([
            { $match: { _id: new ObjectID(id) } }
        ], visitorId)

        if (layers.length) {
            console.log(layers[0])
            resolve(layers[0])
        } else {
            reject()
        }

       
        
    })
}



Layer.findByAuthorId = function (authorId) {
    return Layer.reusablePostQuery([
        { $match: { author: authorId } },
        { $sort: { createdDate: -1 } }
    ])
}


Layer.findAll =  function () {
    return new Promise((resolve, reject) => {
      let layers =  layersCollection.find({}).toArray((err, layers) => {
            err
            ? reject(err)
            : resolve(layers)
            console.log('layerB:', s)
            
        })
    })

}


module.exports = Layer