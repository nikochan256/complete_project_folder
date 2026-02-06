var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../lib/prisma.js";
export const createUser = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.upsert({
            where: {
                walletAddress: address, // MUST be unique (it already is in your schema)
            },
            update: {}, // do nothing if user already exists
            create: {
                walletAddress: address,
                cart: {
                    create: {},
                },
                orders: {
                    create: {},
                },
            },
        });
        return user;
    }
    catch (err) {
        throw err;
    }
});
export const getCartItem = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartProducts = yield prisma.cartItem.findMany({});
        return cartProducts;
    }
    catch (err) {
        throw err;
    }
});
export const getCartDetails = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield prisma.cart.findUnique({
            where: {
                userId: userId
            },
            include: {
                cartItems: true
            }
        });
        return cart;
    }
    catch (err) {
        throw err;
    }
});
export const createNewOrder = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield prisma.order.findFirst({
            where: {
                userId: payload.userId,
            },
        });
        if (!order) {
            throw new Error("Order not found for user");
        }
        const orderItem = yield prisma.orderItem.create({
            data: {
                orderId: order.id,
                quantity: payload.quantity || 1,
                variantId: String(payload.variantId),
                productId: payload.storeId,
                productImg: payload.productImg,
                productPrice: payload.productPrice,
                productName: payload.productName,
                status: payload.status, // Remove type assertion
                totalAmount: payload.totalAmount,
                deliveryAddress: payload.deliveryAddress,
                userEmail: payload.userEmail,
                city: payload.city,
                zipCode: payload.zipCode,
                state: payload.state,
                country: payload.country
            },
        });
        return orderItem;
    }
    catch (err) {
        throw err;
    }
});
