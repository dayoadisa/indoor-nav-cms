const dotenv = require('dotenv')
dotenv.config()
const User = require('../models/User')
//const usersCollection = require('../db').db().collection('users')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const fs = require('fs')
const dayjs = require('dayjs')
var relativeTime = require('dayjs/plugin/relativeTime')
var advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)




module.exports = function (passport) {

    passport.serializeUser(function(user, done) {
        done(null, user);
      });
      
      passport.deserializeUser(function(user, done) {
        done(null, user);
      });
     
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        
        callbackURL: 'http://localhost:8000/auth/google/callback'
    },
    
 async (accessToken, refreshToken, params, profile, done) => {
           //console.log('profile:', profile)
           console.log('refresh:', refreshToken)
           const idToken = params.id_token

           fs.writeFile('token.txt', idToken, err => {
            if (err) {
              console.error(err)
              return
            }
            //file written successfully
            console.log("file written successfully")
          })
           
           // find expiry_date so it can be save in the database, along with access and refresh token
          const expiry_date = dayjs().add(params.expires_in, "s").format("X");
          console.log('expiry:',expiry_date)
            
            const newUser = {
                googleId: profile.id,
                displayName: profile.displayName,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                image: profile.photos[0].value,
                accessToken: params.access_token,
                idToken: params.id_token,
                expiryDate: expiry_date,
                refreshToken: refreshToken
            }
                try {
                    let user = await User.findOne({ googleId: profile.id})
                            if (user) {
                                done(null, user)
                                
                            } else {
                                user = await User.create(newUser)
                                done(null, user)
                            }
                        } catch (error) {
                            console.error(error)
                    }
                    
                }
            )
        )
        
        
         
          
}
