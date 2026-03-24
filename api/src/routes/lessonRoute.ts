import { Router } from "express";
import multer from "multer";
import {
  createBulkLessons,
  createLessons,
  deleteLesson,
  getAllLessons,
  getOneLesson,
  updateLessons,
  uploadLessonVideo,
  getUploadPresignedUrl,
} from "../controllers/lessonsController";

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit for video files
});

router.post("/create", createLessons);
router.post("/create-bulk", createBulkLessons);
router.post("/upload-video", upload.single("video"), uploadLessonVideo as any);
router.get("/presigned-url", getUploadPresignedUrl as any);
router.put("/update", updateLessons);
router.get("/list", getAllLessons);
router.get("/list/:lessonId", getOneLesson);
router.delete("/delete/:lessonId", deleteLesson);
export default router;
