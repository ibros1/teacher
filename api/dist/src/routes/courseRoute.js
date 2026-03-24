"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coursesController_1 = require("../controllers/coursesController");
const courseSchema_1 = require("../../schema/courseSchema");
const authenthicate_middleware_1 = require("../../middleware/authenthicate.middleware");
const cloudinary_1 = require("../utils/cloudinary");
const authorize_1 = require("../../middleware/authorize");
const limit_image_middleWare_1 = require("../../middleware/limit.image.middleWare");
// Configure storage for uploaded files (adjust destination as needed)
const router = (0, express_1.Router)();
router.use(limit_image_middleWare_1.multerErrorHandler);
router.post("/create", cloudinary_1.courseUpload.fields([
    { name: "course_img", maxCount: 1 },
    { name: "cover_img", maxCount: 1 },
]), authenthicate_middleware_1.authenticate, (0, authorize_1.authorize)(["ADMIN"]), coursesController_1.createCourse);
router.get("", coursesController_1.getAllCourses);
router.put("/update", cloudinary_1.courseUpload.fields([
    { name: "course_img", maxCount: 1 },
    { name: "cover_img", maxCount: 1 },
]), authenthicate_middleware_1.authenticate, (0, authorize_1.authorize)(["ADMIN"]), courseSchema_1.UpdateCourseSchema, coursesController_1.updateCourse);
router.get("/:courseId", coursesController_1.getOneCourse);
router.delete("/delete/:courseId", authenthicate_middleware_1.authenticate, (0, authorize_1.authorize)(["ADMIN"]), coursesController_1.deleteCourse);
exports.default = router;
