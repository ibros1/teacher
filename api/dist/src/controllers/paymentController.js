"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayment = exports.getAllPayments = exports.getPaymentById = exports.updatePayment = exports.createPayment = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createPayment = async (req, res) => {
    try {
        const userPayment = req.body;
        const data = req.body;
        if (!data.userId ||
            !data.courseId ||
            !data.amount ||
            !data.currency ||
            !data.phoneNumber ||
            !Object.values(client_1.PaymentStatus).includes(data.status) ||
            !Object.values(client_1.PaymentMethod).includes(data.payment_method) ||
            !Object.values(client_1.Currency).includes(data.currency)) {
            res.status(400).json({
                isSuccess: false,
                message: "payment needs valid requirements",
            });
            return;
        }
        const userId = await prisma.user.findFirst({
            where: {
                id: data.userId,
            },
        });
        if (!userId) {
            res.status(404).json({
                isSuccess: false,
                message: "no user found!",
            });
            return;
        }
        const courseId = await prisma.course.findFirst({
            where: {
                id: data.courseId,
            },
        });
        if (!courseId) {
            res.status(404).json({
                isSuccess: false,
                message: "no course found!",
            });
            return;
        }
        const activeEnrollment = await prisma.enrollment.findFirst({
            where: {
                userId: data.userId,
                courseId: data.courseId,
                status: {
                    in: [client_1.EnrollmentStatus.IN_PROGRESS, client_1.EnrollmentStatus.COMPLETED]
                }
            }
        });
        if (activeEnrollment) {
            res.status(400).json({
                isSuccess: false,
                message: "User already has an active or pending enrollment for this course.",
            });
            return;
        }
        const payment = await prisma.payment.create({
            data: {
                userId: data.userId,
                courseId: data.courseId,
                enrollementId: data.enrollementId,
                phone_Number: data.phoneNumber,
                amount: data.amount,
                currency: data.currency,
                status: data.status,
                isEnrolled: data.isEnrolled,
                payment_method: data.payment_method,
            },
            include: {
                user: {
                    select: {
                        full_name: true,
                        email: true,
                        profilePhoto: true,
                        role: true,
                    },
                },
                course: true,
            },
        });
        res.status(201).json({
            isSuccess: true,
            message: "successfully created payment",
            payment,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create payment",
        });
    }
};
exports.createPayment = createPayment;
const updatePayment = async (req, res) => {
    try {
        const data = req.body;
        console.log(data);
        if (!data.id ||
            data.isEnrolled === undefined ||
            !Object.values(client_1.PaymentStatus).includes(data.status)) {
            res.status(400).json({
                isSuccess: false,
                message: "validating error",
            });
            return;
        }
        const checkPayment = await prisma.payment.findUnique({
            where: {
                id: data.id,
            },
        });
        if (!checkPayment) {
            res.status(404).json({
                isSuccess: false,
                message: "payment not found!",
            });
            return;
        }
        const updatedPayment = await prisma.payment.update({
            where: {
                id: data.id,
            },
            data: {
                status: data.status,
                isEnrolled: data.isEnrolled,
            },
            include: {
                user: {
                    select: {
                        full_name: true,
                        email: true,
                        profilePhoto: true,
                        role: true,
                    },
                },
                course: true,
            },
        });
        res.status(201).json({
            isSuccess: true,
            message: "Success",
            updatedPayment,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create payment",
        });
    }
};
exports.updatePayment = updatePayment;
const getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await prisma.payment.findUnique({
            where: {
                id: paymentId,
            },
            include: {
                user: {
                    select: {
                        full_name: true,
                        email: true,
                        profilePhoto: true,
                        role: true,
                    },
                },
                course: true,
            },
        });
        if (!payment) {
            res.status(404).json({
                isSuccess: false,
                message: "no payment found!",
            });
            return;
        }
        res.status(200).json({
            isSuccess: true,
            message: "success",
            payment,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to retrieve payment",
        });
    }
};
exports.getPaymentById = getPaymentById;
const getAllPayments = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const perPage = Math.max(1, parseInt(req.query.limit) || 10);
        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where: {
                    status: client_1.PaymentStatus.PAID,
                    isEnrolled: true,
                },
                skip: (page - 1) * perPage,
                take: perPage,
                include: {
                    user: {
                        select: {
                            full_name: true,
                            email: true,
                            profilePhoto: true,
                            role: true,
                        },
                    },
                    course: true,
                },
            }),
            prisma.payment.count({
                where: {
                    status: client_1.PaymentStatus.PAID,
                    isEnrolled: true,
                },
            }),
        ]);
        if (!payments) {
            res.status(400).json({
                isSuccess: false,
                message: "no payment found yet!",
            });
            return;
        }
        res.status(200).json({
            isSuccess: true,
            message: "success",
            payments,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to retrieve payments",
        });
    }
};
exports.getAllPayments = getAllPayments;
const deletePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await prisma.payment.findUnique({
            where: {
                id: paymentId,
            },
        });
        if (!payment) {
            res.status(404).json({
                isSuccess: false,
                message: "no payment found!",
            });
            return;
        }
        const deletingPayment = await prisma.payment.delete({
            where: {
                id: paymentId,
            },
        });
        res.status(200).json({
            isSuccess: false,
            message: "successfully deleted payment!",
            deletingPayment,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to delete payment",
        });
    }
};
exports.deletePayment = deletePayment;
