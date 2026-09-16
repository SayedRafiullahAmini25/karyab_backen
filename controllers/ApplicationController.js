const ApplicationModel = require('../models/Application')
const JobModel = require('../models/Job')
const NotificationServices = require('../services/Notification')

const createApplication = async (req, res) => {
    const user = req.user
    try {
        if (user.role === 'employer') return res.json({ message: 'فقط کارگرها میتوانند درخواست کاری بدهند', success: false })
        const { jobId } = req.body
        const job = await JobModel.findById(jobId)
        if (!job) return res.json({ success: false, message: 'کار پیدا نشد' })
        if (job.status === 'completed') return res.json({ success: false, message: 'این کار تمام شده است' })

        const existApplication = await ApplicationModel.findOne({ worker: user._id, job: jobId })
        if (existApplication) return res.json({ success: false, message: 'شما قبلا برای این کار درخواست داده بودید' })

        const newApplication = await ApplicationModel.create({ job: jobId, worker: user._id })

        await NotificationServices.createNotification({
            userId: job.createdBy,
            title: 'درخواست برای کار',
            message: `${user.name} (${user.job}) برای کار شما (${job.title}) درخواست داد`,
            type: 'NEW_APPLICATION',
            jobId,
            applicationId: newApplication._id
        })

        res.json({ message: 'درخواست شما موفقانه ثبت شد', success: true })
    } catch (err) {
        res.status(500).json({ message: 'خطایی رخ داد!', err: err.message, success: false })
    }
}

const rejectRequest = async (req, res) => {
    const applicationId = req.params?.applicationId
    const employerId = req.user._id
    try {
        const application = await ApplicationModel.findById(applicationId).populate('job', 'title createdBy')
        if (!application) return res.json({ success: false, message: 'درخواست پیدا نشد' })
        if (String(application.job.createdBy) !== String(employerId)) return res.json({ success: false, message: 'شما صاحب این کار نمیباشید' })
        if (application.status !== 'pending') return res.json({ success: false, message: 'این درخواست قبلاً بررسی شده است' })

        application.status = 'rejected'
        await application.save()

        await NotificationServices.createNotification({
            userId: application.worker,
            title: 'درخواست شما رد شد',
            message: `درخواست شما برای کار (${application.job.title}) رد شد`,
            type: 'APPLICATION_REJECTED',
            jobId: application.job._id,
            applicationId: application._id
        })

        res.json({ success: true, message: 'موفقانه رد کردید' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: 'خطایی رخ داد' })
    }
}

const acceptRequest = async (req, res) => {
    const applicationId = req.params?.applicationId
    const employerId = req.user._id
    const { jobId } = req.body
    try {
        const application = await ApplicationModel.findById(applicationId).populate('job', 'title createdBy')
        if (!application) return res.json({ success: false, message: 'درخواست پیدا نشد' })
        if (jobId && String(application.job._id) !== String(jobId)) return res.json({ success: false, message: 'کار نادرست است' })
        if (String(application.job.createdBy) !== String(employerId)) return res.json({ success: false, message: 'شما صاحب این کار نمیباشید' })
        if (application.status !== 'pending') return res.json({ success: false, message: 'این درخواست قبلاً بررسی شده است' })

        application.status = 'accept'
        await application.save()

        const rejected = await ApplicationModel.find({
            job: application.job._id,
            _id: { $ne: application._id },
            status: 'pending'
        })
        await ApplicationModel.updateMany(
            { job: application.job._id, _id: { $ne: application._id }, status: 'pending' },
            { $set: { status: 'rejected' } }
        )

        await NotificationServices.createNotification({
            userId: application.worker,
            title: 'قبول شدن درخواست',
            message: `درخواست شما در کار (${application.job.title}) قبول شد. به‌زودی صاحب کار با شما تماس خواهد گرفت.`,
            type: 'APPLICATION_ACCEPTED',
            jobId: application.job._id,
            applicationId: application._id
        })

        await Promise.all(rejected.map(item => NotificationServices.createNotification({
            userId: item.worker,
            title: 'درخواست شما رد شد',
            message: `درخواست شما برای کار (${application.job.title}) رد شد`,
            type: 'APPLICATION_REJECTED',
            jobId: application.job._id,
            applicationId: item._id
        })))

        res.json({ success: true, message: 'موفقانه قبول کردید' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: 'خطایی رخ داد' })
    }
}

module.exports = { createApplication, rejectRequest, acceptRequest }
