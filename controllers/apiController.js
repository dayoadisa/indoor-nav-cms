//const postsCollection = require('../db').db().collection('posts')
//const Post = require('../models/Post')
//const Layer = require('../models/Layer')
const passportData = require('../config/passport')
const apiData = require('../models/api/Api')
const Post = require('../models/api/PostApi')
const axios = require("axios");
var GeoJSON = require('geojson');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const mapBoxToken = process.env.MAPBOX_TOKEN;
//const token_validator = require('../config/token_validator')




exports.viewCreateForm = function (req, res) {
  res.render('create-building')
}

exports.create = async function (req, res) {

  
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.location,
      limit: 1,
      autocomplete: true
    })
    .send()
  req.body.coordinates = response.body.features[0].geometry.coordinates


  let post = new Post(req.body, req.session.user._id)
  console.log("post:",post)
  console.log(post.coordinates)
  post.create().then(function (newId) {
    req.flash("success", "New post successfully created.")
    req.session.save(() => res.redirect(`/api/${newId}`))
  }).catch(function (errors) {
    errors.forEach(error => req.flash("errors", error))
    req.session.save(() => res.redirect("/create-building"))
  })
  
  
}


exports.apiLocations = async function (req, res) {

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
         
          res.render('api', 
        {
              buildings: buildings.slice(start, end),
              pageSize: pageSize,
              pageCount: pageCount,
              currentPage: currentPage,
              name: req.user.firstName
        }
      );
           

         
             
      } catch  {
          res.render('404')
          
      }
  
         
}
 
exports.viewBuilding = async function(req, res) {
    try {
      let buildingData = await apiData.getApi()
      let buildings = buildingData.data
      let singleBuilding = buildings.find(building => building.buildingID === +req.params.id)
      res.render('api-map', {singleBuilding: singleBuilding, mapBoxToken: process.env.MAPBOX_TOKEN, name: req.user.firstName })
      console.log('location:', singleBuilding)
    } catch {
      res.render('404')
    }
  
}

exports.displayLocations = async function (req, res) {
  
  try {
    let buildingData = await apiData.getApi()
    let buildings = buildingData.data
    let posts = GeoJSON.parse(buildings, {'Point':  ['location.lat', 'location.lng'], exclude: ['location']});
    res.render('display-locations', {posts: posts, mapBoxToken: process.env.MAPBOX_TOKEN})
    console.log('location:', posts)
       
} catch (error)  {
    //res.render('404')
    console.log(error)
}
       
}

exports.search = async function (req, res) {
  try {
    let buildingData = await apiData.getApi()
    let buildings = buildingData.data
    //console.log('buildings:', buildings)
    Post.search(req.body.searchTerm).then(posts => {
      res.json(posts)
    }).catch(() => {
      res.json([])
    })
  } catch (error) {
    
  }
  
}