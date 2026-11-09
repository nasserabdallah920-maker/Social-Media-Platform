/**
 * @swagger
 * tags:
 *   name: Relations
 *   description: User relationships (follow, block, requests)
 */

/**
 * @swagger
 * /relations/follow/{following_id}:
 *   post:
 *     summary: Follow a user
 *     tags: [Relations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: following_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to follow
 *     responses:
 *       200:
 *         description: Successfully followed or requested to follow
 *       400:
 *         description: Bad request (e.g., already following)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /relations/unfollow/{following_id}:
 *   post:
 *     summary: Unfollow a user
 *     tags: [Relations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: following_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to unfollow
 *     responses:
 *       200:
 *         description: Successfully unfollowed
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /relations/block/{blocked_id}:
 *   post:
 *     summary: Block a user
 *     tags: [Relations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: blocked_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to block
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /relations/unblock/{blocked_id}:
 *   post:
 *     summary: Unblock a user
 *     tags: [Relations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: blocked_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to unblock
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /relations/request/accept/{from_user_id}:
 *   post:
 *     summary: Accept a follow request
 *     tags: [Relations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: from_user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user who sent the request
 *     responses:
 *       200:
 *         description: Request accepted
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /relations/request/reject/{from_user_id}:
 *   post:
 *     summary: Reject a follow request
 *     tags: [Relations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: from_user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user who sent the request
 *     responses:
 *       200:
 *         description: Request rejected
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /relations/followers/{user_id}:
 *   get:
 *     summary: Get user's followers
 *     tags: [Relations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to get followers for
 *     responses:
 *       200:
 *         description: List of followers
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /relations/following/{user_id}:
 *   get:
 *     summary: Get users followed by the user
 *     tags: [Relations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of following users
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /relations/blocked:
 *   get:
 *     summary: Get users blocked by the current user
 *     tags: [Relations]
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
 *         description: Number of users per page (10-100)
 *     responses:
 *       200:
 *         description: List of blocked users
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /relations/status/{user_id}:
 *   get:
 *     summary: Get relation status with another user
 *     tags: [Relations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the other user
 *     responses:
 *       200:
 *         description: Relation status retrieved
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /relations/requests/pending:
 *   get:
 *     summary: Get pending follow requests
 *     tags: [Relations]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of pending requests
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /relations/requests/pending/count:
 *   get:
 *     summary: Get pending follow requests count
 *     tags: [Relations]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved pending requests count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
