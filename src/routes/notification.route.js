import { Router } from 'express';
import { getUserNotifications, markNotificationAsSeen } from '../controller/notification.controller.js';

const notificationRouter = Router();

notificationRouter.post('/markAsSeen/:notificationId', markNotificationAsSeen);

notificationRouter.get('/:userId', getUserNotifications);

export default notificationRouter;