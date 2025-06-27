const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
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
} = require("../controllers/userController");
const checkRole = require("../middleware/checkRole");
const userController = require("../controllers/userController");
const { upload } = require("../config/cloudinary");
const uploadErrorHandler = require("../middleware/uploadErrorHandler");

// Test token route (for debugging)
router.get("/test-token", verifyToken, testToken);

router.get("/profile", verifyToken, checkRole(["patient", "doctor"]), getUserProfile);
router.put("/profile", verifyToken, checkRole(["patient", "doctor"]), updateUserProfile);
router.put("/change-password", verifyToken, checkRole(["patient", "doctor"]), changePassword);
router.delete("/account", verifyToken, checkRole(["patient", "doctor"]), deleteAccount);
router.post("/save-answers", verifyToken, userController.saveAnswers);
router.get("/get-answers", verifyToken, userController.getAnswers);

// PDF upload routes
router.post("/upload-pdf", verifyToken, checkRole(["patient", "doctor"]), upload.single('pdf'), uploadErrorHandler, uploadPdf);
router.get("/pdfs", verifyToken, checkRole(["patient", "doctor"]), getUserPdfs);
router.delete("/pdfs/:publicId(*)", verifyToken, checkRole(["patient", "doctor"]), deletePdf);

// Chat routes for patients
router.post("/send-message", verifyToken, checkRole(["patient"]), sendMessageToDoctor);
router.get("/conversations", verifyToken, checkRole(["patient", "doctor"]), getConversations);
router.get("/conversations/:doctorId", verifyToken, checkRole(["patient", "doctor"]), getConversation);
router.put("/conversations/:doctorId/read", verifyToken, checkRole(["patient", "doctor"]), markMessagesAsRead);
router.get("/unread-count", verifyToken, checkRole(["patient", "doctor"]), getUnreadCount);

// Get doctor ID route
router.get("/doctor-id", verifyToken, checkRole(["patient", "doctor"]), getDoctorId);

// Doctor: Get a patient's PDFs
router.get("/patients/:patientId(*)/pdfs", verifyToken, checkRole(["doctor"]), userController.getPatientPdfs);
// Download a PDF (patient or their doctor)
router.get("/pdfs/:publicId(*)/download", verifyToken, checkRole(["patient", "doctor"]), userController.downloadPdf);

// Signed URL for a PDF (patient or their doctor)
router.get("/pdfs/:publicId(*)/signed-url", verifyToken, checkRole(["patient", "doctor"]), userController.getSignedPdfUrl);

module.exports = router;
