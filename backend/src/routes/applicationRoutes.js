import { Router } from "express";
import {
  addApplication,
  deleteApplication,
  fetchApplications,
  filterApplications,
  getAnalytics,
  recommendApplications,
  searchApplications,
  updateApplication
} from "../controllers/applicationController.js";

const router = Router();

router.get("/getApps", fetchApplications);
router.post("/addApp", addApplication);
router.put("/updateApp", updateApplication);
router.delete("/deleteApp", deleteApplication);
router.get("/search", searchApplications);
router.get("/filter", filterApplications);
router.get("/recommend", recommendApplications);
router.get("/analytics", getAnalytics);

export default router;
