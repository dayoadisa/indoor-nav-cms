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
const fs = require('fs')

var token

const data = fs.readFileSync('authToken.txt', 'utf8')
console.log('authToken:', data)
token = data

const BASE_URL = `https://api.vim.ai:5005`

exports.viewCreateForm = function ( req, res) {
  
    res.render('create-building', {name: req.user.firstName})
  
}

exports.viewEditForm = async function ( req, res) {

  try {
    let buildingData = await apiData.getApi()
    let buildings = buildingData.data
    let singleBuilding = buildings.find(building => building.buildingID === +req.params.id)

    res.render('edit-building', {name: req.user.firstName, singleBuilding})
  } catch (error) {
    console.log(error)
  }
 

}



exports.create = async function (req, res) {

  if(res.status === '401') {
    res.redirect('/')
  }

  try {
    let buildingData = await apiData.getApi()
    let buildings = buildingData.data
    let singleBuilding = buildings.find(building => building.buildingID === +req.params.id)

    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.location,
        limit: 1,
        autocomplete: true
      })
      .send();

    const {
      buildingID,
      areaID,
      alias,
      name,
      description,
      tags,
      features
    } = req.body;
    const [lng, lat, address] = response.body.features[0].geometry.coordinates;

    const data = { buildingID, areaID, alias, name, description, location: { lng, lat }, tags };

    //const results = await googleIdToken.getToken;
    //const token = results.headers.authorization;

    const config = {
      method: "POST",
      url: "https://api.vim.ai:5005/buildings",
      headers: {
        Authorization: token,
        "Content-Type": "application/json"
      },
      data
    };

    axios(config)
      .then(function (response) {
        console.log('Building was created successfully');
        //req.session.save(() => res.redirect(`/api/${req.params.id}`))
        res.redirect('/api')
      })
      .catch(function (error) {
        console.log(error);
      });

    
  } catch (error) {
    console.log(error);
  }
}

exports.edit = async function (req, res) {
  try {
    
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.location,
        limit: 1,
        autocomplete: true
      })
      .send();

    const {
      buildingID,
      areaID,
      alias,
      name,
      description,
      tags,
      features
    } = req.body;
    const [lng, lat] = response.body.features[0].geometry.coordinates;

    const data = { buildingID, areaID, alias, name, description, location: { lng, lat }, tags };

    //const results = await googleIdToken.login();
    //const token = results.headers.authorization;

    const config = {
      method: "PUT",
      url: `https://api.vim.ai:5005/buildings/${req.params.id}`,
      headers: {
        Authorization: token,
        "Content-Type": "application/json"
      },
      data
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        //req.session.save(() => res.redirect(`/api/${req.params.id}`))
        res.redirect('/api')
      })
      .catch(function (error) {
        console.log(error);
      });

    
  } catch (error) {
    console.log(error);
  }
}




exports.apiLocations = async function (req, res) {

  try {
          let buildingData = await apiData.getApi()
          //let googleAuth = await googleData.getApi()
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

exports.delete = async function (req, res) {

  try {
    //const results = await googleIdToken.login()
    //const token = results.headers.authorization
    

    const config = {
      method: 'delete',
      url: `https://api.vim.ai:5005/buildings/${req.params.id}`,
      headers: { 
        'Authorization': token, 
        'Content-Type': 'application/json'
      }
    };
    
    axios(config)
       .then(function (response) {
       console.log(JSON.stringify(response.data));
       res.redirect('/api')
    })
    .catch(function (error) {
      console.log(error);
    });
         
           
   } catch (error) {
    console.log(error)
   }

    // let deletedBuilding = buildings.find(building => building.buildingID === +req.params.id)
    // buildings = buildings.filter(building => building.buildingID !== +req.params.id);
    // res.render('api', {buildings: buildings, deletedBuilding: deletedBuilding})


}

exports.displayLocations = async function (req, res) {
  
  try {
    let buildingData = await apiData.getApi()
    let buildings = buildingData.data
    let posts = GeoJSON.parse(buildings, {'Point':  ['location.lat', 'location.lng'], exclude: ['location']});
    res.render('display-locations', {posts: posts, name: req.user.firstName, mapBoxToken: process.env.MAPBOX_TOKEN})
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


  
 