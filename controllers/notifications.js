import { db } from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const getNotifications = (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) {
            return res.status(403).json("Token is not valid!");
        }

        const query = "SELECT * FROM `notifications` WHERE notifications_user_id = ?";

        const id_user = req.params.id_user;

        db.query(query, [id_user], (err, data) => {
            if (err) {
                res.status(200).json({
                    message: "Couldn't get your notifications!",
                    error: true,
                    errorCode: 2,
                });
                return;
            }
            res.status(200).json({
                message: "Notifications retrieved successfully!",
                error: false,
                data: data,
            });
        });
    });
};

export const setNotificationsSeen = (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) {
            return res.status(403).json("Token is not valid!");
        }

        const query = "UPDATE `notifications` SET notifications_visibility = 0 WHERE notifications_user_id = ?;";

        const id_user = req.params.id_user;

        db.query(query, [id_user], (err, data) => {
            if (err) {
                res.status(200).json({
                    message: "Couldn't update your notifications!",
                    error: true,
                    errorCode: 2,
                });
                return;
            }
            res.status(200).json({
                message: "Notifications updated successfully!",
                error: false,
                data: data,
            });
        });
    });
};

export const deleteNotification = (req, res) => {
    const token = req.cookies.access_token;
    if (!token) {
        res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) {
            res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
            return;
        }

        const query = "DELETE FROM `notifications` WHERE id_notification = ?;";

        const id_notification = req.params.id_notification;

        db.query(query, [id_notification], (err, data) => {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: "Couldn't delete your notification!",
                    error: true,
                    errorCode: 2,
                });
                return;
            }
            res.status(200).json({
                message: "Notification deleted successfully!",
                error: false,
            });
        });
    });
};
