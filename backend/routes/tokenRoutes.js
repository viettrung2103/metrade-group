import express from "express";
import { getAccessToken } from "../controllers/tokenController.js";

const router = express.Router();

router.post("/get-access-token", getAccessToken);

export default router;