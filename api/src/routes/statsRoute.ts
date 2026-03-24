import { Router } from "express";
import { getAdminStats } from "../controllers/statsController";

const router = Router();

router.get("/admin", getAdminStats);

export default router;
