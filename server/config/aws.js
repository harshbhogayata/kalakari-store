const { S3Client } = require('@aws-sdk/client-s3');

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-access-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-key'
  }
});

// S3 Configuration
const s3Config = {
  bucket: process.env.AWS_S3_BUCKET || 'kalakari-images',
  region: process.env.AWS_REGION || 'ap-south-1',
  baseUrl: `https://${process.env.AWS_S3_BUCKET || 'kalakari-images'}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com`
};

module.exports = {
  s3Client,
  s3Config
};
