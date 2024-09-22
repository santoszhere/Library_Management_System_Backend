import { Router } from 'express';
import { getUserNotifications, markNotificationAsSeen, getAllNotification } from '../controller/notification.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const notificationRouter = Router();
notificationRouter.use(verifyJwt)
notificationRouter.route("/get-notification").get(getAllNotification)
notificationRouter.post('/markAsSeen', markNotificationAsSeen);

notificationRouter.get('/:userId', getUserNotifications);

export default notificationRouter;