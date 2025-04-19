import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getChatHistory, getChatUsers, send } from "../controllers/chat.controller.js";

const router = express.Router();

router.route("/send").post(isAuthenticated, send);
router.route("/messages/:otherUserId").get(isAuthenticated, getChatHistory);
router.route("/users").get(isAuthenticated, getChatUsers);

export default router;
