import { Router } from "express";
import { registerAdmin } from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authorizeRoles, verifyJwt } from "../middlewares/auth.middleware.js";
import {
  changeUserRoles,
  getAllUsers,
  getStatistics,
} from "../controller/admin.controller.js";

const adminRouter = Router();
adminRouter.use(verifyJwt);
adminRouter.route("/register").post(upload.single("avatar"), registerAdmin);
adminRouter.route("/get-all-users").get(authorizeRoles("admin"), getAllUsers);
adminRouter
  .route("/promote-to-librarian/:userId")
  .post(authorizeRoles("admin"), changeUserRoles);
adminRouter
  .route("/get-statistics")
  .get(authorizeRoles("admin"), getStatistics);
export default adminRouter;
