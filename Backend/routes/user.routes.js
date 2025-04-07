import express from "express";
import { login, register, logout, checkAuth } from "../controllers/user.controller.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/check-auth").get(checkAuth);

export default router;