const dotenv = require('dotenv')
dotenv.config()
const usersCollection = require('../db').db().collection('users')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')
const moment = require("moment");




module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        accessType: 'offline',
        
        callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    
     async (accessToken, refreshToken, params, profile, done) => {
           console.log('profile:', profile)
           console.log('idToken:', params)
           // find expiry_date so it can be save in the database, along with access and refresh token
            // expiry_date = moment().add(params.expires_in, "s").format("X");
            //console.log('id-token:',params)
            const newUser = {
                googleId: profile.id,
                displayName: profile.displayName,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                image: profile.photos[0].value,
                //params: params
            }
                try {
                    let user = await usersCollection.findOne({ googleId: profile.id})
                            if (user) {
                                done(null, user)
                            } else {
                                user = await usersCollection.insertOne(newUser)
                                done(null, user)
                            }
                        } catch (error) {
                            console.error(error)
                    }

                }
            )
        )
        
        passport.serializeUser(function(user, done) {
            done(null, user);
          });
          
          passport.deserializeUser(function(user, done) {
            done(null, user);
          });

          
          
}
