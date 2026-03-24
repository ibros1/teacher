"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAdminStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        // Last Month calc
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const [totalRevenue, thisWeekRevenue, lastMonthRevenue, totalLessons, totalChapters, totalStudents, paymentMethods] = await Promise.all([
            // Total Revenue
            prisma.payment.aggregate({
                where: { status: client_1.PaymentStatus.PAID },
                _sum: { amount: true }
            }),
            // This Week Revenue
            prisma.payment.aggregate({
                where: {
                    status: client_1.PaymentStatus.PAID,
                    created_at: { gte: startOfWeek }
                },
                _sum: { amount: true }
            }),
            // Last Month Revenue
            prisma.payment.aggregate({
                where: {
                    status: client_1.PaymentStatus.PAID,
                    created_at: {
                        gte: startOfLastMonth,
                        lte: endOfLastMonth
                    }
                },
                _sum: { amount: true }
            }),
            // Counts
            prisma.lessons.count(),
            prisma.chapter.count(),
            prisma.user.count({ where: { role: 'STUDENT' } }),
            // Payment Methods
            prisma.payment.groupBy({
                by: ['payment_method'],
                where: { status: client_1.PaymentStatus.PAID },
                _sum: { amount: true },
                _count: { id: true }
            })
        ]);
        // Calculate percentages for methods
        const totalMethodRevenue = paymentMethods.reduce((acc, m) => acc + (m._sum.amount || 0), 0);
        res.status(200).json({
            isSuccess: true,
            data: {
                totalRevenue: totalRevenue._sum.amount || 0,
                thisWeekRevenue: thisWeekRevenue._sum.amount || 0,
                lastMonthRevenue: lastMonthRevenue._sum.amount || 0,
                totalLessons,
                totalChapters,
                totalStudents,
                paymentMethods: paymentMethods.map(m => ({
                    name: m.payment_method,
                    amount: m._sum.amount || 0,
                    count: m._count.id,
                    percentage: totalMethodRevenue > 0
                        ? Math.round(((m._sum.amount || 0) / totalMethodRevenue) * 100) + "%"
                        : "0%"
                }))
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ isSuccess: false, message: "Failed to fetch stats" });
    }
};
exports.getAdminStats = getAdminStats;
