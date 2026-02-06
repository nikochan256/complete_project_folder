var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import prisma from "../lib/prisma.js";
const router = express.Router();
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        // Find admin by email
        const admin = yield prisma.admin.findUnique({
            where: { email },
        });
        // If admin doesn't exist
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // Compare passwords (plain text comparison)
        const isPasswordValid = password === admin.password;
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // Success - credentials match
        return res.status(200).json({
            success: true,
            message: "Login successful",
            admin: {
                id: admin.id,
                email: admin.email,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}));
router.post("/update-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword, email } = req.body;
        console.log("Received data:", {
            currentPassword: !!currentPassword,
            newPassword: !!newPassword,
            email,
        }); // Debug log
        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required",
            });
        }
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
        // Find admin by email
        const admin = yield prisma.admin.findUnique({
            where: { email },
        });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }
        // Verify current password
        if (currentPassword !== admin.password) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }
        // Update password
        yield prisma.admin.update({
            where: { email },
            data: { password: newPassword },
        });
        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch (error) {
        console.error("Update password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}));
// Get All Products (from all sellers) - PUBLIC ROUTE
export default router;
