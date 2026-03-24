"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const lessonsController_1 = require("../controllers/lessonsController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit for video files
});
router.post("/create", lessonsController_1.createLessons);
router.post("/create-bulk", lessonsController_1.createBulkLessons);
router.post("/upload-video", upload.single("video"), lessonsController_1.uploadLessonVideo);
router.get("/presigned-url", lessonsController_1.getUploadPresignedUrl);
router.put("/update", lessonsController_1.updateLessons);
router.get("/list", lessonsController_1.getAllLessons);
router.get("/list/:lessonId", lessonsController_1.getOneLesson);
router.delete("/delete/:lessonId", lessonsController_1.deleteLesson);
exports.default = router;
