const UserModel = require('../models/User')
const JobModel = require('../models/Job')
const ApplicationModel = require('../models/Application')

const list = async (req, res) => {
    try {
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 30)
        const skip = (page - 1) * limit
        const search = String(req.query.search || '').trim()

        const filter = { role: 'worker' }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { job: { $regex: search, $options: 'i' } },
                { province: { $regex: search, $options: 'i' } },
                { district: { $regex: search, $options: 'i' } }
            ]
        }

        const [workers, total] = await Promise.all([
            UserModel.find(filter).sort({ rate: -1, createdAt: -1 }).skip(skip).limit(limit),
            UserModel.countDocuments(filter)
        ])

        res.json({
            success: true,
            data: workers,
            pagination: { page, limit, total, hasMore: skip + workers.length < total }
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: 'خطا در دریافت اطلاعات' })
    }
}

const rateWorker = async (req, res) => {
    const workerId = req.params?.workerId
    const employerId = req?.user?._id
    const { jobId, rate } = req.body

    try {
        const numericRate = Number(rate)
        if (!jobId || !workerId || !Number.isFinite(numericRate) || numericRate < 1 || numericRate > 5) {
            return res.json({ success: false, message: 'اطلاعات امتیازدهی نادرست است' })
        }

        const job = await JobModel.findOne({ _id: jobId, createdBy: employerId, status: 'completed' })
        if (!job) return res.json({ success: false, message: 'کار ختم‌شده مربوط به شما پیدا نشد' })

        const application = await ApplicationModel.findOne({ job: jobId, worker: workerId, status: 'accept' })
        if (!application) return res.json({ success: false, message: 'این کارگر برای این کار انتخاب نشده است' })

        const worker = await UserModel.findOne({ _id: workerId, role: 'worker' })
        if (!worker) return res.json({ success: false, message: 'کارگر پیدا نشد' })

        worker.rate = (numericRate + Number(worker.rate || 0)) / 2
        await worker.save()

        res.json({ success: true, message: 'امتیاز با موفقیت ثبت شد', rate: numericRate })
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: 'خطایی در ثبت امتیاز رخ داد' })
    }
}

module.exports = { list, rateWorker }
