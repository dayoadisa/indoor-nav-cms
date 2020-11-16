const apiLogin = require('./login');
const apiData = require('./Api');
const axios = require('axios')



let Post = function (data) {
    this.data = data
    this.errors = []
   
    
}


Post.prototype.cleanUp = function () {
    if (typeof (this.data.name) != "string") { this.data.name = "" }
    if (typeof (this.data.alias) != "string") { this.data.alias = "" }
    if (typeof (this.data.description) != "string") { this.data.description = "" }
    if (typeof (this.data.areaID) != "number") { this.data.areaID = "" }
    if (typeof (this.data.buildingID) != "number") { this.data.buildingID = "" }
    
    //get rid of bogus properties
    this.data = {
        buildingID: this.data.buildingID,
        areaID: this.data.areaID,
        alias: this.data.alias,
        name: this.data.name.trim(),
        description: this.data.description.trim(),
        
                
              
        
    
        tags: []
    }
    
    
}




Post.prototype.validate = function () {
    if (this.data.name == "") { this.errors.push("You must provide building name") }
    if (this.data.alias == "") { this.errors.push("You must provide an alias for this building") }
    
}

const BASE_URL = `https://api.vim.ai:5005`


Post.prototype.create = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (this.errors.length) {
            reject(this.errors) 
        }

        try {
            
            const results = await apiLogin.login()
            const token = results.headers.authorization
            const config = { 
                headers: { 
                    Authorization: token
                 },
                 params: {
                    buildingID: this.data.buildingID,
                    areaID: this.data.areaID,
                    alias: this.data.alias,
                    name : this.data.name,
                    description: this.data.description,
                    location: { 
                    coordinates: this.data.coordinates
                },
                    tags: this.data.tags
                }
            }
            

          const posts = await axios.post(BASE_URL + `/buildings`, config)
    
          resolve (posts)
          
        } catch (error) {
            console.log(error)
        } 
    })
}

// module.exports = {
//     create: async function (buildingID, areaID, alias, name, description, location, tags) {
//         try {
            
//             const results = await apiLogin.login()
//             const token = results.headers.authorization
//             const config = { 
//                 headers: { 
//                     Authorization: token
//                  },
//                  params: {
//                     buildingID: this.data.buildingID,
//                     areaID: this.data.areaID,
//                     alias: this.data.alias,
//                     name : this.data.name,
//                     description: this.data.description,
//                     location:  this.data.coordinates,
//                     tags
//                 }
//             }
            

//           const post = await axios.post(BASE_URL + `/buildings`, config)
    
//           return post
          
//         } catch (error) {
//             console.log(error)
//         } 
//     }
 
     
//  }

Post.search = function (searchTerm) {
    return new Promise(async (resolve, reject) => {
        let buildingData = await apiData.getApi()
        let buildings = buildingData.data
        if (typeof (searchTerm) == "string") {
            let posts = buildings.filter(building => {
                const regex = new RegExp(`^${searchTerm}`, 'gi')
                return building.name.match(regex) || building.alias.match(regex)
            })
            //console.log('postapi:', posts)
            resolve(posts)
        } else {
            reject()
        }
    })
}



 module.exports = Post