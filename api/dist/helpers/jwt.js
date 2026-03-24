"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWebToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateWebToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.jwt_secret_key, {
        expiresIn: "365d",
    });
};
exports.generateWebToken = generateWebToken;
