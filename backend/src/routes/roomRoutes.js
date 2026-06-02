import express from 'express';
import * as RoomController from '../controllers/RoomController.js';
import { validateRequest, createRoomSchema, joinRoomSchema } from '../validators/index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', authenticate, requireRole('host'), validateRequest(createRoomSchema), RoomController.createRoom);
router.post('/join', validateRequest(joinRoomSchema), RoomController.joinRoom);
router.get('/:roomCode', RoomController.getRoom);

export default router;
