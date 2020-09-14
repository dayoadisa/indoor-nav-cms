const User = require('../models/User')
const Post = require('../models/Post')
const Layer = require('../models/Layer')
const passport = require('../config/passport')



exports.mustBeLoggedIn = function (req, res, next) {
    if (req.session) {
        next()
    } else {
        req.flash("errors", "You must be logged In to perform that action")
        req.session.save(function () {
            res.redirect('/')
        })
    }
}


exports.login = function (req, res) {
    let user = new User(req.body)
    user.login().then(function (result) {
        req.session.user = { avatar: user.avatar, username: user.data.username, _id: user.data._id }
        req.session.save(function () {
            res.redirect('/')
        })
    }).catch(function (e) {
        req.flash('errors', e)
        req.session.save(function () {
            res.redirect('/')
        })
    })
}

exports.googleLogin = function (req, res) {
    //let user = new User(req.session)
    console.log('session-user:', req.session)
    req.session.save(function () {
        res.redirect('/dashboard')
    })

    
}



exports.logout = function (req, res) {
     req.session.destroy(function () {
         res.redirect('/')
     })
    //req.logout()
    //res.redirect('/')
}

exports.viewRegisterScreen = function (req, res) {
    res.render('create-register', { errors: req.flash('errors'), regErrors: req.flash('regErrors') })

}

exports.viewProfile = function (req, res) {

    res.render('profile')

}

exports.register = function (req, res) {
    let user = new User(req.body)
    user.register().then(() => {
        req.session.user = { username: user.data.username, avatar: user.avatar, _id: user.data._id }
        req.session.save(function () {
            res.redirect('/')
        })
    }).catch((regErrors) => {
        regErrors.forEach(function (error) {
            req.flash('regErrors', error)
        })
        req.session.save(function () {
            res.redirect('create-register')
        })
    })
}

exports.home = function (req, res) {
    if (req.session.user) {
        res.render('vim-dashboard')
    } else {
        res.render('home-guest', { regErrors: req.flash('regErrors') })
    }
}

exports.dashboard = function (req, res) {
    res.render('dashboard', {
                name: req.user.firstName
            })
    // if (req.session) {
    //     res.render('dashboard', {
    //         name: req.user.firstName
    //     })
        
    //     console.log('session-user:', req.session)
    // } else {
    //     res.render('home-guest', { regErrors: req.flash('regErrors') })
    // }
}


exports.ifUserExists = function (req, res, next) {
    User.findByUsername(req.params.username).then(function (userDocument) {
        req.profileUser = userDocument
        next()
    }).catch(function () {
        res.render("404")
    })
}

exports.profilePostScreen = function (req, res) {
    
    //ask our post model for posts by a certain author id
    Post.findByAuthorId(req.profileUser._id).then(function (posts) {

        res.render('list-buildings', {
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar
        })
    }).catch(function () {

        res.render("404")
    })


}

exports.profileLayerScreen =  function (req, res) {

    
    
    //ask our layer model for layers(floors) created by a certain author id
    Layer.findByAuthorId(req.profileUser._id).then( function (layers) {
        
        res.render('layer-list', {
           
            layers: layers,
            post: req.profileUser._id,
            profileUsername: req.profileUser.username,
            //profileAvatar: req.profileUser.avatar
        })
        
      
    }).catch(function () {

        res.render("404")
    })

 


}

