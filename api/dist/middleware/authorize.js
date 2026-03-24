"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authorize = (roles) => {
    return async (req, res, next) => {
        const user = await prisma.user.findFirst({
            where: {
                id: req.userId,
            },
        });
        if (!user) {
            res.status(401).json({
                isSuccess: false,
                message: "anAuthorized",
            });
            return;
        }
        if (roles.includes(user.role)) {
            next();
            return;
        }
        res.status(400).json({
            isSuccess: false,
            message: "Access denied. you are not admin!!",
        });
        return;
    };
};
exports.authorize = authorize;
