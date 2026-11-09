const post_repositories = require("../repositories/post.repositories");
const likes_repositories = require("../repositories/like.repositories");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");
const { verify_user_blocking } = require("../utils/checkBlock");
const { verify_user_privacy } = require("../utils/checkPrivacy");
const Redis = require("../config/redis.config");
const {
  upload_multiple_to_cloudinary,
  delete_from_cloudinary,
} = require("../utils/cloudinary");

const create_post_service = async (user_id, text, files = []) => {
  if (!text && (!files || files.length === 0)) {
    throw new AppError("Post must have text or image", status_code.BAD_REQUEST);
  }

  const uploaded_files = files && files.length > 0
    ? await upload_multiple_to_cloudinary(files, "social_media/posts")
    : [];

  const post_id = await post_repositories.create_post(user_id, text);

  if (uploaded_files && uploaded_files.length > 0) {
    for (const file_item of uploaded_files) {
      await post_repositories.add_post_image(post_id, file_item);
    }
  }
  const post = await post_repositories.get_post_by_id(post_id, user_id);
  return post;
};

const get_post_service = async (post_id, requester_id) => {
  const cached_post = await Redis.get(`post:${post_id}`);
  if (cached_post) {
    const post = JSON.parse(cached_post);
    await verify_user_blocking(post.user_id, requester_id);
    await verify_user_privacy(post.user_id, requester_id);
    return post;
  }

  const post = await post_repositories.get_post_by_id(post_id, requester_id);

  if (!post) {
    throw new AppError("Post not found", status_code.NOT_FOUND);
  }

  await verify_user_blocking(post.user_id, requester_id);
  await verify_user_privacy(post.user_id, requester_id);

  await Redis.set(`post:${post_id}`, JSON.stringify(post), { EX: 60 * 5 });

  return post;
};

const get_user_posts_service = async (user_id, requester_id, limit, offset) => {
  if (limit < 10 || limit > 100) {
    throw new AppError('The limit must be at least 10 or at most 100.', status_code.BAD_REQUEST);
  }
  await verify_user_blocking(user_id, requester_id);
  await verify_user_privacy(user_id, requester_id);
  const posts = await post_repositories.get_posts_by_user_id(user_id, requester_id, limit, offset);
  return posts;
};

const update_post_service = async (user_id, post_id, text) => {
  const post = await post_repositories.get_post_by_id(post_id);
  if (!post) {
    throw new AppError("Post not found", status_code.NOT_FOUND);
  }

  if (post.user_id !== user_id) {
    throw new AppError("Unauthorized to update this post", status_code.FORBIDDEN);
  }

  await post_repositories.update_post_by_id(post_id, text);
  await Redis.del(`post:${post_id}`);
  return await post_repositories.get_post_by_id(post_id, user_id);
};

const add_post_files = async (user_id, post_id, files = []) => {
  if (!files || files.length === 0) {
    throw new AppError("No files provided", status_code.BAD_REQUEST);
  }

  const post = await post_repositories.get_post_by_id(post_id);
  if (!post) {
    throw new AppError("Post not found", status_code.NOT_FOUND);
  }

  if (post.user_id !== user_id) {
    throw new AppError("Unauthorized to update this post", status_code.FORBIDDEN);
  }

  const uploaded_files = await upload_multiple_to_cloudinary(files, "social_media/posts");

  if (uploaded_files && uploaded_files.length > 0) {
    for (const file_item of uploaded_files) {
      await post_repositories.add_post_image(post_id, file_item);
    }
  }

  const new_post = await post_repositories.get_post_by_id(post_id, user_id);
  await Redis.del(`post:${post_id}`);
  return new_post;
};

const delete_post_service = async (user_id, post_id) => {
  const post = await post_repositories.get_post_by_id(post_id);
  if (!post) {
    throw new AppError("Post not found", status_code.NOT_FOUND);
  }

  if (post.user_id !== user_id) {
    throw new AppError("Unauthorized to delete this post", status_code.FORBIDDEN);
  }

  if (post.images && post.images.length > 0) {
    for (const image of post.images) {
      try {
        const identifier = typeof image === "object" ? (image.public_id || image.url) : image;
        const media_type = typeof image === "object" ? (image.media_type || "image") : "image";
        await delete_from_cloudinary(identifier, media_type);
      } catch (err) {
        console.error("Failed to delete post image/media:", err);
      }
    }
  }

  await post_repositories.delete_post_by_id(post_id);
  await Redis.del(`post:${post_id}`);
};

const delete_post_file_service = async (user_id, post_id, file_url) => {
  const post = await post_repositories.get_post_by_id(post_id);
  if (!post) {
    throw new AppError("Post not found", status_code.NOT_FOUND);
  }

  if (post.user_id !== user_id) {
    throw new AppError("Unauthorized to delete this post image", status_code.FORBIDDEN);
  }

  const target_file = post.images.find((img) =>
    typeof img === "object" ? img.url === file_url : img === file_url
  );

  if (!target_file) {
    throw new AppError('This post does not contain a file at this URL.', status_code.BAD_REQUEST);
  }

  try {
    const identifier = typeof target_file === "object" ? (target_file.public_id || target_file.url) : target_file;
    const media_type = typeof target_file === "object" ? (target_file.media_type || "image") : "image";
    await delete_from_cloudinary(identifier, media_type);
  } catch (err) {
    console.error("Failed to delete image file:", err);
  }

  await post_repositories.delete_post_image(post_id, file_url);
  await Redis.del(`post:${post_id}`);
};

module.exports = {
  create_post_service,
  get_post_service,
  get_user_posts_service,
  update_post_service,
  delete_post_service,
  delete_post_file_service,
  add_post_files,
};
