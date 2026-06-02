import express from 'express';
import * as AuthController from '../controllers/AuthController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  validateRequest,
  loginSchema,
  createHostSchema,
  updateHostSchema,
} from '../validators/index.js';

const router = express.Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/signup', validateRequest(createHostSchema), AuthController.signup);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);

router.get('/hosts', authenticate, requireRole('admin'), AuthController.getHosts);
router.post(
  '/hosts',
  authenticate,
  requireRole('admin'),
  validateRequest(createHostSchema),
  AuthController.createHost
);
router.put(
  '/hosts/:userId',
  authenticate,
  requireRole('admin'),
  validateRequest(updateHostSchema),
  AuthController.updateHost
);
router.delete('/hosts/:userId', authenticate, requireRole('admin'), AuthController.deleteHost);

export default router;
