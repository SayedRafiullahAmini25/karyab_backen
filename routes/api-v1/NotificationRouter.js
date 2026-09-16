const express = require('express')
const NotificationServices = require('../../services/Notification')
const Auth = require('../../middlewares/Auth')
const Router = express.Router()

Router.get('/list', Auth, NotificationServices.getMyNotifications)
Router.get('/unread-count', Auth, NotificationServices.getUnreadCount)
Router.patch('/:notificationId/read', Auth, NotificationServices.markAsRead)
Router.patch('/read-all', Auth, NotificationServices.markAllAsRead)

module.exports = Router
