// //const User = require("../models/users.js");
// const usersCollection = require('../db').db().collection('users')
// const {google} = require("googleapis");
// const auth = require("../config/auth");
// const OAuth2 = google.auth.OAuth2;
// const moment = require("moment");

// // create auth client
// const oauth2Client = new OAuth2(
//   auth.googleAuth.clientID,
//   auth.googleAuth.clientSecret,
//   auth.googleAuth.callbackURL
// );



// exports.checkToken = (req, res, next) => {
//   // check for user
//   if (!req.user) {
//     return next();
//   }
//   // subtract current time from stored expiry_date and see if less than 5 minutes (300s) remain
//   if (moment().subtract(req.params.expiry_date, "s").format("X") > -300) {
    
//     // set the current users access and refresh token
//     oauth2Client.setCredentials({
//       access_token: req.params.access_token,
//       refresh_token: req.params.refreshToken
//     });

//      // request a new token
//     oauth2Client.refreshAccessToken(function(err, tokens) {
//       if (err) return next(err);
      
//       //save the new token and expiry_date
//       usersCollection.findOneAndUpdate(
//         { "google.id": req.user.google.id },
//         {
//           "google.token": tokens.access_token,
//           "google.expiry_date": tokens.expiry_date
//         },
//         {
//           new: true,
//           runValidators: true
//         },
//         function(err, doc) {
//           if (err) return next(err);
//           next();
//         }
//       );
//     });
//   }
//   next();
// };