const multer = require("multer");
const path = require("path");
const AppError = require("./apperror");
const crypto = require("crypto");
const { status_code } = require("./status");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "") || "bin";
    const random = crypto.randomBytes(16).toString("hex");
    cb(null, `${random}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const field_name = file.fieldname;

  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const mime_subtype = file.mimetype ? file.mimetype.split("/")[1]?.toLowerCase() : "";

  const img_array = ["jpg", "jpeg", "png", "webp", "gif", "svg"];
  const video_array = ["mp4", "webm", "mov", "mkv", "avi", "wmv", "flv", "3gp"];
  const audio_array = ["mp3", "wav", "m4a", "ogg", "aac", "flac"];
  const doc_array = [
    "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv",
    "zip", "rar", "7z", "tar", "gz"
  ];

  const allowed_all = [...img_array, ...video_array, ...audio_array, ...doc_array];

  if (field_name === "avatar") {
    if (img_array.includes(ext) || img_array.includes(mime_subtype)) {
      return cb(null, true);
    }
    return cb(
      new AppError(
        "Only image files are allowed for avatar (jpg, jpeg, png, webp, gif)",
        status_code.BAD_REQUEST
      ),
      false
    );
  }

  if (
    allowed_all.includes(ext) ||
    allowed_all.includes(mime_subtype) ||
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/") ||
    file.mimetype.startsWith("audio/")
  ) {
    return cb(null, true);
  }

  cb(
    new AppError(
      `File type not allowed. Supported formats: images, videos, audio, documents, and archives.`,
      status_code.BAD_REQUEST
    ),
    false
  );
};

const uploads = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 100) * 1024 * 1024,
  },
});

module.exports = uploads;
