//const postsCollection = require('../db').db().collection('posts')
//const Post = require('../models/Post')
//const Layer = require('../models/Layer')
const apiData = require('../models/api/Api')
const Post = require('../models/api/PostApi')
const axios = require("axios");
var GeoJSON = require('geojson');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const mapBoxToken = process.env.MAPBOX_TOKEN;




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
          
          const page = +req.query.page;
          const pageSize = +req.query.pageSize;

          if (page && pageSize) {
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            //const pagBuild = buildings.slice(start, end);
            res.render('api', {buildings: buildings.slice(start, end), name: req.user.firstName})
          } else {
            res.render('api', {buildings, name: req.user.firstName});
          }

          
          
          console.log('location:', buildings)
             
      } catch  {
          res.render('404')
          
      }
  
         
}
 

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}

    if (endIndex < await model.countDocuments().exec()) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      results.results = await model.find().limit(limit).skip(startIndex).exec()
      res.paginatedResults = results
      next()
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}

exports.viewBuilding = async function(req, res) {
    try {
      let buildingData = await apiData.getApi()
      let buildings = buildingData.data
      let singleBuilding = buildings.find(building => building.buildingID === +req.params.id)
      res.render('api-map', {singleBuilding: singleBuilding, mapBoxToken: process.env.MAPBOX_TOKEN })
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
