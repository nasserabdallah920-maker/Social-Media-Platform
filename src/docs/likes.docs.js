/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: Like management endpoints
 */

/**
 * @swagger
 * /likes/toggle/{post_id}:
 *   post:
 *     summary: Toggle like on a post
 *     tags: [Likes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /likes/post/{post_id}:
 *   get:
 *     summary: Get all likes for a post
 *     tags: [Likes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: List of likes
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
