import { cloudinary } from '../config/cloudinary.js';

// @desc    Upload single image to Cloudinary (or return base64 preview mode)
// @route   POST /api/v1/upload
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    const isCloudinaryReady =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_KEY !== 'your_api_key';

    if (isCloudinaryReady) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'luminamarket',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]:', error);
            return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
          }

          return res.status(200).json({
            success: true,
            message: 'Image uploaded to Cloudinary successfully',
            url: result.secure_url,
            public_id: result.public_id
          });
        }
      );

      uploadStream.end(req.file.buffer);
    } else {
      const base64Data = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

      return res.status(200).json({
        success: true,
        message: 'Image processed (Dev Local Preview Mode). Set Cloudinary credentials in .env for live Cloudinary CDN storage.',
        url: dataUrl,
        public_id: `dev_${Date.now()}`
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
