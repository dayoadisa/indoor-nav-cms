const express = require('express')
const router = express.Router({mergeParams: true})
const multer = require('multer')
const upload = multer({ 'dest': 'uploads/' })
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const layerController = require('./controllers/layerController')
const User = require('./models/User')
const apiController = require('./controllers/apiController')
const passport = require('passport')
const {ensureAuth, ensureGuest} = require('./middleware/auth')
const {checkToken} = require('./config/token_validator')
//const {floors} = require('./controllers/layerController')
const googleToken = require('./models/api/googleToken')
const fs = require('fs')
//const {readFile} = require('./middleware/readFile')
// tell the router to use checkToken function
//router.use(checkToken)

//Api related routes
router.get('/api', ensureAuth, apiController.apiLocations)
router.get('/api/:id', apiController.viewBuilding)
router.post('/search', apiController.search)
router.get('/create-building', apiController.readFile, apiController.viewCreateForm)
router.get('/api/:id/edit',  apiController.viewEditForm)
router.post('/api/:id/edit',  apiController.edit)
router.post('/post-building',  apiController.create)
router.get('/display-locations', userController.mustBeLoggedIn, apiController.displayLocations)
router.post('/api/:id/delete', apiController.delete)

//API-Layer Controller
router.get('/layer', ensureAuth, layerController.buildings)
router.get('/layer/:id', layerController.viewBuilding)
router.get('/create-floor/:id',  layerController.viewCreateForm)



//google related routes
router.get('/auth/google',   passport.authenticate('google', { scope: ['profile', 'email'], accessType: 'offline', prompt: 'consent'}) )
router.get('/auth/google/callback',   passport.authenticate('google', { failureRedirect: '/'}), googleToken.getToken
) 

router.get('/dashboard', ensureAuth, userController.dashboard )

//user related routes
router.get('/',  ensureGuest, userController.home )
router.get('/create-register', userController.viewRegisterScreen)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

//profile related routes
router.get('/profile', apiController.profile)
router.get('/layer-list/:username', userController.ifUserExists, userController.profileLayerScreen)








module.exports = router





