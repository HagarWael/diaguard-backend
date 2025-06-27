const userService = require("../service/userService");
const pdfService = require("../service/pdfService");
const chatService = require("../service/chatService");
const User = require("../model/User1");
const Patient = require("../model/Patient");
const { Readable } = require('stream');
const cloudinary = require('cloudinary').v2;

const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user);
    if (!user) return res.status(404).json({ message: "user not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user, req.body);
    if (!updatedUser)
      return res.status(404).json({ message: "user not found" });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }

    const result = await userService.changePassword(
      req.user,
      currentPassword,
      newPassword
    );
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const result = await userService.deleteAccount(req.user);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const saveAnswers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const answers = req.body.answers; // [{questionText, answer}, ...]
    await User.findByIdAndUpdate(userId, { $set: { question: answers } });
    res.json({ message: "Answers saved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAnswers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    res.json({ answers: user.question || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No PDF file uploaded" 
      });
    }

    const userId = req.user.userId;
    const result = await pdfService.uploadPdfToCloudinary(req.file, userId);

    res.status(201).json({
      success: true,
      message: "PDF uploaded successfully",
      data: result.data,
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to upload PDF" 
    });
  }
};

const getUserPdfs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const pdfs = await pdfService.getUserPdfs(userId);

    res.json({
      success: true,
      data: pdfs,
    });
  } catch (error) {
    console.error('Get PDFs error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to fetch PDFs" 
    });
  }
};

const deletePdf = async (req, res) => {
  try {
    const { publicId } = req.params;
    const userId = req.user.userId;

    if (!publicId) {
      return res.status(400).json({ 
        success: false, 
        message: "Public ID is required" 
      });
    }

    const result = await pdfService.deletePdfFromCloudinary(publicId, userId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Delete PDF error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to delete PDF" 
    });
  }
};

// Chat functionality for patients
const sendMessageToDoctor = async (req, res) => {
  try {
    const { doctorId, content, messageType = "text", fileUrl = null, fileName = null } = req.body;
    const patientId = req.user.userId;

    if (!doctorId || !content) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID and content are required",
      });
    }

    // Validate chat permission
    const permission = await chatService.validateChatPermission(patientId, doctorId);
    if (!permission.valid) {
      return res.status(403).json({
        success: false,
        message: permission.message,
      });
    }

    // Save message
    const message = await chatService.saveMessage(
      patientId,
      doctorId,
      content,
      messageType,
      fileUrl,
      fileName
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await chatService.getUserConversations(userId);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get conversations",
    });
  }
};

const getConversation = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const patientId = req.user.userId;
    const { limit = 50, skip = 0 } = req.query;

    // Validate chat permission
    const permission = await chatService.validateChatPermission(patientId, doctorId);
    if (!permission.valid) {
      return res.status(403).json({
        success: false,
        message: permission.message,
      });
    }

    const messages = await chatService.getConversation(patientId, doctorId, parseInt(limit), parseInt(skip));

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get conversation",
    });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const patientId = req.user.userId;

    // Validate chat permission
    const permission = await chatService.validateChatPermission(patientId, doctorId);
    if (!permission.valid) {
      return res.status(403).json({
        success: false,
        message: permission.message,
      });
    }

    await chatService.markMessagesAsRead(doctorId, patientId);

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark messages as read",
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await chatService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get unread count",
    });
  }
};

// Test endpoint to verify token
const testToken = async (req, res) => {
  try {
    console.log("DEBUG: Test token endpoint called");
    console.log("DEBUG: User from token:", req.user);
    console.log("DEBUG: JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
    res.json({
      success: true,
      message: "Token is valid",
      user: req.user,
    });
  } catch (error) {
    console.error("Error in test token:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to test token",
    });
  }
};

