const cloudinary = require('cloudinary').v2;

const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

const isCloudinaryConfigured = requiredEnvVars.every((key) => Boolean(process.env[key]));

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const assertCloudinaryConfigured = () => {
  if (isCloudinaryConfigured) return;

  const error = new Error(
    'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env.'
  );
  error.statusCode = 500;
  throw error;
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  assertCloudinaryConfigured,
};
