const mongoose = require('mongoose')

const connectDB = async () => {
     try {
         const conn = await mongoose.connect(process.env.CONNECTIONSTRING, {
             useNewUrlParser: true,
             useUnifiedTopology: true,
             useFindAndModify: false
         })
         console.log(`MongoDB Connected: ${conn.connection.host}`)
     } catch (error) {
         console.error(error)
         process.exit(1)
     }
 }

 module.exports = connectDB