"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetUserPassword = exports.getMe = exports.updateRole = exports.loginUser = exports.deleteUser = exports.updateUser = exports.getOneUser = exports.getAllUsers = exports.createUser = void 0;
const client_1 = require("@prisma/client");
const argon2_1 = __importDefault(require("argon2"));
const jwt_1 = require("../../helpers/jwt");
const cloudinary_1 = require("../utils/cloudinary");
const Prisma = new client_1.PrismaClient();
// Helper to save base64 image
const createUser = async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;
        // Get Cloudinary URLs
        const profilePhoto = files?.profilePhoto?.[0]?.path;
        const coverPhoto = files?.coverPhoto?.[0]?.path;
        // // Validate all required fields
        if (!data.email ||
            !data.password ||
            !data.username ||
            !data.fullName ||
            !data.phone_number ||
            !data.comfirmPassword ||
            !data.sex) {
            res.status(400).json({
                isSuccess: false,
                message: "Please provide all required fields",
            });
            return;
        }
        // Check password match
        if (data.password !== data.comfirmPassword) {
            res.status(400).json({
                isSuccess: false,
                message: "Password and confirm password do not match",
            });
            return;
        }
        // Check if email exists
        const userExists = await Prisma.user.findFirst({
            where: { email: data.email.toLowerCase() },
        });
        if (userExists) {
            res.status(400).json({
                isSuccess: false,
                message: "User with this email already exists",
            });
            return;
        }
        // Check if username exists
        // In createUser function:
        const usernameTaken = await Prisma.user.findFirst({
            where: {
                username: {
                    equals: data.username,
                    mode: "insensitive",
                },
            },
        });
        if (usernameTaken) {
            res.status(400).json({
                isSuccess: false,
                message: "Username is already taken!",
            });
            return;
        }
        // Hash password
        const hashedPassword = await argon2_1.default.hash(data.password);
        // Create new user
        const newUser = await Prisma.user.create({
            data: {
                username: data.username,
                email: data.email.toLowerCase(),
                full_name: data.fullName,
                is_active: true,
                phone_number: data.phone_number,
                password: hashedPassword,
                profilePhoto,
                coverPhoto,
                sex: data.sex.toUpperCase(),
            },
        });
        const { password, ...rest } = newUser;
        res.status(201).json({
            isSuccess: true,
            message: "Successfully created user",
            user: rest,
        });
    }
    catch (error) {
        if (req.files) {
            const files = req.files;
            await Promise.all([
                (0, cloudinary_1.deleteFromCloudinary)(files?.profilePhoto?.[0]?.filename),
                (0, cloudinary_1.deleteFromCloudinary)(files?.coverPhoto?.[0]?.filename),
            ]);
        }
        console.error("Create user error:", error);
        res.status(500).json({
            isSuccess: false,
            message: "Server error",
        });
        return;
    }
};
exports.createUser = createUser;
const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const perPage = Math.max(1, parseInt(req.query.limit) || 10);
        const [users, total] = await Promise.all([
            Prisma.user.findMany({
                skip: (page - 1) * perPage,
                take: perPage,
                include: {
                    enrollements: true,
                    courses: true,
                },
            }),
            Prisma.user.count(),
        ]);
        if (!users) {
            res.status(404).json({
                isSuccess: false,
                message: "no users found!",
            });
            return;
        }
        const sanitizedUsers = users.map(({ password, ...rest }) => rest);
        res.status(200).json({
            isSuccess: true,
            message: "successfully fetched!",
            users: sanitizedUsers,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            isSucccess: false,
            message: "server error",
        });
    }
};
exports.getAllUsers = getAllUsers;
const getOneUser = async (req, res) => {
    try {
        const { userId } = req.params;
        // check if the user is exist
        const user = await Prisma.user.findFirst({
            where: {
                id: +userId,
            },
        });
        if (!user) {
            res.status(404).json({
                isSuccess: false,
                message: "user not found!",
            });
            return;
        }
        const { password, ...rest } = user;
        res.status(200).json({
            isSuccess: true,
            message: "success",
            user: rest,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            isSuccess: false,
            message: "server error",
        });
    }
};
exports.getOneUser = getOneUser;
const updateUser = async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;
        // Halkaan waxaad helaysaa URL-ada Cloudinary
        const profilePhoto = files?.profilePhoto?.[0]?.path;
        const coverPhoto = files?.coverPhoto?.[0]?.path;
        if (+!data.id ||
            !data.username ||
            !data.email ||
            !data.fullName ||
            !data.phone_number) {
            res.status(400).json({
                isSuccess: false,
                message: "validating error",
            });
            return;
        }
        const existingUser = await Prisma.user.findFirst({
            where: { id: Number(data.id) },
        });
        if (!existingUser) {
            res.status(404).json({
                isSuccess: false,
                message: "user is not exist",
            });
            return;
        }
        const updatedUser = await Prisma.user.update({
            where: { id: Number(data.id) },
            data: {
                username: data.username,
                email: data.email,
                full_name: data.fullName,
                phone_number: data.phone_number,
                // password: hashedPassword,
                ...(profilePhoto && { profilePhoto }),
                ...(coverPhoto && { coverPhoto }),
            },
        });
        const { password, ...rest } = updatedUser;
        res.status(202).json({
            isSuccess: true,
            messsage: "success",
            updatedUser: rest,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            isSuccess: false,
            message: "server error",
        });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await Prisma.user.findFirst({
            where: {
                id: +userId,
            },
        });
        if (user) {
            // Delete user's images from Cloudinary
            await Promise.all([
                (0, cloudinary_1.deleteFromCloudinary)((0, cloudinary_1.getPublicIdFromUrl)(user.profilePhoto)),
                (0, cloudinary_1.deleteFromCloudinary)((0, cloudinary_1.getPublicIdFromUrl)(user.coverPhoto)),
            ]);
        }
        if (!user) {
            res.status(404).json({
                isSuccess: false,
                message: "User not found",
            });
            return;
        }
        // Delete enrollments
        const enrollements = await Prisma.enrollment.findMany({
            where: {
                userId: user.id,
            },
        });
        const enrolleIds = enrollements.map((enrl) => enrl.id);
        if (enrolleIds.length > 0) {
            await Prisma.enrollment.deleteMany({
                where: {
                    id: { in: enrolleIds },
                },
            });
        }
        // Get the courses created by the user
        const userCourses = await Prisma.course.findMany({
            where: {
                userId: user.id,
            },
            select: { id: true },
        });
        const courseIds = userCourses.map((course) => course.id);
        if (courseIds.length > 0) {
            // Delete all lessons linked to the user's courses
            await Prisma.lessons.deleteMany({
                where: {
                    courseId: { in: courseIds },
                },
            });
            // Delete chapters of user's courses
            await Prisma.chapter.deleteMany({
                where: {
                    courseId: { in: courseIds },
                },
            });
            // Now it's safe to delete the courses
            await Prisma.course.deleteMany({
                where: {
                    id: { in: courseIds },
                },
            });
        }
        // Delete the user finally
        const deletingUser = await Prisma.user.delete({
            where: {
                id: +userId,
            },
        });
        res.status(200).json({
            isSuccess: true,
            message: "Successfully deleted!",
            deletingUser,
        });
    }
    catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({
            isSuccess: false,
            message: "Server error",
        });
    }
};
exports.deleteUser = deleteUser;
const loginUser = async (req, res) => {
    try {
        const data = req.body;
        // check the email is correct
        const user = await Prisma.user.findFirst({
            where: {
                email: data.email.toLowerCase(),
            },
        });
        if (!user) {
            res.status(401).json({
                isSuccess: false,
                message: "Incorrect Email",
            });
            return;
        }
        // check the password is correct
        const isPasswordCorrect = await argon2_1.default.verify(user.password, data.password);
        if (!isPasswordCorrect) {
            res.status(401).json({
                isSuccess: false,
                message: "Incorrect Password",
            });
            return;
        }
        const token = (0, jwt_1.generateWebToken)(user.id);
        const { password, ...rest } = user;
        res.status(200).json({
            isSuccess: true,
            message: "successfully loging in",
            user: rest,
            token: token,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            isSuccess: false,
            message: "server error",
        });
    }
};
exports.loginUser = loginUser;
const updateRole = async (req, res) => {
    try {
        const data = req.body;
        if (!data.email || !data.role) {
            res.status(400).json({
                isSuccess: false,
                message: "Feilds of updating role is required",
            });
            return;
        }
        const checkUser = await Prisma.user.findFirst({
            where: {
                email: data.email,
            },
        });
        if (!checkUser) {
            res.status(401).json({
                isSuccess: false,
                message: "anAuthorized",
            });
            return;
        }
        const user = await Prisma.user.update({
            where: {
                email: data.email,
            },
            data: {
                role: data.role,
            },
            include: {
                courses: {
                    select: {
                        id: true,
                        userId: true,
                        course_img: true,
                        cover_img: true,
                        preview_course_url: true,
                        title: true,
                        description: true,
                        is_published: true,
                        price_dlr: true,
                        price_shl: true,
                        created_at: true,
                        updated_at: true,
                        chapters: true,
                        users: true,
                    },
                },
                lesson: true,
                enrollements: {
                    include: {
                        course: true,
                    },
                },
            },
        });
        const { password, ...rest } = checkUser;
        res.status(200).json({
            isSuccess: true,
            message: "use role updated successfully",
            user: rest,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            isSuccess: false,
            message: "Server Error",
        });
    }
};
exports.updateRole = updateRole;
const getMe = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({
                isSuccess: false,
                message: "an authorized",
            });
            return;
        }
        const user = await Prisma.user.findUnique({
            where: { id: userId },
            include: {
                enrollements: {
                    include: {
                        course: {
                            include: {
                                chapters: {
                                    include: {
                                        lesson: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const { password, ...rest } = user;
        res.status(200).json({ isSuccess: true, user: rest });
    }
    catch (error) {
        console.error("getMe error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getMe = getMe;
const resetUserPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        if (!userId || !newPassword) {
            res.status(400).json({
                isSuccess: false,
                message: "User ID and new password are required.",
            });
            return;
        }
        const user = await Prisma.user.findUnique({
            where: { id: Number(userId) },
        });
        if (!user) {
            res.status(404).json({
                isSuccess: false,
                message: "User not found.",
            });
            return;
        }
        const hashedPassword = await argon2_1.default.hash(newPassword);
        await Prisma.user.update({
            where: { id: Number(userId) },
            data: {
                password: hashedPassword,
            },
        });
        res.status(200).json({
            isSuccess: true,
            message: "Password reset successfully!",
        });
    }
    catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
        });
    }
};
exports.resetUserPassword = resetUserPassword;
