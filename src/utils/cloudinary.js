const { cloudinary, is_cloudinary_configured } = require("../config/cloudinary.config");
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");
const AppError = require("./apperror");
const { status_code } = require("./status");

const get_media_category = (mimetype = "", filename = "") => {
  const mime = mimetype.toLowerCase();
  const ext = path.extname(filename).toLowerCase().replace(".", "");

  const video_exts = ["mp4", "webm", "mov", "mkv", "avi", "wmv", "flv"];
  const audio_exts = ["mp3", "wav", "m4a", "ogg", "aac", "flac"];
  const image_exts = ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"];

  if (mime.startsWith("video/") || video_exts.includes(ext)) {
    return "video";
  }
  if (mime.startsWith("audio/") || audio_exts.includes(ext)) {
    return "video";
  }
  if (mime.startsWith("image/") || image_exts.includes(ext)) {
    return "image";
  }
  return "raw";
};

const upload_file_to_cloudinary = async (file, folder = "social_media", options = {}) => {
  if (!file) {
    throw new AppError("No file provided for upload", status_code.BAD_REQUEST);
  }

  if (!is_cloudinary_configured()) {
    if (process.env.NODE_ENV === "test") {
      const detected_type = get_media_category(file.mimetype, file.originalname || file.filename);
      return {
        url: `/uploads/${file.filename || file.originalname}`,
        public_id: null,
        media_type: detected_type,
        format: path.extname(file.originalname || file.filename || "").replace(".", ""),
        file_name: file.originalname || file.filename,
        file_size: file.size || 0,
      };
    }
    throw new AppError(
      "Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env",
      status_code.INTERNAL_SERVER_ERROR
    );
  }

  const media_category = get_media_category(file.mimetype, file.originalname);
  const resource_type = options.resource_type || (media_category === "raw" ? "raw" : "auto");

  const upload_options = {
    folder,
    resource_type,
    use_filename: true,
    unique_filename: true,
    ...options,
  };

  try {
    let result;
    if (file.path) {
      result = await cloudinary.uploader.upload(file.path, upload_options);
      try {
        if (fs.existsSync(file.path)) {
          await fs.promises.unlink(file.path);
        }
      } catch (err) {
        console.warn("Failed to remove temporary file:", file.path, err.message);
      }
    } else if (file.buffer) {
      result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(upload_options, (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        });
        Readable.from(file.buffer).pipe(stream);
      });
    } else {
      throw new AppError("Invalid file object provided", status_code.BAD_REQUEST);
    }

    return {
      url: result.secure_url || result.url,
      public_id: result.public_id,
      media_type: result.resource_type || media_category,
      format: result.format || path.extname(file.originalname).replace(".", ""),
      file_name: file.originalname,
      file_size: result.bytes || file.size,
    };
  } catch (error) {
    if (file.path && fs.existsSync(file.path)) {
      try {
        await fs.promises.unlink(file.path);
      } catch (_) {}
    }
    console.error("Cloudinary upload failed:", error);
    throw new AppError(
      `File upload to Cloudinary failed: ${error.message || "Unknown error"}`,
      status_code.BAD_REQUEST
    );
  }
};

const upload_multiple_to_cloudinary = async (files = [], folder = "social_media/posts") => {
  if (!files || files.length === 0) return [];
  const upload_promises = files.map((file) => upload_file_to_cloudinary(file, folder));
  return await Promise.all(upload_promises);
};

const extract_cloudinary_info = (url) => {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("cloudinary.com")) return null;

  try {
    const url_parts = url.split("/");
    const upload_idx = url_parts.indexOf("upload");
    if (upload_idx === -1) return null;

    const resource_type = url_parts[upload_idx - 1] || "image";
    let remainder = url_parts.slice(upload_idx + 1).join("/");

    remainder = remainder.replace(/^v\d+\//, "");

    let public_id;
    if (resource_type === "raw") {
      public_id = remainder;
    } else {
      public_id = remainder.replace(/\.[^/.]+$/, "");
    }

    return { public_id, resource_type };
  } catch (e) {
    return null;
  }
};

const delete_from_cloudinary = async (identifier, resource_type = "image") => {
  if (!identifier) return false;

  if (typeof identifier === "string" && identifier.includes("cloudinary.com")) {
    const extracted = extract_cloudinary_info(identifier);
    if (extracted) {
      identifier = extracted.public_id;
      resource_type = extracted.resource_type || resource_type;
    }
  }

  if (typeof identifier === "string" && (identifier.startsWith("/uploads/") || identifier.startsWith("src/uploads/"))) {
    try {
      const local_path = path.isAbsolute(identifier)
        ? identifier
        : path.join(__dirname, "..", identifier.replace(/^\//, ""));
      if (fs.existsSync(local_path)) {
        await fs.promises.unlink(local_path);
        return true;
      }
    } catch (e) {
      console.warn("Failed to delete local file:", identifier, e.message);
    }
    return false;
  }

  if (!is_cloudinary_configured()) {
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(identifier, {
      resource_type: resource_type || "image",
    });
    return result.result === "ok";
  } catch (err) {
    console.error("Cloudinary deletion failed:", err.message);
    return false;
  }
};

module.exports = {
  upload_file_to_cloudinary,
  upload_multiple_to_cloudinary,
  delete_from_cloudinary,
  extract_cloudinary_info,
  get_media_category,
};

