/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Profile management endpoints
 */

/**
 * @swagger
 * /profiles/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profiles]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile data retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /profiles/{id}:
 *   get:
 *     summary: Get a user's profile by ID
 *     tags: [Profiles]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Profile data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Blocked from viewing this profile
 *       404:
 *         description: Profile not found
 */

/**
 * @swagger
 * /profiles/bio:
 *   put:
 *     summary: Update profile bio
 *     tags: [Profiles]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 description: URL to avatar image
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 description: User biography
 *     responses:
 *       200:
 *         description: Profile bio updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /profiles/avatar:
 *   put:
 *     summary: Upload and update profile avatar
 *     tags: [Profiles]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /profiles/cover:
 *   put:
 *     summary: Upload and update profile cover photo
 *     tags: [Profiles]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Cover updated successfully
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /profiles/privacy:
 *   patch:
 *     summary: Toggle profile privacy settings
 *     tags: [Profiles]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Privacy settings toggled successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /profiles/:
 *   delete:
 *     summary: Delete user profile
 *     tags: [Profiles]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       401:
 *         description: Unauthorized
 */
