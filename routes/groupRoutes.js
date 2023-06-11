import express from "express";
import { addGroup, inviteToGroup, joinGroup } from "../controllers/groups.js";

const router = express.Router();

// router.get("/all/:id_wishlist", getItems);
// router.get("/:id_item", getItem);
router.post("/", addGroup);
router.post("/invite/", inviteToGroup);
router.post("/join/", joinGroup);
// router.delete("/:id_item", deleteItem);
// router.put("/", updateItem);
// router.put("/:id_item/:id_wishlist", moveItem);

export default router;
