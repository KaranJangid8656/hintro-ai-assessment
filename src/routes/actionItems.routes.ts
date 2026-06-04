import { Router } from 'express';
import * as actionItemController from '../controllers/actionItem.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  actionItemIdParamSchema,
  createActionItemSchema,
  listActionItemsQuerySchema,
  updateActionItemStatusSchema,
} from '../validators/actionItem.validator';

const router = Router();

router.use(authenticate);

router.get(
  '/overdue',
  actionItemController.getOverdueActionItems
);

router.post('/', validate(createActionItemSchema), actionItemController.createActionItem);

router.patch(
  '/:id/status',
  validate(actionItemIdParamSchema, 'params'),
  validate(updateActionItemStatusSchema),
  actionItemController.updateActionItemStatus
);

router.get('/', validate(listActionItemsQuerySchema, 'query'), actionItemController.listActionItems);

export default router;
