const {
  upload_file_to_cloudinary,
  upload_multiple_to_cloudinary,
  delete_from_cloudinary,
  extract_cloudinary_info,
  get_media_category,
} = require("../../utils/cloudinary");
const { cloudinary } = require("../../config/cloudinary.config");

jest.mock("../../config/cloudinary.config", () => ({
  cloudinary: {
    uploader: {
      upload: jest.fn(),
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
  is_cloudinary_configured: jest.fn(() => true),
}));

describe("Cloudinary Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get_media_category", () => {
    it("should classify video extensions and mimetypes as video", () => {
      expect(get_media_category("video/mp4", "clip.mp4")).toBe("video");
      expect(get_media_category("", "movie.mov")).toBe("video");
      expect(get_media_category("", "clip.mkv")).toBe("video");
    });

    it("should classify audio extensions and mimetypes as video for Cloudinary", () => {
      expect(get_media_category("audio/mpeg", "song.mp3")).toBe("video");
      expect(get_media_category("", "voice.wav")).toBe("video");
    });

    it("should classify image extensions and mimetypes as image", () => {
      expect(get_media_category("image/png", "photo.png")).toBe("image");
      expect(get_media_category("", "pic.jpg")).toBe("image");
      expect(get_media_category("", "banner.webp")).toBe("image");
    });

    it("should classify documents and others as raw", () => {
      expect(get_media_category("application/pdf", "doc.pdf")).toBe("raw");
      expect(get_media_category("", "archive.zip")).toBe("raw");
    });
  });

  describe("extract_cloudinary_info", () => {
    it("should extract public_id and resource_type from image URL", () => {
      const url = "https://res.cloudinary.com/demo/image/upload/v1612345678/social_media/posts/photo_123.jpg";
      const info = extract_cloudinary_info(url);
      expect(info).toEqual({
        public_id: "social_media/posts/photo_123",
        resource_type: "image",
      });
    });

    it("should extract public_id and resource_type from video URL", () => {
      const url = "https://res.cloudinary.com/demo/video/upload/v1612345678/social_media/videos/video_456.mp4";
      const info = extract_cloudinary_info(url);
      expect(info).toEqual({
        public_id: "social_media/videos/video_456",
        resource_type: "video",
      });
    });

    it("should return null for non-cloudinary URLs", () => {
      expect(extract_cloudinary_info("/uploads/local_image.jpg")).toBeNull();
      expect(extract_cloudinary_info("https://example.com/test.png")).toBeNull();
      expect(extract_cloudinary_info(null)).toBeNull();
    });
  });

  describe("upload_file_to_cloudinary", () => {
    it("should upload file via path and return structured result", async () => {
      cloudinary.uploader.upload.mockResolvedValueOnce({
        secure_url: "https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg",
        public_id: "sample",
        resource_type: "image",
        format: "jpg",
        bytes: 12345,
      });

      const mockFile = {
        path: "temp/path.jpg",
        originalname: "sample.jpg",
        mimetype: "image/jpeg",
        size: 12345,
      };

      const result = await upload_file_to_cloudinary(mockFile, "social_media/posts");

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        "temp/path.jpg",
        expect.objectContaining({
          folder: "social_media/posts",
          resource_type: "auto",
        })
      );
      expect(result).toEqual({
        url: "https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg",
        public_id: "sample",
        media_type: "image",
        format: "jpg",
        file_name: "sample.jpg",
        file_size: 12345,
      });
    });

    it("should throw error if no file provided", async () => {
      await expect(upload_file_to_cloudinary(null)).rejects.toThrow();
    });
  });

  describe("upload_multiple_to_cloudinary", () => {
    it("should upload multiple files concurrently", async () => {
      cloudinary.uploader.upload
        .mockResolvedValueOnce({
          secure_url: "https://res.cloudinary.com/demo/image/upload/img1.jpg",
          public_id: "img1",
          resource_type: "image",
          format: "jpg",
          bytes: 1000,
        })
        .mockResolvedValueOnce({
          secure_url: "https://res.cloudinary.com/demo/video/upload/vid1.mp4",
          public_id: "vid1",
          resource_type: "video",
          format: "mp4",
          bytes: 5000,
        });

      const files = [
        { path: "path1.jpg", originalname: "img1.jpg", mimetype: "image/jpeg", size: 1000 },
        { path: "path2.mp4", originalname: "vid1.mp4", mimetype: "video/mp4", size: 5000 },
      ];

      const results = await upload_multiple_to_cloudinary(files, "social_media/posts");
      expect(results).toHaveLength(2);
      expect(results[0].public_id).toBe("img1");
      expect(results[1].public_id).toBe("vid1");
    });
  });

  describe("delete_from_cloudinary", () => {
    it("should call destroy with public_id and resource_type", async () => {
      cloudinary.uploader.destroy.mockResolvedValueOnce({ result: "ok" });

      const res = await delete_from_cloudinary("social_media/posts/photo_123", "image");
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("social_media/posts/photo_123", {
        resource_type: "image",
      });
      expect(res).toBe(true);
    });

    it("should extract public_id from Cloudinary URL and destroy it", async () => {
      cloudinary.uploader.destroy.mockResolvedValueOnce({ result: "ok" });

      const url = "https://res.cloudinary.com/demo/image/upload/v1612345678/social_media/posts/photo_123.jpg";
      const res = await delete_from_cloudinary(url);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("social_media/posts/photo_123", {
        resource_type: "image",
      });
      expect(res).toBe(true);
    });
  });
});

