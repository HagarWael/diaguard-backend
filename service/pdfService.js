const { cloudinary } = require('../config/cloudinary');
const User = require('../model/User1');

const uploadPdfToCloudinary = async (file, userId) => {
  try {
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'raw',
      folder: 'diaguard-pdfs',
      public_id: `user_${userId}_${Date.now()}`,
    });

    // Save PDF information to user document
    const pdfInfo = {
      filename: file.originalname,
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      uploadedAt: new Date(),
      fileSize: result.bytes,
    };

    // Update user document with PDF information
    await User.findByIdAndUpdate(
      userId,
      { 
        $push: { 
          uploadedPdfs: pdfInfo 
        } 
      },
      { new: true }
    );

    return {
      success: true,
      data: {
        filename: file.originalname,
        url: result.secure_url,
        publicId: result.public_id,
        uploadedAt: pdfInfo.uploadedAt,
        fileSize: result.bytes,
      },
    };
  } catch (error) {
    console.error('Error uploading PDF to Cloudinary:', error);
    throw new Error('Failed to upload PDF to cloud storage');
  }
};

const getUserPdfs = async (userId) => {
  try {
    const user = await User.findById(userId).select('uploadedPdfs');
    return user?.uploadedPdfs || [];
  } catch (error) {
    console.error('Error fetching user PDFs:', error);
    throw new Error('Failed to fetch user PDFs');
  }
};

const deletePdfFromCloudinary = async (publicId, userId) => {
  try {
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
    });

    if (result.result === 'ok') {
      // Remove from user document
      await User.findByIdAndUpdate(
        userId,
        { 
          $pull: { 
            uploadedPdfs: { cloudinaryPublicId: publicId } 
          } 
        }
      );

      return { success: true, message: 'PDF deleted successfully' };
    } else {
      throw new Error('Failed to delete PDF from cloud storage');
    }
  } catch (error) {
    console.error('Error deleting PDF from Cloudinary:', error);
    throw new Error('Failed to delete PDF');
  }
};

module.exports = {
  uploadPdfToCloudinary,
  getUserPdfs,
  deletePdfFromCloudinary,
}; 