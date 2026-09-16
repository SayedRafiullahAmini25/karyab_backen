const NotificationModel = require('../models/Notification')

const createNotification = async ({ userId, title, message, type, jobId = null, applicationId = null }) => {
    if (!userId) return null

    try {
        return await NotificationModel.create({
            userId,
            title,
            message,
            type,
            jobId,
            applicationId
        })
    } catch (err) {
        console.log('createNotification:', err.message)
        return null
    }
}

const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user._id
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 30)
        const skip = (page - 1) * limit

        const filter = { userId }
        const [notifications, total, unreadCount] = await Promise.all([
            NotificationModel.find(filter)
                .populate('jobId', 'title status')
                .populate('applicationId', 'status job worker')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            NotificationModel.countDocuments(filter),
            NotificationModel.countDocuments({ userId, isRead: false })
        ])

        res.json({
            success: true,
            data: notifications,
            pagination: {
                page,
                limit,
                total,
                hasMore: skip + notifications.length < total
            },
            unreadCount
        })
    } catch (err) {
        console.log('getMyNotifications:', err.message)
        res.status(500).json({ success: false, message: 'خطا در دریافت اعلان‌ها' })
    }
}

const getUnreadCount = async (req, res) => {
    try {
        const count = await NotificationModel.countDocuments({
            userId: req.user._id,
            isRead: false
        })
        res.json({ success: true, count })
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطا در دریافت تعداد اعلان‌ها' })
    }
}

const markAsRead = async (req, res) => {
    try {
        const notification = await NotificationModel.findOneAndUpdate(
            { _id: req.params.notificationId, userId: req.user._id },
            { $set: { isRead: true } },
            { new: true }
        )

        if (!notification) {
            return res.status(404).json({ success: false, message: 'اعلان پیدا نشد' })
        }

        res.json({ success: true, data: notification })
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطا در خوانده‌شدن اعلان' })
    }
}

const markAllAsRead = async (req, res) => {
    try {
        await NotificationModel.updateMany(
            { userId: req.user._id, isRead: false },
            { $set: { isRead: true } }
        )
        res.json({ success: true, message: 'همه اعلان‌ها خوانده شدند' })
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطا در عملیات' })
    }
}

module.exports = {
    createNotification,
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
}
