const moongoose = require('mongoose')
const connectDB = require('./config/db')
const User = require('./models/User')
const express = require('express')
const session = require('express-session')

const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const markdown = require('marked')
const csrf = require('csurf')
const app = express()
const cors = require('cors')
const path = require('path')
const morgan = require('morgan')
const passport = require('passport')
const bodyParser = require('body-parser')
const tokenValidator = require('./config/token_validator')
const dotenv = require('dotenv')


dotenv.config({ path: './config/config.env'})
connectDB()
//passport config
require('./config/passport')(passport)

let sessionOptions = session({
  secret: "Mindset is everything",
  store: new MongoStore({ client: require('./db') }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60, httpOnly: true }
})

app.use(sessionOptions)
app.use(flash())
app.use(cors());

//Create a new named format
morgan.token("custom", ":http-version (:method) :url => :status")
//use the new format by name
app.use(morgan("custom"))

app.use(function (req, res, next) {
  //make our markdown function available from within the ejs template
  res.locals.filterUserHTML = function (content) {
    return markdown(content)
  }



  //make all error and success flash messages available from all templates
  res.locals.errors = req.flash("errors")
  res.locals.success = req.flash("success")

  //make current user id available on the req object
  if (req.session.user) { req.visitorId = req.session.user._id } else { req.visitorId = 0 }

  //make user session available from within view template
  res.locals.user = req.session.user
  
  next()
})

//passport middleware
app.use(passport.initialize())
app.use(passport.session())

const router = require('./router')


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')


app.use('/', router)


//app.listen(process.env.PORT, console.log(`server is running on $`))

module.exports = app