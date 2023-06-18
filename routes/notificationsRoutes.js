import express from "express";
import { getNotifications, setNotificationsSeen, deleteNotification } from "../controllers/notifications.js";

const router = express.Router();

router.get("/:id_user", getNotifications);
router.post("/setNotificationsSeen/:id_user", setNotificationsSeen);
router.delete("/deleteNotification/:id_notification", deleteNotification);

export default router;
