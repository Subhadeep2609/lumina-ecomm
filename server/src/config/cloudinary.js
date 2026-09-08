import { v2 as cloudinary } from 'cloudinary';

export const configureCloudinary = () => {
  const isConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key';

  if (isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('[Cloudinary] SDK Configured Successfully with Live API Keys.');
  } else {
    console.log('[Cloudinary] Credentials not set in .env. Operating with Dev Base64 Image Generator mode.');
  }

  return isConfigured;
};

export { cloudinary };
