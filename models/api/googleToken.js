const fs = require('fs')
const axios = require('axios')

//const googleLogin = require('../../controllers/apiController')
const BASE_URL = `https://api.vim.ai:5005`


var token;



exports.getToken = async function (req, res) {
  try {

    const data = fs.readFileSync('token.txt', 'utf8')
    console.log('idToken:',data)
    token = data

    let response = await axios({
      method:"POST",
      url : BASE_URL + `/login`,
      headers: {
        "content-type": "application/json",
        "X-ID-TOKEN": token

      }
  })

  console.log('write-authToken:', response.headers.authorization)

  

  const authToken = response.headers.authorization

  fs.writeFile('authToken.txt', authToken, err => {
    if (err) {
      console.error(err)
      return
    }
    //file written successfully
    console.log("Authentication file written successfully")
  })

  res.redirect('/dashboard')
  
  } catch (error) {
    console.log(error)
  }
}
