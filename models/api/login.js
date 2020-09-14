const axios = require("axios");


const BASE_URL = `https://api.vim.ai:5005`

module.exports = {
   login: () => axios({
        method:"POST",
        url : BASE_URL + `/login`,
        headers: {
          "content-type": "application/json",
          "X-API-KEY": process.env.API_KEY
        }
    }),

    
}