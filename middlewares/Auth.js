const jwt = require('jsonwebtoken')
const UserModel = require('../models/User')

const Auth = async (req, res, next) => {
    const token = req.headers.token

    try{
        if(!token) return res.json({success : false, message : 'no token, login first'})
        const decodedToken = jwt.verify(token, 'karyab')
        const user = await UserModel.findById(decodedToken.id)
        
        if(!user) return res.json({success : false, message : 'user not found'})
        req.user = user
        next()
    }catch(err) {
        res.json({success : false, message : 'invalid token'})
    }
}

module.exports = Auth