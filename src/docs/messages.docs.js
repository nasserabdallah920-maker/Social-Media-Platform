/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Private messaging endpoints
 */

/**
 * @swagger
 * /messages/new/{conversation_id}:
 *   post:
 *     summary: Send a new message (text or file) to a conversation or user
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID (use a placeholder or 'null' if creating a new conversation)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Message text
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File attachment
 *               to_user_id:
 *                 type: string
 *                 description: ID of the recipient (required if starting a new direct message)
 *               conversation_type:
 *                 type: string
 *                 description: Type of conversation (e.g., 'direct' or 'group', required if starting a new one)
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request (missing text/file or conversation data)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /messages/{conversation_id}:
 *   get:
 *     summary: Get all messages in a conversation
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
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
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /messages/{message_id}:
 *   patch:
 *     summary: Update a message
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
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
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /messages/{message_id}/{conversation_id}:
 *   delete:
 *     summary: Delete a message from a conversation
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       401:
 *         description: Unauthorized
 */
