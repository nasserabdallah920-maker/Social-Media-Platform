/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Conversation management endpoints
 */

/**
 * @swagger
 * /conversations/:
 *   get:
 *     summary: Get all conversations for the current user
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /conversations/creat-group:
 *   post:
 *     summary: Create a group conversation
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_name
 *               - users_id
 *             properties:
 *               group_name:
 *                 type: string
 *                 description: Name of the group
 *               users_id:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to add to the group
 *     responses:
 *       201:
 *         description: Group conversation created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /conversations/direct/{user_id}:
 *   post:
 *     summary: Create a direct conversation with another user
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to start conversation with
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *       400:
 *         description: Conversation already exists
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /conversations/{conversation_id}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 */
