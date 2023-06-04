import { db } from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { logout } from "./auth.js";

dotenv.config();

export const getItems = (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) {
            return res.status(403).json("Token is not valid!");
        }

        const query = "SELECT * FROM items WHERE items_id_wishlist = ?";

        const items_id_wishlist = req.params.id_wishlist;

        db.query(query, [items_id_wishlist], (err, data) => {
            if (err) {
                res.status(200).json({
                    message: "Couldn't get your items!",
                    error: true,
                    errorCode: 2,
                });
                return;
            }
            res.status(200).json({
                message: "Items retrieved successfully!",
                error: false,
                data: data,
            });
        });
    });
};

export const getItem = (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) {
            return res.status(403).json("Token is not valid!");
        }

        const query = "SELECT * FROM items WHERE id_item = ?";

        const id_item = req.params.id_item;

        db.query(query, [id_item], (err, data) => {
            if (err) {
                res.status(200).json({
                    message: "Couldn't get your item!",
                    error: true,
                    errorCode: 2,
                });
                return;
            }
            res.status(200).json({
                message: "Item retrieved successfully!",
                error: false,
                data: data,
            });
        });
    });
};

export const addItem = (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded_token) => {
        if (err) {
            return res.status(403).json("Token is not valid!");
        }
        var items_added = new Date();
        const query =
            "INSERT INTO items (items_id_wishlist, items_link, items_name, items_ranking, items_price, items_shop, items_description, items_image, items_added, items_author, items_quantity) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
        const {
            items_id_wishlist,
            items_link,
            items_name,
            items_ranking,
            items_quantity,
            items_price,
            items_shop,
            items_description,
            items_image,
        } = req.body;
        db.query(
            query,
            [
                items_id_wishlist,
                items_link,
                items_name,
                items_ranking,
                items_price,
                items_shop,
                items_description,
                items_image,
                items_added,
                decoded_token.id,
                items_quantity,
            ],
            (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: "Couldn't add your item!",
                        error: true,
                        errorCode: 2,
                    });
                    return;
                }
                res.status(200).json({
                    message: "Item added successfully!",
                    error: false,
                });
            }
        );
    });
};

export const deleteItem = (req, res) => {
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

        const query = "DELETE FROM items WHERE id_item = ?;";

        const id_item = req.params.id_item;

        db.query(query, [id_item], (err, data) => {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: "Couldn't delete your item!",
                    error: true,
                    errorCode: 2,
                });
                return;
            }
            res.status(200).json({
                message: "Item deleted successfully!",
                error: false,
            });
        });
    });
};

export const updateItem = (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) {
            logout();
        }

        const query =
            "UPDATE items SET items_link = ?, items_name = ?, items_quantity = ?, items_ranking = ?, items_price = ?, items_shop = ?, items_description = ?, items_image = ?  WHERE id_item = ?;";

        const {
            id_item,
            items_link,
            items_name,
            items_quantity,
            items_ranking,
            items_price,
            items_shop,
            items_description,
            items_image,
        } = req.body;

        db.query(
            query,
            [
                items_link,
                items_name,
                items_quantity,
                items_ranking,
                items_price,
                items_shop,
                items_description,
                items_image,
                id_item,
            ],
            (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: "Couldn't update your item!",
                        error: true,
                        errorCode: 2,
                    });
                    return;
                }
                res.status(200).json({
                    message: "Item updated successfully!",
                    error: false,
                });
            }
        );
    });
};
