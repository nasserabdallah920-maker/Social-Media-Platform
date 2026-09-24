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
    const arr = file.originalname.split(".");
    const ext = arr[arr.length - 1];
    const random = crypto.randomBytes(16).toString("hex");

    cb(null, `${random}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const field_name = file.fieldname;
  const arr = file.originalname.split(".");
  const ext = arr[arr.length - 1];
  const img_array = ["jpg", "jpeg", "png", "webp"];
  const fields_allowed_always = ["post_files", "file"];
  const files_array = [
    ...img_array,
    "mp4",
    "webm",
    "mov",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
    "zip",
    "rar",
  ];
  if (
    (field_name === "avatar" && img_array.includes(ext)) ||
    (fields_allowed_always.includes(field_name) && files_array.includes(ext))
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Only image files are allowed with extentions jpg jpeg png webp",
        status_code.BAD_REQUEST,
      ),
      false,
    );
  }
};

const uploads = multer({ storage, fileFilter });

module.exports = uploads;
