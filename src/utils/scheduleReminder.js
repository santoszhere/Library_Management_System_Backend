import cron from "node-cron";
import { checkDueDatesAndSendReminders } from "../controller/admin.controller.js";

const scheduleReminders = () => {
  cron.schedule("0 8 * * *", async () => {
    try {
      console.log("Running due date reminder task...");
      await checkDueDatesAndSendReminders();
    } catch (error) {
      console.error("Error running reminder task:", error);
    }
  });
};

export default scheduleReminders;
