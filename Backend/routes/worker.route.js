import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { deleteWorker, getAllWorkers, getLocationCategories, getMyServices, getServiceCategories, getWorkerById, postService, updateWorker } from "../controllers/worker.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, postService);
router.route("/get").get(getAllWorkers);
router.route("/update").put(isAuthenticated, updateWorker);
router.route("/delete").delete(isAuthenticated, deleteWorker);
router.route("/my-services").get(isAuthenticated, getMyServices);
router.route("/get/:id").get(getWorkerById);
router.route("/services").get(getServiceCategories);
router.route("/locations").get(getLocationCategories);

export default router;
