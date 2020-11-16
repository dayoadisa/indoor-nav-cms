
const googleLogin = require('./googleToken')
const axios = require('axios')

const BASE_URL = `https://api.vim.ai:5005`


module.exports = {
    getApi: async function (buildingID, areaID, name, alias, description, location, tags) {
        try {
           
          
        
            //console.log('google-api:', token)
            
          //const result = await axios.post(BASE_URL + `/buildings`, config, params)
    
          return result
          
        } catch (error) {
            console.log(error)
        } 
    },
 
  
 }


