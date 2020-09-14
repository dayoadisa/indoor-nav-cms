const postsCollection = require('../db').db().collection('posts')
const Post = require('../models/Post')
const Layer = require('../models/Layer')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const mapBoxToken = process.env.MAPBOX_TOKEN;



exports.viewCreateScreen = function (req, res) {
  res.render('create-post')
}



exports.viewLocations = async function (req, res) {
  
    try {
      let posts = await Post.findAll()
      console.log('results:', posts)
      res.render('locations', { posts: posts, mapBoxToken: process.env.MAPBOX_TOKEN })
      
      } catch {
      res.render('404')
    }
         
}



exports.create = async function (req, res) {

  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.address,
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
    req.session.save(() => res.redirect(`/post/${newId}`))
  }).catch(function (errors) {
    errors.forEach(error => req.flash("errors", error))
    req.session.save(() => res.redirect("/create-post"))
  })

}


exports.viewBuilding = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId)
    res.render('map', { post: post, mapBoxToken: process.env.MAPBOX_TOKEN })
  } catch {
    res.render('404')
  }
}



exports.viewEditScreen = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId)
    if (post.isVisitorOwner) {
      res.render("edit-post", { post: post })
    } else {
      req.flash("errors", "You do not have permission to perform that action.")
      req.session.save(() => res.redirect("/"))
    }
  } catch {
    res.render("404")
  }
}

exports.edit = async function (req, res) {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.address,
      limit: 1,
      autocomplete: true
    })
    .send()
  req.body.coordinates = response.body.features[0].geometry.coordinates

  let post = new Post(req.body, req.visitorId, req.params.id)
  post.update().then((status) => {
    // the post was successfully updated in the database
    // or user did have permission, but there were validation errors
    if (status == "success") {
      // post was updated in db
      req.flash("success", "Post successfully updated.")
      req.session.save(function () {
        res.redirect(`/post/${req.params.id}/edit`)
      })
    } else {
      post.errors.forEach(function (error) {
        req.flash("errors", error)
      })
      req.session.save(function () {
        res.redirect(`/post/${req.params.id}/edit`)
      })
    }
  }).catch(() => {
    // a post with the requested id doesn't exist
    // or if the current visitor is not the owner of the requested post
    req.flash("errors", "You do not have permission to perform that action.")
    req.session.save(function () {
      res.redirect("/")
    })
  })
}


exports.delete = function (req, res) {
  Post.delete(req.params.id, req.visitorId).then(() => {
    req.flash("success", "Post successfully deleted.")
    req.session.save(() => res.redirect(`/list-buildings/${req.session.user.username}`))
  }).catch(() => {
    req.flash("errors", "You do not have permission to perform that action.")
    req.session.save(() => res.redirect("/"))
  })
}

exports.search = function (req, res) {
  Post.search(req.body.searchTerm).then(posts => {
    res.json(posts)
  }).catch(() => {
    res.json([])
  })
}



 

