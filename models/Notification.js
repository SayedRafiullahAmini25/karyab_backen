const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    type: {
        type: String,
        enum: [
            'NEW_JOB',
            'NEW_APPLICATION',
            'APPLICATION_ACCEPTED',
            'APPLICATION_REJECTED',
            'JOB_COMPLETED'
        ],
        default: 'NEW_JOB'
    },
    message: { type: String, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Applications', default: null },
    isRead: { type: Boolean, default: false, index: true }
}, { timestamps: true })

NotificationSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', NotificationSchema)
