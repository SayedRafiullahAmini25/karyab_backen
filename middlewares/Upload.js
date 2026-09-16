const multer = require('multer')

// Cloudinary upload: keep uploaded images in memory instead of saving them
// to the local uploads/ folder. The controller sends the buffer to Cloudinary.
const storage = multer.memoryStorage()

const ImageUpload = multer({
    storage
})

module.exports = ImageUpload
