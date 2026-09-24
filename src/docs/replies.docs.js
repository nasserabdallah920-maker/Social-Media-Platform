/**
 * @swagger
 * tags:
 *   name: Replies
 *   description: Comment reply management endpoints
 */

/**
 * @swagger
 * /replies/create/{comment_id}:
 *   post:
 *     summary: Create a reply to a comment
 *     tags: [Replies]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Reply text content
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Reply image (optional)
 *     responses:
 *       201:
 *         description: Reply created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /replies/comment/{comment_id}:
 *   get:
 *     summary: Get all replies for a comment
 *     tags: [Replies]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
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
 *         description: List of replies
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /replies/update/{id}:
 *   patch:
 *     summary: Update a reply
 *     tags: [Replies]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /replies/delete/{id}:
 *   delete:
 *     summary: Delete a reply
 *     tags: [Replies]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     responses:
 *       200:
 *         description: Reply deleted successfully
 *       401:
 *         description: Unauthorized
 */
