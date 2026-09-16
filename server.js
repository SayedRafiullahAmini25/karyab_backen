
const express = require('express')
const app = express()
const cors = require('cors')
const mongoos = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const port = process.env.PORT || 5000

//connect to database
mongoos.connect(process.env.MONGO_URI)
.then(()=> app.listen(port, '0.0.0.0' , ()=> console.log(`mongo is connected and server is running on port ${port}`)))
.catch(err => console.log('this is error : ' + err))

async function serverState() {
    const response = await fetch("https://upload.imagekit.io");
console.log(response.status);
}

serverState()

//api configs
app.use(express.urlencoded({extended : false}))
app.use(express.json())
app.use(cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
}))

app.get('/' , (req, res) => res.send('api is working...'))

const apiRouter = require('./routes/index')

// //routes
app.use('/api', apiRouter)



