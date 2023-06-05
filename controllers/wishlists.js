import { db } from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const getWishlists = (req, res) => {
    const token = req.cookies.access_token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized!", error: true });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");
        const query = "SELECT * FROM wishlists WHERE wishlists_user_id = ?";
        const wishlists_user_id = req.params.user;
        db.query(query, [wishlists_user_id], (err, data) => {
            if (err) {
                console.log(err);
                res.status(403).json("Couldn't get your wishlists!");
                return;
            }

            res.status(200).json(data);
        });
    });
};

export const getWishlist = (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) {
            return res.status(403).json("Token is not valid!");
        }
        const query = "SELECT * FROM wishlists WHERE id_wishlist = ?";
        const id_wishlist = req.params.id_wishlist;
        db.query(query, [id_wishlist], (err, data) => {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: "Couldn't get your list!",
                    error: true,
                    errorCode: 2,
                });
                return;
            }
            res.status(200).json({
                message: "List retrieved successfully!",
                error: false,
                data: data,
            });
        });
    });
};

export const getOwnedWishlist = (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) {
            return res.status(403).json("Token is not valid!");
        }
        const query = "SELECT * FROM wishlists WHERE wishlists_user_id = ? AND wishlists_i_got_this = 1";
        const lastQuery = db.query(query, [userInfo.id], (err, data) => {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: "Couldn't get your list!",
                    error: true,
                    errorCode: 2,
                });
                return;
            }
            res.status(200).json({
                message: "List retrieved successfully!",
                error: false,
                data: data,
            });
        });
    });
};

export const addWishlist = (req, res) => {
    const token = req.cookies.access_token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized!", error: true });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");
        var wishlists_added = new Date();
        const query =
            "INSERT INTO wishlists (wishlists_user_id, wishlists_name, wishlists_description,wishlists_added,wishlists_prefered_color) VALUES (?,?,?,?,?)";
        const { wishlists_user_id, wishlists_name, wishlists_description, wishlists_prefered_color } = req.body;
        db.query(
            query,
            [wishlists_user_id, wishlists_name, wishlists_description, wishlists_added, wishlists_prefered_color],
            (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(403).json("Couldn't add the wishlist!");
                    return;
                }
                res.status(200).json("Wishlist added successfully!");
            }
        );
    });
};

export const deleteWishlist = (req, res) => {
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

        const query = "DELETE FROM wishlists WHERE id_wishlist = ?;";

        const id_wishlist = req.params.id_wishlist;

        db.query(query, [id_wishlist], (err, data) => {
            if (err) {
                console.log(err);
                res.status(200).json({
                    message: "Couldn't delete your list!",
                    error: true,
                    errorCode: 2,
                });
                return;
            }
            res.status(200).json({
                message: "List deleted successfully!",
                error: false,
            });
        });
    });
};

export const updateWishlist = (req, res) => {
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
            "UPDATE wishlists SET wishlists_name = ?, wishlists_description = ?, wishlists_archived = ?, wishlists_bought = ?, wishlists_prefered_color = ?, wishlists_privacy = ?  WHERE id_wishlist = ?;";

        const {
            id_wishlist,
            wishlists_name,
            wishlists_description,
            wishlists_archived,
            wishlists_bought,
            wishlists_prefered_color,
            wishlists_privacy,
        } = req.body;

        db.query(
            query,
            [
                wishlists_name,
                wishlists_description,
                wishlists_archived,
                wishlists_bought,
                wishlists_prefered_color,
                wishlists_privacy,
                id_wishlist,
            ],
            (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: "Couldn't update your list!",
                        error: true,
                        errorCode: 2,
                    });
                    return;
                }
                res.status(200).json({
                    message: "List updated successfully!",
                    error: false,
                });
            }
        );
    });
};
