const post_repositories = require("../repositories/post.repositories");
const likes_repositories = require("../repositories/like.repositories");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");
const fs = require("fs");
const path = require("path");
const { verify_user_blocking } = require("../utils/checkBlock");
const { verify_user_privacy } = require("../utils/checkPrivacy");
const Redis = require("../config/redis.config");

const create_post_service = async (user_id, text, files = []) => {
  const images = files && files.length > 0 ? files.map((image) => `/uploads/${image.filename}`) : [];
  if (!text && images.length === 0) {
    throw new AppError("Post must have text or image", status_code.BAD_REQUEST);
  }

  const post_id = await post_repositories.create_post(user_id, text);

  if (images && images.length > 0) {
    for (const img of images) {
      await post_repositories.add_post_image(post_id, img);
    }
  }
  const post = await post_repositories.get_post_by_id(post_id);
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

  const post = await post_repositories.get_post_by_id(post_id);

  if (!post) {
    throw new AppError("Post not found", status_code.NOT_FOUND);
  }

  await verify_user_blocking(post.user_id, requester_id);
  await verify_user_privacy(post.user_id, requester_id);

  await Redis.set(`post:${post_id}`, JSON.stringify(post), { EX: 60 * 5 });

  return post;
};

const get_user_posts_service = async (user_id, requester_id, limit, offset) => {
    if(limit<10 || limit>100){
    throw new AppError('The limit must be at least 10 or at most 100.',status_code.BAD_REQUEST)
  }
  await verify_user_blocking(user_id, requester_id);
  await verify_user_privacy(user_id, requester_id);
  const posts = await post_repositories.get_posts_by_user_id(user_id, limit, offset);
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
  return await post_repositories.get_post_by_id(post_id);
};
const add_post_files = async (user_id, post_id, files) => {
  const images = files && files.length > 0 ? files.map((image) => `/uploads/${image.filename}`) : [];
  const post = await post_repositories.get_post_by_id(post_id);
  if (!post) {
    throw new AppError("Post not found", status_code.NOT_FOUND);
  }

  if (post.user_id !== user_id) {
    throw new AppError("Unauthorized to update this post", status_code.FORBIDDEN);
  }


  if (images && images.length > 0) {
    for (const img of images) {
      await post_repositories.add_post_image(post_id, img);
    }
  }
  const new_post = await post_repositories.get_post_by_id(post_id);
  await Redis.del(`post:${post_id}`);
  return new_post
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
    post.images.forEach((image_url) => {
      try {
        const image_path = path.join(__dirname, "..", image_url);
        if (fs.existsSync(image_path)) {
          fs.unlinkSync(image_path);
        }
      } catch (err) {
        console.error("Failed to delete image file:", err);
      }
    });
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
  if(!post.images.includes(file_url)){
    throw new AppError('This post does not contain a file at this URL.',status_code.BAD_REQUEST)
  }
  try {
    const image_path = path.join(__dirname, "..", file_url);
    if (fs.existsSync(image_path)) {
      fs.unlinkSync(image_path);
    }
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