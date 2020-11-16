const apiLogin = require('./login');
const googleLogin = require('./googleToken')
const axios = require('axios')

const BASE_URL = `https://api.vim.ai:5005`

module.exports = {
    getApi: async function () {
        try {
           
            const results = await apiLogin.login()
            const token = results.headers.authorization
            const config = { headers: { Authorization: token } }
            
          const result = await axios.get(BASE_URL + `/buildings`, config)
    
          return result
          
        } catch (error) {
            console.log(error)
        } 
    },
 
  
 }

 
 




