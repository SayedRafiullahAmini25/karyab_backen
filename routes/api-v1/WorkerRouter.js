const express = require('express')
const WorkerController = require('../../controllers/WorkerController')
const Auth = require('../../middlewares/Auth')
const Router = express.Router()

Router.get('/list', WorkerController.list)
Router.patch('/:workerId/rate', Auth, WorkerController.rateWorker)

module.exports = Router
