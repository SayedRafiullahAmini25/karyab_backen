const express = require('express')
const Router = express.Router()
const UserRouter  = require('./api-v1/UserRouter')
const JobRouter = require('./api-v1/JobRouter')
const WorkerRouter = require('./api-v1/WorkerRouter')
const ApplicationRouter = require('./api-v1/ApplicationRouter')
const NotificationRouter = require('./api-v1/NotificationRouter')

Router.use('/v1/user', UserRouter)
Router.use('/v1/job', JobRouter)
Router.use('/v1/worker', WorkerRouter)
Router.use('/v1/application', ApplicationRouter)
Router.use('/v1/notification', NotificationRouter)

module.exports = Router