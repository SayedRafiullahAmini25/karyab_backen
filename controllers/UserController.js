const UserModel = require('../models/User')
const jwt = require('jsonwebtoken')
const { uploadToImageKit } = require('../services/ImageKit')

const login = async (req, res) => {
    const {phone, password} = req.body

    if(phone === '' || password === '') return res.json({ message : 'لطفا اطلاعات خود را وارد کنید', success : false})

    try{
        const user = await UserModel.findOne({phone})

        if(!user) return res.json({message : 'کاربر پیدا نشد', success : false})
    
        if(user.password !== password) return res.json({message : 'نام کاربری یا رمز عبور اشتباه است', success : false})

        const token = jwt.sign({id : user._id}, 'karyab')

        res.json({
            message : 'موفقانه وارد شدید',
            success : true,
            token : token,
            loggedInUserId : user._id
        })
    }catch(err) {
        res.json({message : 'خطای رخ داد!', success : false})
    }
}

const signup = async (req, res) => {
    const {name, phone, password, role, job, skills,email, expereinceYear, about, province, district} = req.body
    let profileImagePath = ''
    const galleryImages = []

    if(
        name === '' || phone === '' || password === '' || role === '' || skills === '' ||
        expereinceYear === '' || about === '' || province === '' || district === ''
    ) return res.json({message : 'لطفا تمام موار را پر کنید', success : false})

    try{

        const existUser = await UserModel.findOne({phone : phone})
        if(existUser) return res.json({message : 'کاربر با این شماره قبلا ثبت نام کرده است', success : false})

        // ImageKit: upload the profile image and gallery images.
        // The returned ImageKit URL is stored in MongoDB instead of a local file path.
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                console.log('file', file)
                console.log('buffer', file?.buffer?.length)
                console.log('filename', file?.originalname)
                const folder = file.fieldname === 'profileImage'
                    ? 'karyab/profile'
                    : 'karyab/gallery'

                const uploadedImage = await uploadToImageKit(file.buffer, file.originalname, folder)

                if (file.fieldname === 'profileImage') {
                    profileImagePath = uploadedImage.url
                } else if (file.fieldname === 'gallery') {
                    galleryImages.push(uploadedImage.url)
                }
            }
        }

        const user = await UserModel.create({
            name, phone, password, role, skills, expereinceYear, email,
            about, province, district, profileImage : profileImagePath, gallery : galleryImages,job
        })
        await user.save()

        return res.json({message : 'موفقانه ثبت نام کردید', success : true})

    }catch(err) {
        res.json({message : err.message, success : false})
        console.log(err.message)
    }
   
}

const getLoggedInUser = async (req, res) => {
    const {user} = req
    return res.json({loggedInUser : user})
}

const getAllUsers = async (req, res) => {

    try {
        const users = await UserModel.find({})
        if(!users.length > 0) return res.json({data : [], success : false})
            res.json({data : users, success : true})
    } catch (err) {
        res.json({message : 'خطای رخ داد', success : false})
    }
}
module.exports = {
    login,
    signup,
    getLoggedInUser,
    getAllUsers
}
