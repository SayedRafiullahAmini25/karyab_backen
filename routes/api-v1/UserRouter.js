const express = require('express')
const UserController = require('../../controllers/UserController')
const Router = express.Router()
const ImageUpload = require('../../middlewares/Upload')
const Auth = require('../../middlewares/Auth')


Router.post('/login', UserController.login)
Router.post('/signup', ImageUpload.any() ,UserController.signup)
Router.post('/getLoggedInUser',Auth ,UserController.getLoggedInUser)
Router.post('/list',Auth ,UserController.getAllUsers)


module.exports = Router