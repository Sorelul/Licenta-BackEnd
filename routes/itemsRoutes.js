import express from "express";
import { getItems, addItem, deleteItem, updateItem, getItem } from "../controllers/items.js";

const router = express.Router();

router.get("/all/:id_wishlist", getItems);
router.get("/:id_item", getItem);
router.post("/", addItem);
router.delete("/:id_item", deleteItem);
router.put("/", updateItem);

export default router;
