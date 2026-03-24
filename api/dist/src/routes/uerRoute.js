"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const user_1 = require("../../schema/user");
const validation_1 = require("../../middleware/validation");
const authenthicate_middleware_1 = require("../../middleware/authenthicate.middleware");
const authorize_1 = require("../../middleware/authorize");
const limit_image_middleWare_1 = require("../../middleware/limit.image.middleWare");
const cloudinary_1 = require("../utils/cloudinary");
const router = (0, express_1.Router)();
// Apply multer error handler middleware first
router.use(limit_image_middleWare_1.multerErrorHandler);
router.post("/create", 
// Process files FIRST
cloudinary_1.userUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
]), 
// Then validate
user_1.registerUserSchema, validation_1.validtionMidlleware, userController_1.createUser);
router.post("/login", user_1.loginUserSchema, validation_1.validtionMidlleware, userController_1.loginUser);
router.get("/list", (0, authorize_1.authorize)(["ADMIN"]), userController_1.getAllUsers);
router.get("/list/:userId", userController_1.getOneUser);
router.put("/update", authenthicate_middleware_1.authenticate, cloudinary_1.userUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
]), userController_1.updateUser);
router.put("/role/update", authenthicate_middleware_1.authenticate, (0, authorize_1.authorize)(["ADMIN"]), userController_1.updateRole);
router.get("/me", authenthicate_middleware_1.authenticate, userController_1.getMe);
router.delete("/delete/:userId", authenthicate_middleware_1.authenticate, (0, authorize_1.authorize)(["ADMIN"]), userController_1.deleteUser);
router.patch("/reset-password", authenthicate_middleware_1.authenticate, (0, authorize_1.authorize)(["ADMIN"]), userController_1.resetUserPassword);
exports.default = router;
