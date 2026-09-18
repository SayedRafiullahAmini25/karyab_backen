const JobModel = require("../models/Job");
const ApplicationModel = require("../models/Application");
const NotificationServices = require("../services/Notification");
const UserModel = require("../models/User");

const createJob = async (req, res) => {
  const { title, description, category, location, salary } = req.body;
  const coverImage = `${category}.jpg`;
  const user = req.user;

  try {
    if (
      [title, description, category, location, salary].some(
        (value) =>
          value === undefined || value === null || String(value).trim() === "",
      )
    ) {
      return res.json({
        success: false,
        message: "لطفا تمام موارد بالا را پر کنید",
      });
    }

    const job = await JobModel.create({
      title,
      createdBy: user._id,
      description,
      category,
      location,
      salary,
      coverImage,
    });

    const relatedUsers = await UserModel.find({
      role: "worker",
      job: category,
    }).select("_id");
    relatedUsers.length > 0 && relatedUsers.map(async (worker) =>
     await NotificationServices.createNotification({
        userId: worker._id,
        title: "اعلان کار جدید",
        message: `کار جدید در زمینه ${category} به نشر رسید`,
        type: "NEW_JOB",
        jobId: job._id,
      }),
    );

    res.json({ success: true, message: "کار با موفقیت به نشر رسید!" });
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
};

const getListOfJobs = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
      30,
    );
    const skip = (page - 1) * limit;
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "همه") filter.category = category;

    const [jobs, total] = await Promise.all([
      JobModel.find(filter)
        .populate("createdBy", "name phone profileImage role createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      JobModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: { page, limit, total, hasMore: skip + jobs.length < total },
    });
  } catch (err) {
    res.status(500).json({ message: "خطای رخ داد!", success: false });
  }
};

const completeJob = async (req, res) => {
  const jobId = req.params?.jobId;
  const { workerId } = req.body;
  const userId = req?.user?._id;

  try {
    if (!workerId)
      return res.json({
        success: false,
        message: "کارگر انتخاب شده مشخص نیست",
      });

    const job = await JobModel.findOne({ _id: jobId, createdBy: userId });
    if (!job)
      return res.json({ success: false, message: "شما صاحب این کار نمیباشید" });
    if (job.status === "completed")
      return res.json({ success: false, message: "این کار قبلاً ختم شده است" });

    const application = await ApplicationModel.findOne({
      job: jobId,
      worker: workerId,
      status: "accept",
    });
    if (!application)
      return res.json({
        success: false,
        message: "این کارگر برای این کار انتخاب نشده است",
      });

    job.status = "completed";
    await job.save();

    await NotificationServices.createNotification({
      userId: workerId,
      title: "کار ختم شد",
      message: `کار «${job.title}» ختم شد.`,
      type: "JOB_COMPLETED",
      jobId: job._id,
      applicationId: application._id,
    });

    res.json({ success: true, message: "کار موفقانه ختم شد" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "خطایی رخ داد!" });
  }
};

const getApplications = async (req, res) => {
  const jobId = req.params?.jobId;
  try {
    const applications = await ApplicationModel.find({ job: jobId })
      .populate(
        "worker",
        "profileImage name job expereinceYear province district rate",
      )
      .sort({ createdAt: -1 });
    if (!applications.length)
      return res.json({
        message: "درخواستی برای این کار ثبت نشده است",
        success: false,
        data: [],
      });
    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ message: "خطای رخ داد!", success: false });
  }
};

module.exports = { createJob, getListOfJobs, getApplications, completeJob };
