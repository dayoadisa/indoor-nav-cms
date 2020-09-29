// //const User = require("../models/users.js");
const usersCollection = require('../db').db().collection('users')
const {google} = require("googleapis");
const auth = require("./auth");
const OAuth2 = google.auth.OAuth2;
const dayjs = require('dayjs')
var relativeTime = require('dayjs/plugin/relativeTime')
var advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)


 // create auth client
    const oauth2Client = new OAuth2(
    auth.googleAuth.clientID,
    auth.googleAuth.clientSecret,
    auth.googleAuth.callbackURL
 );


 exports.checkToken = (req, res, next) => {
   // check for user
   if (!usersCollection.user) {
    console.log("NO USER");
     
  }
   // subtract current time from stored expiry_date and see if less than 5 minutes (300s) remain
  if (dayjs().subtract(usersCollection.req.user.expiry_date,  "s").format("X") > -300) {
    
    // set the current users access and refresh token
   oauth2Client.setCredentials({
       id_token: req.user.params.id_token,
       access_token: req.user.params.access_token,
      //refresh_token: req.params.refreshToken
     });

      // request a new token
    oauth2Client.refreshAccessToken(function(err, tokens) {
      if (err) return next(err);
      
      //save the new token and expiry_date
      usersCollection.findOneAndUpdate(
        { "googleId": req.user.googleId },
        {
          "access_token": tokens.access_token,
          "id_token": tokens.id_token,
          "expiry_date": tokens.expiry_date
        },
       {
         new: true,
         runValidators: true
      },
      function(err, doc) {
       if (err) return next(err);
        next();
        }
     );
    });
  }
  next();
 };

