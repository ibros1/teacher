"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerErrorHandler = void 0;
const multer_1 = __importDefault(require("multer"));
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({
                isSuccess: false,
                message: "File too large. Max 5MB allowed.",
            });
            return; // just return void
        }
        // other multer error cases...
        res.status(400).json({ isSuccess: false, message: err.message });
        return;
    }
    // Handle 'Request aborted' errors
    if (err.message === "Request aborted") {
        res.status(400).json({
            isSuccess: false,
            message: "The upload was aborted by the client or connection was lost.",
        });
        return;
    }
    if (err.code === "LIMIT_FIELD_SIZE") {
        res.status(400).json({
            isSuccess: false,
            message: "Field value too long.",
        });
        return;
    }
    next(err);
};
exports.multerErrorHandler = multerErrorHandler;