const getDoctorId = async (req, res) => {
  try {
    console.log("=== DEBUG: getDoctorId function started ===");
    const userId = req.user.userId;
    console.log("DEBUG: Getting doctor ID for user:", userId);
    console.log("DEBUG: Full user object from token:", req.user);
    
    // First, let's test with a simple User query
    console.log("DEBUG: About to query User.findById...");
    const user = await User.findById(userId);
    console.log("DEBUG: User.findById completed");
    
    if (!user) {
      console.log("DEBUG: User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("DEBUG: User found - Role:", user.role);

    // If user is a doctor, return their own ID
    if (user.role === 'doctor') {
      console.log("DEBUG: User is a doctor, returning own info");
      const response = {
        success: true,
        data: { 
          doctorId: user._id,
          doctorName: user.fullname,
          doctorEmail: user.email,
        },
      };
      console.log("DEBUG: Sending doctor response:", response);
      return res.json(response);
    }

    // If user is a patient, get their doctor ID
    if (user.role === 'patient') {
      console.log("DEBUG: User is a patient, fetching doctor info");
      
      // Let's try a simpler approach first - just get the patient without populate
      console.log("DEBUG: About to query Patient.findById without populate...");
      const patient = await Patient.findById(userId);
      console.log("DEBUG: Patient.findById without populate completed");
      console.log("DEBUG: Patient data (without populate):", patient);
      
      if (!patient) {
        console.log("DEBUG: Patient not found");
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }
      
      if (!patient.doctor) {
        console.log("DEBUG: Doctor not assigned to patient");
        return res.status(404).json({
          success: false,
          message: "Doctor not found for this patient",
        });
      }

      // Now let's get the doctor info separately
      console.log("DEBUG: About to query Doctor.findById...");
      const doctor = await User.findById(patient.doctor);
      console.log("DEBUG: Doctor.findById completed");
      console.log("DEBUG: Doctor data:", doctor);

      if (!doctor) {
        console.log("DEBUG: Doctor not found in User collection");
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      console.log("DEBUG: Doctor found:", doctor);
      const response = {
        success: true,
        data: { 
          doctorId: doctor._id,
          doctorName: doctor.fullname,
          doctorEmail: doctor.email,
        },
      };
      console.log("DEBUG: Sending patient response:", response);
      return res.json(response);
    }

    console.log("DEBUG: Invalid user role:", user.role);
    return res.status(400).json({
      success: false,
      message: "Invalid user role",
    });
  } catch (error) {
    console.error("ERROR in getDoctorId:", error);
    console.error("ERROR stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get doctor ID",
    });
  }
};

// Doctor: Get a patient's PDFs
const getPatientPdfs = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { patientId } = req.params;
    // Check doctor-patient association
    const doctor = await require("../model/Doctor").findById(doctorId);
    if (!doctor || !doctor.patients.includes(patientId)) {
      return res.status(403).json({ success: false, message: "Not authorized to view this patient's PDFs" });
    }
    const patient = await User.findById(patientId).select("uploadedPdfs");
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }
    res.json({ success: true, data: patient.uploadedPdfs });
  } catch (error) {
    console.error('Get patient PDFs error:', error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch patient PDFs" });
  }
};

const downloadPdf = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { publicId } = req.params;

    // Find the user who owns this PDF
    const user = await User.findOne({ "uploadedPdfs.cloudinaryPublicId": publicId });
    if (!user) {
      return res.status(404).json({ success: false, message: "PDF not found" });
    }

    // Check if requester is the owner or their doctor
    let authorized = false;
    if (user._id.toString() === userId) {
      authorized = true;
    } else if (userRole === "doctor") {
      const doctor = await require("../model/Doctor").findById(userId);
      if (doctor && doctor.patients.includes(user._id)) {
        authorized = true;
      }
    }
    if (!authorized) {
      return res.status(403).json({ success: false, message: "Not authorized to download this PDF" });
    }

    // Get the PDF info
    const pdf = user.uploadedPdfs.find(p => p.cloudinaryPublicId === publicId);
    if (!pdf) {
      return res.status(404).json({ success: false, message: "PDF not found" });
    }
    const fileUrl = pdf.cloudinaryUrl;
    let filename = pdf.filename || 'file.pdf';
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename += '.pdf';
    }
    console.log('DEBUG: Download filename:', filename);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Content-Type', 'application/pdf');

    // Fetch the file from Cloudinary
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return res.status(500).json({ success: false, message: 'Failed to fetch file from storage' });
    }

    // Stream the file to the client
    if (response.body.pipe) {
      response.body.pipe(res);
    } else {
      // For Node.js 18+ and fetch API
      const stream = Readable.fromWeb(response.body);
      stream.pipe(res);
    }
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ success: false, message: 'Failed to download PDF' });
  }
};

// Generate a temporary signed URL for a PDF
const getSignedPdfUrl = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { publicId } = req.params;

    // Find the user who owns this PDF
    const user = await User.findOne({ "uploadedPdfs.cloudinaryPublicId": publicId });
    if (!user) {
      return res.status(404).json({ success: false, message: "PDF not found" });
    }

    // Check if requester is the owner or their doctor
    let authorized = false;
    if (user._id.toString() === userId) {
      authorized = true;
    } else if (userRole === "doctor") {
      const doctor = await require("../model/Doctor").findById(userId);
      if (doctor && doctor.patients.includes(user._id)) {
        authorized = true;
      }
    }
    if (!authorized) {
      return res.status(403).json({ success: false, message: "Not authorized to access this PDF" });
    }

    // Get the filename from your DB
    const pdf = user.uploadedPdfs.find(p => p.cloudinaryPublicId === publicId);
    let filename = pdf.filename || 'file.pdf';
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename += '.pdf';
    }

    // Generate a signed URL with attachment
    const signedUrl = cloudinary.utils.private_download_url(
      publicId,
      'pdf',
      {
        resource_type: 'raw',
        type: 'upload',
        expires_at: Math.floor(Date.now() / 1000) + 120,
        attachment: filename // <-- This sets fl_attachment and the filename
      }
    );
    return res.json({ url: signedUrl });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate signed URL' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  saveAnswers,
  getAnswers,
  uploadPdf,
  getUserPdfs,
  deletePdf,
  sendMessageToDoctor,
  getConversations,
  getConversation,
  markMessagesAsRead,
  getUnreadCount,
  getDoctorId,
  testToken,
  getPatientPdfs,
  downloadPdf,
  getSignedPdfUrl,
};
