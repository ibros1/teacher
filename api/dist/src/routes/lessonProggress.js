"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lessonProgrress_1 = require("../controllers/lessonProgrress");
const router = express_1.default.Router();
router.post("/", lessonProgrress_1.markLessonProgress); // Create/update
router.get("/completed/:userId", lessonProgrress_1.getCompletedLessons); // All completed
router.get("/:userId/:lessonId", lessonProgrress_1.getLessonProgress); // Get 1
exports.default = router;
