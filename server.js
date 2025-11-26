
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS (useful for dev split mode, harmless in prod)
app.use(cors());

// Configure Multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Initialize Google Cloud Storage
const getStorageClient = () => {
  if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
    try {
      const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
      return new Storage({ credentials });
    } catch (e) {
      console.error("Failed to parse GCP_SERVICE_ACCOUNT_KEY from environment.", e);
    }
  }
  return new Storage();
};

const storage = getStorageClient();

// --- API Routes ---

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const bucketName = req.body.bucketName || process.env.GCP_BUCKET_NAME;

    if (!bucketName) {
      return res.status(500).send('Bucket name not configured.');
    }

    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(req.file.originalname);
    
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
    });

    blobStream.on('error', (err) => {
      console.error('Upload error:', err);
      res.status(500).send({ message: err.message });
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(blob.name)}`;
      res.status(200).send({
        fileName: req.file.originalname,
        publicUrl: publicUrl
      });
    });

    blobStream.end(req.file.buffer);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send({ message: error.message });
  }
});

// --- Static File Serving (Frontend) ---

// Serve static files from 'dist' or 'build' directories
// This allows the Node server to host the built React application
const distPath = path.join(__dirname, 'dist');
const buildPath = path.join(__dirname, 'build');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`Serving static files from ${distPath}`);
} else if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  console.log(`Serving static files from ${buildPath}`);
} else {
  console.log("No 'dist' or 'build' directory found. API will work, but frontend must be run separately or built.");
}

// Client-side Routing Fallback
// For any request that doesn't match an API route or static file, return index.html
app.get('*', (req, res) => {
  if (req.accepts('html')) {
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    if (fs.existsSync(path.join(buildPath, 'index.html'))) {
      return res.sendFile(path.join(buildPath, 'index.html'));
    }
  }
  res.status(404).send('Not Found: Frontend build not found. Run "npm run build" to generate static assets.');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
  if (!process.env.GCP_SERVICE_ACCOUNT_KEY) {
    console.warn("WARNING: GCP_SERVICE_ACCOUNT_KEY env var is missing. Uploads may fail if not running in GCP environment.");
  }
});
