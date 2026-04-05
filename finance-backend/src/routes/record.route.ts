import { Router } from 'express';
import * as recordController from '../controllers/record.controller';
import authenticate from '../middleware/authenticate';
import authorizeRole from '../middleware/authorizeRole';
import { Role } from '../validators/auth.validator';

const router = Router();

router.use(authenticate);

// Read access for ADMIN and ANALYST
router.get('/', authorizeRole(Role.ADMIN, Role.ANALYST), recordController.getRecords);
router.get('/:id', authorizeRole(Role.ADMIN, Role.ANALYST), recordController.getRecordById);

// Create and Update only for ADMIN
router.post('/', authorizeRole(Role.ADMIN), recordController.createRecord);
router.patch('/:id', authorizeRole(Role.ADMIN), recordController.updateRecord);

// Delete only for ADMIN
router.delete('/:id', authorizeRole(Role.ADMIN), recordController.deleteRecord);

export default router;
