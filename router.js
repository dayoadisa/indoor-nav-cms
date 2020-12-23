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
// tell the router to use checkToken function
//router.use(checkToken)

//Api related routes
router.get('/api', ensureAuth, apiController.apiLocations)
router.get('/api/:id', apiController.viewBuilding)
router.post('/search', apiController.search)
router.get('/create-building', checkToken,  apiController.viewCreateForm)
router.get('/api/:id/edit',  apiController.viewEditForm)
router.post('/api/:id/edit',  apiController.edit)
router.post('/post-building', apiController.create)
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

//post related routes
//router.get('/create-building', userController.mustBeLoggedIn, postController.viewCreateScreen)
router.post('/create-building', userController.mustBeLoggedIn, postController.create)
//router.post('/search', postController.search)
router.get('/locations', userController.mustBeLoggedIn, postController.viewLocations)
router.get('/post/:id', postController.viewBuilding)
router.get('/post/:id/edit', postController.viewEditScreen)
router.post('/post/:id/edit', userController.mustBeLoggedIn, postController.edit)
router.post('/post/:id/delete', userController.mustBeLoggedIn, postController.delete)
router.get('/list-buildings/:username', userController.mustBeLoggedIn, userController.ifUserExists, userController.profilePostScreen)


//layer related routes
// router.get('/post/:id/layer/create-layer',   layerController.viewCreateLayer)
// router.get('/layer/:id',  layerController.viewSingle)
// router.get('/post/:id/layer/:id',  layerController.viewBuildingLayers)
// router.post('/layer/create-layer', upload.array('images', 10), userController.mustBeLoggedIn, layerController.createLayer)
// router.post('/layer/:id/add-more-layer', upload.array('images', 10), userController.mustBeLoggedIn, layerController.addMoreLayer)
// router.get('/layer/:id/edit', userController.mustBeLoggedIn, layerController.viewEditLayer)
// router.post('/layer/:id/edit', userController.mustBeLoggedIn, upload.array('images', 10), layerController.edit)



module.exports = router





