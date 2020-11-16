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
  
  if (!req.user) {
   console.log("NO USER");
   res.redirect('/')
   return next();
 }
  // subtract current time from stored expiry_date and see if less than 5 minutes (300s) remain
 if (dayjs().subtract(req.user.expiryDate,  "s").format("X") > -3000) {
   
   // set the current users access and refresh token
  oauth2Client.setCredentials({
      id_token: req.user.idToken,
      access_token: req.user.accessToken,
     refresh_token: req.user.refreshToken,
     expiry_date: req.user.expiryDate
    });

     // request a new token
   oauth2Client.refreshAccessToken(function(err, tokens) {
     if (err) return next(err);
     
     //save the new token and expiry_date
     usersCollection.findOneAndUpdate(
       { "googleId": req.user.googleId },
       {$set:{
         "accessToken": tokens.access_token,
         "idToken": tokens.id_token,
         "expiryDate": tokens.expiry_date,
         "refreshToken": tokens.refresh_token
       }},
       { upsert: true },
      
     function(err, doc) {
      if (err) return next(err);
       next();
       }
    );
   });
 }
 next();
};