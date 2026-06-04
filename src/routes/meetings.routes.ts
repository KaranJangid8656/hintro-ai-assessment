import { Router } from 'express';
import * as meetingController from '../controllers/meeting.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createMeetingSchema,
  listMeetingsQuerySchema,
  meetingIdParamSchema,
} from '../validators/meeting.validator';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/meetings:
 *   post:
 *     tags: [Meetings]
 *     security: [{ bearerAuth: [] }]
 *     summary: Create a meeting with transcript
 */
router.post('/', validate(createMeetingSchema), meetingController.createMeeting);

/**
 * @openapi
 * /api/meetings:
 *   get:
 *     tags: [Meetings]
 *     security: [{ bearerAuth: [] }]
 *     summary: List meetings with pagination
 */
router.get('/', validate(listMeetingsQuerySchema, 'query'), meetingController.listMeetings);

/**
 * @openapi
 * /api/meetings/{id}:
 *   get:
 *     tags: [Meetings]
 *     security: [{ bearerAuth: [] }]
 *     summary: Get meeting by ID
 */
router.get('/:id', validate(meetingIdParamSchema, 'params'), meetingController.getMeeting);

/**
 * @openapi
 * /api/meetings/{id}/analyze:
 *   post:
 *     tags: [Meetings]
 *     security: [{ bearerAuth: [] }]
 *     summary: Analyze meeting transcript with AI
 */
router.post(
  '/:id/analyze',
  validate(meetingIdParamSchema, 'params'),
  meetingController.analyzeMeeting
);

export default router;
