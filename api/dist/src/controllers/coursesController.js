"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.getOneCourse = exports.updateCourse = exports.getAllCourses = exports.createCourse = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = require("../utils/cloudinary");
const prisma = new client_1.PrismaClient();
const createCourse = async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;
        const course_img = files?.course_img?.[0]?.path;
        const cover_img = files?.cover_img?.[0]?.path;
        // // Base64 fallback
        // if (!course_img && data.course_img?.startsWith("data:image")) {
        //   course_img = saveBase64Image(data.course_img, `course_img-${Date.now()}`);
        // }
        // if (!cover_img && data.cover_img?.startsWith("data:image")) {
        //   cover_img = saveBase64Image(data.cover_img, `cover_img-${Date.now()}`);
        // }
        if (!data.title ||
            !course_img ||
            !cover_img ||
            !data.preview_course ||
            data.isPublished === undefined ||
            data.price_dlr === undefined ||
            data.price_shl === undefined) {
            res.status(400).json({
                isSuccess: false,
                message: "Validating course error: missing or invalid fields",
            });
            return;
        }
        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });
        if (!user) {
            res.status(400).json({
                isSuccess: false,
                message: "Can't create course because user doesn't exist",
            });
            return;
        }
        const isPublished = typeof data.isPublished === "boolean"
            ? data.isPublished
            : data.isPublished === "true";
        const course = await prisma.course.create({
            data: {
                userId: req.userId,
                course_img: course_img,
                cover_img: cover_img,
                preview_course_url: data.preview_course,
                title: data.title,
                description: data.description,
                is_published: isPublished,
                price_dlr: data.price_dlr.toString(),
                price_shl: data.price_shl,
            },
        });
        res.status(201).json({
            isSuccess: true,
            message: "Successfully created!",
            course,
        });
    }
    catch (error) {
        if (req.files) {
            const files = req.files;
            await Promise.all([
                (0, cloudinary_1.deleteFromCloudinary)(files?.course_img?.[0]?.filename),
                (0, cloudinary_1.deleteFromCloudinary)(files?.cover_img?.[0]?.filename),
            ]);
        }
        console.error(error);
        res.status(500).json({
            isSuccess: false,
            message: "Server error!",
        });
    }
};
exports.createCourse = createCourse;
const getAllCourses = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const perPage = Math.max(1, parseInt(req.query.limit) || 10);
        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                skip: (page - 1) * perPage,
                take: perPage,
                include: {
                    chapters: {
                        include: {
                            lesson: true,
                        },
                    },
                    lesson: true,
                    enrollments: true,
                    users: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            full_name: true,
                            profilePhoto: true,
                        },
                    },
                },
                orderBy: { updated_at: "desc" },
            }),
            prisma.course.count(),
        ]);
        const totalPages = Math.ceil(total / perPage);
        res.status(200).json({
            isSuccess: true,
            courses,
            total,
            page,
            perPage,
            totalPages,
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
exports.getAllCourses = getAllCourses;
const updateCourse = async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;
        const course_img = files?.course_img?.[0]?.path;
        const cover_img = files?.cover_img?.[0]?.path;
        // Base64 fallback
        // if (!course_img && data.course_img?.startsWith("data:image")) {
        //   course_img = saveBase64Image(data.course_img, `course_img-${Date.now()}`);
        // }
        // if (!cover_img && data.cover_img?.startsWith("data:image")) {
        //   cover_img = saveBase64Image(data.cover_img, `cover_img-${Date.now()}`);
        // }
        if (!data.title ||
            !data.description ||
            data.isPublished === undefined ||
            data.price_dlr === undefined ||
            data.price_shl === undefined ||
            !data.preview_course) {
            res.status(400).json({
                isSuccess: false,
                message: "validating course error",
            });
            return;
        }
        const courseId = await prisma.course.findUnique({
            where: {
                id: Number(data.id),
            },
        });
        if (!courseId) {
            res.status(404).json({
                isSuccess: false,
                message: "course not found",
            });
            return;
        }
        const isPublished = typeof data.isPublished === "boolean"
            ? data.isPublished
            : data.isPublished === "true";
        const updatingCourse = await prisma.course.update({
            where: {
                id: +data.id,
            },
            data: {
                title: data.title,
                course_img: course_img,
                cover_img: cover_img,
                preview_course_url: data.preview_course,
                description: data.description,
                is_published: isPublished,
                price_dlr: String(data.price_dlr),
                price_shl: data.price_shl,
            },
        });
        res.status(200).json({
            isSuccess: true,
            message: "success",
            updatingCourse,
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
exports.updateCourse = updateCourse;
const getOneCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        // check if te course exists
        const course = await prisma.course.findFirst({
            where: {
                id: parseInt(courseId),
            },
            include: {
                chapters: true,
                enrollments: true,
                lesson: true,
                users: true,
            },
        });
        if (!course) {
            res.status(404).json({
                isSuccess: false,
                message: "course not found!",
            });
            return;
        }
        res.status(200).json({
            isSuccess: true,
            message: "success",
            course,
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
exports.getOneCourse = getOneCourse;
const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        // Check if the course exists
        const course = await prisma.course.findUnique({
            where: { id: +courseId },
        });
        if (!course) {
            res.status(404).json({
                isSuccess: false,
                message: "course not found",
            });
            return;
        }
        // 1. Find and delete all related lessons (by chapterId)
        const chapters = await prisma.chapter.findMany({
            where: { courseId: course.id },
        });
        const chapterIds = chapters.map((ch) => ch.id);
        await prisma.lessons.deleteMany({
            where: {
                chapterId: { in: chapterIds },
            },
        });
        // 2. Delete chapters
        await prisma.chapter.deleteMany({
            where: {
                courseId: course.id,
            },
        });
        // 3. Delete enrollments
        await prisma.enrollment.deleteMany({
            where: {
                courseId: course.id,
            },
        });
        // 4. Delete payments (fix foreign key error)
        await prisma.payment.deleteMany({
            where: { courseId: course.id },
        });
        if (course) {
            // Delete course images from Cloudinary
            await Promise.all([
                (0, cloudinary_1.deleteFromCloudinary)((0, cloudinary_1.getPublicIdFromUrl)(course.course_img)),
                (0, cloudinary_1.deleteFromCloudinary)((0, cloudinary_1.getPublicIdFromUrl)(course.cover_img)),
            ]);
        }
        // 4. Finally delete the course
        const deletingCourse = await prisma.course.delete({
            where: { id: +courseId },
        });
        res.status(202).json({
            isSuccess: true,
            message: "Successfully deleted!",
            deletingCourse,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            isSuccess: false,
            message: "Server error",
        });
        return;
    }
};
exports.deleteCourse = deleteCourse;
