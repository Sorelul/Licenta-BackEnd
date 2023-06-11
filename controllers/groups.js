import { db } from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const addGroup = (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded_token) => {
        if (err) {
            return res.status(403).json("Token is not valid!");
        }
        var groups_created = new Date();
        const query =
            "INSERT INTO `groups` (groups_name, groups_description, groups_admin, groups_created, groups_author) VALUES (?,?,?,?,?);";
        const { groups_name, groups_description } = req.body;
        db.query(
            query,
            [groups_name, groups_description, decoded_token.id, groups_created, decoded_token.id],
            (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(200).json({
                        message: "Couldn't add your group!",
                        error: true,
                        errorCode: 2,
                    });
                    return;
                }

                const groupId = data.insertId;
                //? Add the creator to group
                addUserToGroup(decoded_token.id, groupId);

                res.status(200).json({
                    message: "Group added successfully!",
                    error: false,
                    id_group: groupId,
                });
            }
        );
    });
};

//! Invitations ----------------------------------------------------------------

//? Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SERVICE,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const inviteToGroup = (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded_token) => {
        if (err) {
            res.status(200).json({ message: "Unauthorized!", error: true, errorCode: 1 });
            return;
        }
        const { members, id_group, groupName } = req.body;
        if (!members || !id_group || !groupName) {
            res.status(200).json({ message: "At least one field is missing", error: true, errorCode: 2 });
            return;
        }

        //? Create invitation code for every member
        var code = "";
        var membersCodes = [];
        var date = new Date();
        var errors = [];
        const query =
            "INSERT INTO `invitations` (invitations_email,invitations_group_id,invitations_code,invitations_date) VALUES (?,?,?,?);";

        members.forEach((member) => {
            code = createCode(15);
            membersCodes.push({ email: member.email, code: code });
            db.query(query, [member.email, id_group, code, date], (err, data) => {
                if (err) {
                    errors.push({ err, member });
                }
            });
        });

        if (errors.length > 0) {
            res.status(200).json({
                message: "Some errors occured while inviting members.",
                error: true,
                errorCode: 2,
                errors: errors,
            });
            return;
        }

        //? Check if the users are already registered
        checkForExistingUsers(members)
            .then((existingMembers) => {
                //? Send notifications in app for every exiting user
                if (existingMembers.length > 0) {
                    const notif_errors = sendInviteNotifications(existingMembers, id_group, groupName);
                    if (notif_errors.length > 0) {
                        res.status(200).json({
                            message: "Some errors occured while inviting members.",
                            error: true,
                            errorCode: 2,
                            errors: notif_errors,
                        });
                        return;
                    }
                }
            })
            .catch((err) => {
                console.log("Error in checkForExistingUsers:");
                console.log(err);
            });

        //? Handle email sending

        members.forEach((member) => {
            const code = membersCodes.find((code) => code.email === member.email);
            const mailContent = `<!DOCTYPE html>
            <html>
            <head>
              <title>Invitation Email</title>
              <style>
                /* CSS styles */
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f7f7f7;
                  margin: 0;
                  padding: 0;
                }
                
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                }
                
                h1 {
                  color: #333333;
                  font-size: 24px;
                  margin: 0;
                  padding: 0;
                }
    
                h2 {
                  color: #333333;
                  font-size: 18px;
                  margin: 0;
                  padding: 0;
                }
                
                p {
                  color: #666666;
                  font-size: 16px;
                  line-height: 1.5;
                }
                
                .cta-button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #007bff;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 4px;
                  font-size: 16px;
                  margin-top: 20px;
                }
                
                .footer {
                  text-align: center;
                  margin-top: 40px;
                  color: #999999;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>A special invitation</h1>
                <p>Hello,</p>
                <p>You are cordially invited to join ${groupName} on Wishy.</p>
    
                <h2>What is Wishy?</h2>
                <p>A free, private online & mobile gift registry to help you get gifts right, every time. A central place you and your family can visit year-round to view each other’s wish lists and gift preferences.</p>
                
                <p>Your invitations code is: ${code.code}.</p>
                <p>Press the below button to go to the group page.</p>
                <a class="cta-button" href="http://localhost:3000/groups/join">Join</a>
                <div class="footer">
                  <p>If you have any questions or need further information, please contact us at <a href="mailto:sorelul.spam@gmail.com">sorelul.spam@gmail.com</a>.</p>
                </div>
              </div>
            </body>
            </html>`;
            sendEmail(member.email, "Invitation to Group", mailContent)
                .then(() => {
                    // All good
                })
                .catch((error) => {
                    console.log(`Error sending email to ${member.email}: ${error}`);
                });
        });

        res.status(200).json({
            message: "Group created and members invited successfully!",
            error: false,
        });
    });
};

//! ----------------------------------------------------------------
//! Private Methods
//! ----------------------------------------------------------------

const checkForExistingUsers = (members) => {
    return new Promise((resolve, reject) => {
        var email = "";
        var existingMembers = [];

        const queryPromises = members.map((member) => {
            email = member.email;
            return new Promise((resolve, reject) => {
                db.query("SELECT id_user FROM users WHERE users_email = ?", [email], (err, data) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        if (data.length > 0) {
                            existingMembers.push({ id_user: data[0].id_user, email: member.email });
                        }
                        resolve();
                    }
                });
            });
        });

        Promise.all(queryPromises)
            .then(() => {
                resolve(existingMembers);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

const sendInviteNotifications = (members, groupName) => {
    const query =
        "INSERT INTO `notifications` (notifications_user_id,notifications_source,notifications_message,notifications_date) VALUES (?,?,?,?);";
    const message = "You have been invited to join " + groupName;
    const date = new Date();
    var errors = [];
    members.forEach((member) => {
        db.query(query, [member.id_user, "Group Invitation", message, date], (err, data) => {
            if (err) {
                errors.push({ err, member });
            }
        });
    });
    return errors;
};

const sendEmail = (email, subject, content) => {
    const message = {
        from: "sorelul.spam@gmail.com",
        to: email,
        subject: subject,
        html: content,
    };

    return transporter.sendMail(message);
};

const createCode = (length) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
};

const addUserToGroup = (id_user, id_group) => {
    const query = "INSERT INTO `correlation_group_user` (cgu_id_group,cgu_id_user) VALUES (?,?);";
    const error = {
        error: false,
        message: "",
    };

    db.query(query, [id_group, id_user], (err, data) => {
        if (err) {
            error.error = true;
            error.message = err;
        }
    });

    return error;
};