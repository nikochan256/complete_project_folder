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
export const createStore = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🔍 Checking if seller already exists...");
        // Check if wallet address already exists
        const alreadySeller = yield prisma.seller.findUnique({
            where: { walletAddress: payload.walletAddress },
        });
        if (alreadySeller) {
            console.error("❌ Seller with this wallet address already exists");
            throw new Error("A store with this wallet address already exists");
        }
        // Check if business email already exists
        const alreadyBusinessEmail = yield prisma.seller.findUnique({
            where: { businessEmail: payload.businessEmail },
        });
        if (alreadyBusinessEmail) {
            console.error("❌ Seller with this business email already exists");
            throw new Error("A store with this business email already exists");
        }
        console.log("💾 Creating new store in database...");
        // Create new store
        const store = yield prisma.seller.create({
            data: {
                shopName: payload.shopName,
                walletAddress: payload.walletAddress,
                businessEmail: payload.businessEmail,
                description: payload.description,
                contactNumber: payload.contact,
                businessAddress: payload.address,
                api_key: payload.api_key,
                store_id: payload.store_id,
                kybDocuments: payload.kybDocument,
                logoImg: payload.logoImg,
                isApproved: false,
                createdAt: payload.createdAt || new Date(),
                updatedAt: new Date(),
            },
        });
        console.log("✅ Store created successfully:", store.id);
        return store;
    }
    catch (err) {
        console.error("❌ Error in createStore service:", err);
        throw err;
    }
});
export const addToprintfullCart = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("request reached addToprintfullCart here");
        const cart = yield prisma.cart.findUnique({
            where: {
                userId: payload.userId,
            }
        });
        console.log(cart);
        if (!cart) {
            throw new Error("Cart not found for user");
        }
        // Check if item already exists in cart
        const existingItem = yield prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                variantId: payload.variant_id.toString()
            }
        });
        // If exists, update quantity; otherwise create new
        if (existingItem) {
            const updatedItem = yield prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + (payload.quantity || 1)
                }
            });
            console.log(updatedItem);
            return updatedItem;
        }
        const newCartItem = yield prisma.cartItem.create({
            data: {
                cartId: cart.id,
                storeId: payload.store_id,
                variantId: payload.variant_id, // Fixed typo here
                quantity: payload.quantity || 1,
                productImg: payload.productImg,
                productName: payload.productName,
                productPrice: payload.productPrice
            }
        });
        console.log(newCartItem);
        return newCartItem;
    }
    catch (err) {
        throw err;
    }
});
export const getAllStores = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //this is the correct format 
        // const allStores = await prisma.seller.findMany({
        //   where:{
        //     isApproved:true
        // }
        // })  
        const allStores = yield prisma.seller.findMany();
        return allStores;
    }
    catch (err) {
        throw err;
    }
});
export const getstoreApiKey = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apiKey = yield prisma.seller.findUnique({
            where: {
                store_id: id
            }
        });
        return apiKey;
    }
    catch (err) {
        throw err;
    }
});
export const deleteCartItemFromCart = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleteFromTheCart = yield prisma.cartItem.delete({
            where: {
                id: payload.cartItemId,
            }
        });
        return deleteFromTheCart;
    }
    catch (err) {
        throw err;
    }
});
export const updateQuantityinCart = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield prisma.cartItem.update({
            where: {
                id: payload.cartItemId
            },
            data: {
                quantity: payload.quantity
            }
        });
        return updated;
    }
    catch (err) {
        throw err;
    }
});
export const getStoreWalletAddress = (storeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletAddress = yield prisma.seller.findUnique({
            where: {
                store_id: storeId
            },
            select: {
                walletAddress: true
            }
        });
        return walletAddress;
    }
    catch (err) {
        throw err;
    }
});
export const updateOrderStatus = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedItem = yield prisma.orderItem.update({
            where: { id: Number(payload.orderItemId) },
            data: { status: payload.status }
        });
        return updatedItem;
    }
    catch (err) {
        throw err;
    }
});
