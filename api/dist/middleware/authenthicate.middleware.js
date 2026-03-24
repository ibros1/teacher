"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ isSuccess: false, message: "Unauthorized" });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({ isSuccess: false, message: "Token missing" });
            return;
        }
        const result = jsonwebtoken_1.default.verify(token, process.env.jwt_secret_key);
        req.userId = result.userId; // <== Important
        next();
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ isSuccess: false, message: "Invalid token" });
    }
};
exports.authenticate = authenticate;
