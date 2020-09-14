const dotenv = require('dotenv')
dotenv.config()
const mongodb = require('mongodb')
//const mongoose = require('mongoose')


mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
     module.exports = client
     const app = require('./app')
    app.listen(process.env.PORT)
 })

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.CONNECTIONSTRING, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             useFindAndModify: false
//         })
//         console.log(`MongoDB Connected: ${conn.connection.host}`)
//     } catch (error) {
//         console.error(error)
//         process.exit(1)
//     }
// }

// module.exports = connectDB