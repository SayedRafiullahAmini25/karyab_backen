const express = require('express')
const ApplicationController = require('../../controllers/ApplicationController')
const Auth = require('../../middlewares/Auth')
const Router = express.Router()

Router.post('/create', Auth, ApplicationController.createApplication)
Router.patch('/:applicationId/reject', Auth, ApplicationController.rejectRequest)
Router.patch('/:applicationId/accept', Auth, ApplicationController.acceptRequest)

module.exports = Router