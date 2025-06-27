# PDF Upload Functionality

This document explains how to set up and use the PDF upload functionality for patients in the DiaGuard backend.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Cloudinary Account Setup

1. Sign up for a free Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret from your dashboard
3. Add them to your `.env` file

## API Endpoints

### Upload PDF
- **POST** `/users/upload-pdf`
- **Authentication:** Required (JWT token)
- **Role:** Patient only
- **Content-Type:** `multipart/form-data`
- **Field Name:** `pdf`

**Request:**
```bash
curl -X POST \
  http://localhost:3000/users/upload-pdf \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'pdf=@/path/to/your/file.pdf'
```

**Response:**
```json
{
  "success": true,
  "message": "PDF uploaded successfully",
  "data": {
    "filename": "document.pdf",
    "url": "https://res.cloudinary.com/.../diaguard-pdfs/user_123_1234567890.pdf",
    "publicId": "diaguard-pdfs/user_123_1234567890",
    "uploadedAt": "2024-01-15T10:30:00.000Z",
    "fileSize": 1024000
  }
}
```

### Get User PDFs
- **GET** `/users/pdfs`
- **Authentication:** Required (JWT token)
- **Role:** Patient only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "filename": "document.pdf",
      "cloudinaryUrl": "https://res.cloudinary.com/.../diaguard-pdfs/user_123_1234567890.pdf",
      "cloudinaryPublicId": "diaguard-pdfs/user_123_1234567890",
      "uploadedAt": "2024-01-15T10:30:00.000Z",
      "fileSize": 1024000
    }
  ]
}
```

### Delete PDF
- **DELETE** `/users/pdfs/:publicId`
- **Authentication:** Required (JWT token)
- **Role:** Patient only

**Request:**
```bash
curl -X DELETE \
  http://localhost:3000/users/pdfs/diaguard-pdfs/user_123_1234567890 \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Response:**
```json
{
  "success": true,
  "message": "PDF deleted successfully"
}
```

## Features

- **File Type Validation:** Only PDF files are allowed
- **File Size Limit:** Maximum 10MB per file
- **Cloud Storage:** Files are stored securely on Cloudinary
- **User Association:** Each PDF is associated with the uploading user
- **Metadata Storage:** File information is stored in the user's profile
- **Secure URLs:** Cloudinary provides secure HTTPS URLs for file access

## Error Handling

The API includes comprehensive error handling for:
- File size exceeded (10MB limit)
- Invalid file type (non-PDF files)
- Missing files
- Cloudinary upload failures
- Authentication/authorization errors

## Security

- Files are uploaded directly to Cloudinary (no local storage)
- Only authenticated patients can upload files
- Files are organized by user ID and timestamp
- Secure HTTPS URLs are provided for file access

## Database Schema

The User model has been updated to include an `uploadedPdfs` array:

```javascript
uploadedPdfs: [
  {
    filename: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    fileSize: { type: Number },
  },
]
``` 