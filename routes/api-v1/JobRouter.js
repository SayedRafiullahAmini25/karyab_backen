const express = require('express')
const JobController = require('../../controllers/JobController')
const Auth = require('../../middlewares/Auth')
const Router = express.Router()

Router.post('/create', Auth, JobController.createJob)
Router.get('/list', JobController.getListOfJobs)
Router.get('/:jobId/applications', JobController.getApplications)
Router.patch('/:jobId/complete', Auth, JobController.completeJob)

module.exports = Router
