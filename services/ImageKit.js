
const ImageKit = require('@imagekit/nodejs')
const { toFile } = require('@imagekit/nodejs')

// ImageKit credentials are read from environment variables.
// Put the real values in .env locally and in Render Environment Variables later.
// The private key must never be placed in the mobile app or committed to Git.
const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
})

// Upload a Multer file buffer directly to ImageKit.
// No image file is permanently stored on the Backend server.
const uploadToImageKit = async (fileBuffer, fileName, folder) => {

    // Convert the Multer Buffer to a File object
    // that is compatible with the ImageKit Node.js SDK.
    const file = await toFile(
        fileBuffer,
        fileName
    )

    // Upload the file to ImageKit.
    const result = await imagekit.files.upload({
        file,
        fileName,
        folder,
        useUniqueFileName: true,
        isPrivateFile: false
    })

    return result
}

module.exports = { uploadToImageKit }

