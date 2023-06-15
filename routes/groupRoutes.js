import express from "express";
import {
    addGroup,
    inviteToGroup,
    joinGroup,
    getGroups,
    getGroup,
    getGroupMembers,
    removeMember,
    sendEmailToGroupMembers,
} from "../controllers/groups.js";

const router = express.Router();

router.get("/all/", getGroups);
router.get("/:id_group", getGroup);
router.get("/members/:id_group", getGroupMembers);
// router.get("/:id_item", getItem);
router.post("/", addGroup);
router.post("/sendGroupEmail", sendEmailToGroupMembers);
router.post("/invite/", inviteToGroup);
router.post("/join/", joinGroup);
router.delete("/removeMember", removeMember);
// router.put("/", updateItem);
// router.put("/:id_item/:id_wishlist", moveItem);

export default router;
