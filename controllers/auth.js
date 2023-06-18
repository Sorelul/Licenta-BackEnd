import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const register = (req, res) => {
    //Check existing user
    const q = "SELECT * FROM users WHERE users_email = ? OR users_username = ?";

    db.query(q, [req.body.email, req.body.username], (err, result) => {
        //If error return error
        if (err) {
            return res.status(500).json(err);
        }
        //If user exists return error
        if (result.length) {
            return res.status(409).json("User already exists!");
        }

        //Has the password and create user
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const q =
            "INSERT INTO users (`users_username`, `users_email`, `users_password`, `users_date-added`) VALUES (?)";
        const values = [req.body.username, req.body.email, hash, new Date()];

        db.query(q, [values], (err, result) => {
            if (err) {
                return res.json(err);
            }
            if (result.affectedRows) {
                const id_user = result.insertId;
                createNewIGotThisList(id_user);
                return res.status(200).json("User created!");
            } else {
                return res.status(500).json("Something went wrong!");
            }
        });
    });
};

export const login = (req, res) => {
    const q = "SELECT * FROM users WHERE users_email = ? OR users_username = ?";

    db.query(q, [req.body.email, req.body.username], (err, result) => {
        //If error return error
        if (err) {
            return res.status(500).json(err);
        }
        //If user doesnt exists return error
        if (!result.length) {
            return res.status(404).json("User does not exist!");
        }

        const user = result[0];

        const validPassword = bcrypt.compareSync(req.body.password, user.users_password);

        if (!validPassword) {
            return res.status(401).json("Password or username is incorrect!");
        }

        //Create token
        const token = jwt.sign({ id: user.id_user }, process.env.JWT_SECRET, {
            expiresIn: 86400, //24 hours
        });

        updateHeartbeat(user.id_user);

        const { users_password, ...other } = user;

        res.cookie("access_token", token, { httpOnly: true }).status(200).json(other);
    });
};

export const logout = (req, res) => {
    res.clearCookie("access_token", {
        sameSite: "none",
        secure: true,
    })
        .status(200)
        .json("Logged out!");
};

//! Update HeartBeat

const updateHeartbeat = (id_user) => {
    const query = "UPDATE users SET users_last_heartbeat = ? WHERE id_user = ?;";
    const date = new Date();
    db.query(query, [date, id_user], (err, data) => {
        if (err) {
            console.log(err);
        }
        return;
    });
};

const createNewIGotThisList = (id_user) => {};
