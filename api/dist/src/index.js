"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const uerRoute_1 = __importDefault(require("./routes/uerRoute"));
const courseRoute_1 = __importDefault(require("./routes/courseRoute"));
const lessonRoute_1 = __importDefault(require("./routes/lessonRoute"));
const lessonProggress_1 = __importDefault(require("./routes/lessonProggress"));
const enrollmentRouter_1 = __importDefault(require("./routes/enrollmentRouter"));
const paymentRoute_1 = __importDefault(require("./routes/paymentRoute"));
const chapterRoute_1 = __importDefault(require("./routes/chapterRoute"));
const statsRoute_1 = __importDefault(require("./routes/statsRoute"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const limit_image_middleWare_1 = require("../middleware/limit.image.middleWare");
app.use(express_1.default.json());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
const PORT = process.env.PORT;
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "https://teacher-olive-zeta.vercel.app"],
    credentials: true,
}));
app.use("/users", uerRoute_1.default);
app.use("/courses", courseRoute_1.default);
app.use("/courses/chapters", chapterRoute_1.default);
app.use("/courses/lessons", lessonRoute_1.default);
app.use("/enrollement", enrollmentRouter_1.default);
app.use("/payments", paymentRoute_1.default);
app.use("/stats", statsRoute_1.default);
app.use("/lessons/progress", lessonProggress_1.default);
app.use(limit_image_middleWare_1.multerErrorHandler);
app.listen(PORT, () => {
    console.log(`your server is running on ${PORT}`);
});
