const passportData = require('../config/passport')
const apiData = require('../models/api/Api')
const googleData = require('../models/api/googleapi')
const apiLogin = require('../models/api/login');
const googleIdToken = require('../models/api/googleToken')
const Post = require('../models/api/PostApi')
const axios = require("axios");
var GeoJSON = require('geojson');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const passport = require('../config/passport');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const mapBoxToken = process.env.MAPBOX_TOKEN;
const fs = require('fs');
const { viewBuilding } = require('./postController');

const BASE_URL = `https://api.vim.ai:5005`

//let floorCount

exports.buildings = async function (req, res) {

  try {
         
          let buildingData = await apiData.getApi()
          let buildings = buildingData.data
           
       
          let currentPage = 1
          const totalPages = buildings.length
          const page = +req.query.page;
          const pageSize = 10;
          const pageCount = Math.ceil(totalPages / pageSize);
          
          
          if(req.query.page) {
            currentPage = parseInt(req.query.page, 10);
          }

          const start = (currentPage - 1) * pageSize;
          const end = currentPage * pageSize;

         const floorCount =  viewBuilding()
         floorCount.then(function(floor) {
           console.log('f:', floor)
         })
         
       //let countFloor = floorCount
          res.render('layer', 
        {
              buildings: buildings.slice(start, end),
              pageSize: pageSize,
              pageCount: pageCount,
              currentPage: currentPage,
              //floor: floor,
              name: req.user.firstName
        }
      );
           

         
             
      } catch  {
          res.render('404')
          
      }
  
         
}


exports.viewBuilding = async function(req, res) {
  try {
    const results = await apiLogin.login()
    const token = results.headers.authorization
    const config = { headers: { Authorization: token } }
    let buildingData = await apiData.getApi()
    let buildings = buildingData.data
    let singleBuilding = buildings.find(building => building.buildingID === +req.params.id)
    //console.log(singleBuilding)
   
    const result = await axios.get(BASE_URL + `/buildings/` + singleBuilding.buildingID + `/areas/`, config)
     floorCount = result.data.length
    console.log(floorCount)
    const floors = result.data
    //return floorCount
    res.render('single-layer', {singleBuilding: singleBuilding, 
      mapBoxToken: process.env.MAPBOX_TOKEN, 
      name: req.user.firstName,
      floors: floors
     })

     
    console.log('floors:', result.data)
  } catch {
    res.render('404')
  }

}






// cloudinary.config({
//   cloud_name: 'dcu4avexf',
//   api_key: '975771826326426',
//   api_secret: process.env.CLOUDINARY_SECRET
// })


// exports.viewCreateLayer = async function (req, res) {
 
//   try {
//     let post = await Post.findSingleById(req.params.id, req.visitorId)
//     res.render('create-layer', { post: post })
//   } catch {
//     res.render('404')
//   }
// }


// exports.createLayer = async function(req, res) {
//   let response = await geocodingClient
//     .forwardGeocode({
//       query: req.body.address,
//       limit: 1,
//       autocomplete: true
//     })
//     .send()
//   req.body.coordinates = response.body.features[0].geometry.coordinates

//   req.body.images = []
//   for(const file of req.files) {
//     let image = await cloudinary.v2.uploader.upload(file.path)
//     req.body.images.push({
//       url: image.secure_url,
//       public_id: image.public_id
//     })
//   }

//   let layer = new Layer(req.body, req.session.user._id, req.params.id, req.visitorId)
  
//   layer.create().then((newId) => {
//       req.flash("success", "New Floor successfully created")
//       req.session.save(() => res.redirect(`/layer/${newId}`))
//   }).catch(function (errors) {
//     errors.forEach(error => req.flash("errors", error))
//     req.session.save(() => res.redirect(`/layer/create-layer`))
//   })
  
  
// }

// exports.addMoreLayer = async function(req, res) {
  
  
// }






// exports.viewSingle = async function (req, res) {

  
//    try {
//      let layers = await Layer.findSingleById(req.params.id, req.visitorId)
      
//       res.render('single-layer', {  layers: layers, post: req.params.id, mapBoxToken: process.env.MAPBOX_TOKEN})
     
     
//    } catch {
//      res.render('404')
//    } 
// }

// exports.viewBuildingLayers = function (req, res) {

// }

// exports.viewEditLayer = async function(req, res) {
  
//   try {
//     let layer = await Layer.findSingleById(req.params.id, req.visitorId)
//     if (layer.isVisitorOwner) {
//       res.render("edit-layer", { layer: layer, post: req.params.id })
//     } else {
//       req.flash("errors", "You do not have permission to perform that action.")
//       req.session.save(() => res.redirect("/"))
//     }
    
//   } catch {
//     res.render('404')
//   } 
// }



// exports.edit = async function (req, res) {
//   let response = await geocodingClient
//     .forwardGeocode({
//       query: req.body.address,
//       limit: 1,
//       autocomplete: true
//     })
//     .send()
//   req.body.coordinates = response.body.features[0].geometry.coordinates

//   // check if there are new images for upload
//   //req.body.images = []
//   if(req.files) {
//     //upload images
//     for(const file of req.files) {
//       let image = await cloudinary.v2.uploader.upload(file.path)
//       req.body.images.push({
//         url: image.secure_url,
//         public_id: image.public_id
//       })
//     }
//   }
  
//   //find layer the to delete
  
//   let layer = new Layer(req.body, req.visitorId, req.params.id)
//   layer.update().then((status) => {
//     // the post was successfully updated in the database
//     // or user did have permission, but there were validation errors
//     if (status == "success") {
//       // post was updated in db
//       req.flash("success", "Post successfully updated.")
//       req.session.save(function () {
//         res.redirect(`/layer/${req.params.id}/edit`)
//       })
//     } else {
//       layer.errors.forEach(function (error) {
//         req.flash("errors", error)
//       })
//       req.session.save(function () {
//         res.redirect(`/layer/${req.params.id}/edit`)
//       })
//     }
//   }).catch(() => {
//     // a post with the requested id doesn't exist
//     // or if the current visitor is not the owner of the requested post
//     req.flash("errors", "You do not have permission to perform that action.")
//     req.session.save(function () {
//       res.redirect("/")
//     })
//   })
 
// }
