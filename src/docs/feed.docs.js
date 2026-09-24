/**
 * @swagger
 * tags:
 *   name: Feed
 *   description: User feed and global search endpoints
 */

/**
 * @swagger
 * /feed/posts:
 *   get:
 *     summary: Get posts for user's feed
 *     tags: [Feed]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Feed posts retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /feed/:
 *   get:
 *     summary: Global search (posts, users, etc.)
 *     tags: [Feed]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Search results
 *       401:
 *         description: Unauthorized
 */
