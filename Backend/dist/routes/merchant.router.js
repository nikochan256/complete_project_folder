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
import { deleteCartItemFromCart, getAllMerchants, getAllStores, getDashboardMetrics, getMerchantById, getMerchantsByStatus, getPendingMerchants, getstoreApiKey, updateOrderStatus, updateQuantityinCart, } from "../services/merchant.service.js";
import { upload } from "../config/multer.config.js";
import prisma from "../lib/prisma.js";
import { v2 as cloudinary } from "cloudinary";
import { randomInt } from "crypto";
import crypto from "crypto";
function generateRandomPassword(length = 12) {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
}
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const router = express.Router();
function uploadToCloudinary(fileBuffer_1, folder_1) {
    return __awaiter(this, arguments, void 0, function* (fileBuffer, folder, resourceType = "image", filename) {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: folder,
                resource_type: resourceType,
            };
            // For PDFs, add public_id and format to ensure proper URL
            if (resourceType === "raw") {
                uploadOptions.public_id = filename || `document_${Date.now()}`;
                uploadOptions.format = "pdf";
                uploadOptions.access_mode = "public";
                uploadOptions.flags = "attachment"; // Makes it downloadable
            }
            const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                }
                else {
                    console.log("Cloudinary upload success:", result.secure_url);
                    resolve(result.secure_url);
                }
            });
            uploadStream.end(fileBuffer);
        });
    });
}
// Add this helper function at the top of your file or in a utilities file
const generateUniqueSellerId = () => __awaiter(void 0, void 0, void 0, function* () {
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
        // Generate random 9-digit number (100000000 to 999999999)
        const randomId = randomInt(100000000, 1000000000);
        // Check if this ID already exists
        const existingSeller = yield prisma.seller.findUnique({
            where: { id: randomId },
        });
        if (!existingSeller) {
            return randomId;
        }
        attempts++;
    }
    throw new Error("Failed to generate unique seller ID after multiple attempts");
});
{
    // create-store working , need to add all the fields
    // new merchant features , printful integration,
    // i will get all the products from the printfull
    // i will need to store the user's api-key and store id in the database for now
    // seller schema will change now
    // cart logic will probably remain the same user must see all the products he has in  his cart
    // he should also see what all orders he has also purchased,
}
router.post("/create-store", upload.fields([
    { name: "image", maxCount: 1 },
    { name: "kybDocument", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const files = req.files;
        if (!files || !files.kybDocument || !files.image) {
            return res
                .status(400)
                .json({ msg: "image and kybDocument are required" });
        }
        // Generate unique 9-digit ID first
        const uniqueId = yield generateUniqueSellerId();
        // Generate random password
        const randomPassword = generateRandomPassword(12);
        // Upload logo image to Cloudinary
        const logoUrl = yield uploadToCloudinary(files.image[0].buffer, "seller-logos", "image");
        // Upload KYB document (PDF) to Cloudinary
        const kybDocumentUrl = yield uploadToCloudinary(files.kybDocument[0].buffer, "kyb-documents", "raw", `kyb_${body.businessEmail
            .replace("@", "_")
            .replace(".", "_")}_${Date.now()}`);
        const payload = {
            id: uniqueId,
            shopName: body.shopName,
            walletAddress: body.walletAddress,
            businessEmail: body.businessEmail,
            password: randomPassword, // Add generated password
            contactNumber: body.contact || null,
            businessAddress: body.address || null,
            logoImg: logoUrl,
            kybDocuments: kybDocumentUrl,
            description: body.description || null,
            kybStatus: "PENDING",
            isApproved: false,
        };
        const seller = yield prisma.seller.create({
            data: payload,
        });
        console.log("✅ Seller has been created", seller);
        // Send email notification with password (non-blocking)
        // try {
        //   fetch(
        //     "http://localhost:3002/emails/store-approval",
        //     {
        //       method: "POST",
        //       headers: {
        //         "Content-Type": "application/json",
        //       },
        //       body: JSON.stringify({
        //         email: body.businessEmail,
        //         shopName: body.shopName,
        //         password: randomPassword,
        //       }),
        //     }
        //   );
        // } catch (emailError) {
        //   console.error("⚠️ Email service error:", emailError);
        // }
        res.status(200).json({
            msg: "Store created successfully. Wait for admin to review and approve your application.",
            data: {
                id: seller.id,
                shopName: seller.shopName,
                businessEmail: seller.businessEmail,
                password: randomPassword, // Return password in response
                kybStatus: seller.kybStatus,
                isApproved: seller.isApproved,
                logoImg: seller.logoImg,
            },
        });
    }
    catch (err) {
        console.error("❌ Error creating store:", err);
        res.status(500).json({
            msg: "Store not created",
            error: err.message || "Unknown error occurred",
        });
    }
}));
router.post("/merchantLogin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("merchant login request reached here");
        const { email, password } = req.body;
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        // Find seller by email and password
        const seller = yield prisma.seller.findFirst({
            where: {
                businessEmail: email,
                password: password,
            },
            select: {
                id: true,
                isApproved: true,
            },
        });
        // Check if seller exists
        if (!seller) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        // Check if seller is approved
        if (!seller.isApproved) {
            return res.status(403).json({
                success: false,
                message: "Your account is pending approval",
            });
        }
        // Return seller ID on successful login
        return res.status(200).json({
            success: true,
            sellerId: seller.id,
            message: "Login successful",
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during login",
        });
    }
}));
router.put("/Merchat_update-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sellerId, currentPassword, newPassword } = req.body;
        // Validation
        if (!sellerId || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters",
            });
        }
        // Find seller and verify current password
        const seller = yield prisma.seller.findUnique({
            where: { id: Number(sellerId) },
            select: {
                id: true,
                password: true,
            },
        });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }
        // Verify current password
        if (seller.password !== currentPassword) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }
        // Update password
        yield prisma.seller.update({
            where: { id: Number(sellerId) },
            data: { password: newPassword },
        });
        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch (error) {
        console.error("Password update error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating password",
        });
    }
}));
// new routes for merchant dashboard, features needed -> create new products, delete, integrate with printfull, fetch products from printful, add printfull products to his own store, see all who has purchased the products, see his inventory/ all products
// on Dmarketplace on the products will be visible, and there will be products instead of shops rest remains the same slight changes in the schema and all will be there,
// on admin dashboard there shoule be an of creating new products that will be added to admins store, and he should also verify new merchants then only they'll be able to access it,
// on Dmarketplace user login normally , for merchant there will be more things required after login a mail will be sent to him with on which he will be accessing his merchant dashboard, if the admin has not verified him then he will not be able to create things there, only after the
// have to add a enum in the category section
// router.post(
//   "/add-product/:id",
//   upload.fields([{ name: "image", maxCount: 1 }]),
//   async (req: Request, res: Response) => {
//     const sellerId = Number(req.params.id);
//     const body = req.body;
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//     // Validate body fields
//     if (
//       !body.name ||
//       !body.description ||
//       !body.price ||
//       !body.stock ||
//       !body.category
//     ) {
//       return res.status(400).json({ msg: "Invalid payload received" });
//     }
//     // Validate uploaded image
//     if (!files || !files.image || files.image.length === 0) {
//       return res.status(400).json({ msg: "Image is required" });
//     }
//     const imagePath = files.image[0].path;
//     const payload = {
//       name: body.name,
//       description: body.description,
//       price: Number(body.price),
//       stock: Number(body.stock),
//       image: imagePath,
//       category: body.category,
//       sellerId: sellerId,
//     };
//     try {
//       const newProduct = await createProduct(payload);
//       return res.status(201).json({ msg: "Product created", data: newProduct });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ msg: "Server error" });
//     }
//   }
// );
// get all the products listed by merchant
// router.get("/all-products/:id" , async(req:Request , res:Response)=>{
//   try{
//        const sellerId = Number(req.params.id) ;
//        const get_merchants_products = await getMerchantProduct(sellerId);
//        const baseUrl = `${req.protocol}://${req.get('host')}`;
//        // Transform products to include full image URLs
//        const productsWithImageUrls = get_merchants_products.map(product => ({
//          ...product,
//          image: product.image ? `${baseUrl}/${product.image.replace(/\\/g, '/')}` : null
//        }));
//        res.status(200).json({
//          msg: "all the products of this merchant",
//          data: productsWithImageUrls
//        });
//   }catch(err){
//     res.status(500).json({msg:err})
//   }
// })
// router.post("/sync-store-products", async (req: Request, res: Response) => {
//   try {
//     const { store_id, api_key } = req.body;
//     // Validate input
//     if (!store_id || !api_key) {
//       return res.status(400).json({
//         msg: "store_id and api_key are required"
//       });
//     }
//     // Check if seller exists
//     const seller = await prisma.seller.findUnique({
//       where: { store_id: Number(store_id) }
//     });
// |
//     if (!seller) {
//       return res.status(404).json({
//         msg: "Seller not found with this store_id"
//       });
//     }
//     // Fetch products from Printful with retry logic
//     let productsData: string | null = null;
//     const maxRetries = 2;
//     let retryCount = 0;
//     while (retryCount <= maxRetries && !productsData) {
//       try {
//         console.log(`🔄 Fetching products from Printful... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
//         const productsResponse = await fetch("https://api.printful.com/store/products", {
//           headers: {
//             authorization: `Bearer ${api_key}`,
//             "X-PF-Store-Id": String(store_id)
//           },
//           signal: controller.signal
//         });
//         clearTimeout(timeoutId);
//         console.log("📦 Response status:", productsResponse.status);
//         if (productsResponse.ok) {
//           const productsJson = await productsResponse.json();
//           console.log("✅ Products fetched:", productsJson.result?.length || 0, "products");
//           // Store the products as a JSON string
//           productsData = JSON.stringify(productsJson);
//           break; // Exit retry loop on success
//         } else {
//           const errorText = await productsResponse.text();
//           console.warn('⚠️ Could not fetch products from Printful:', productsResponse.status, errorText);
//           retryCount++;
//         }
//       } catch (productError) {
//         retryCount++;
//         console.error(`⚠️ Error fetching products (Attempt ${retryCount}/${maxRetries + 1}):`, productError instanceof Error ? productError.message : productError);
//         if (retryCount <= maxRetries) {
//           console.log(`⏳ Retrying in 2 seconds...`);
//           await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
//         }
//       }
//     }
//     if (!productsData) {
//       return res.status(500).json({
//         msg: "Failed to fetch products from Printful after multiple attempts",
//         error: "Connection timeout or API error"
//       });
//     }
//     // Update seller with products data
//     const updatedSeller = await prisma.seller.update({
//       where: { store_id: Number(store_id) },
//       data: { productsData: productsData }
//     });
//     const productsCount = JSON.parse(productsData).result?.length || 0;
//     return res.status(200).json({
//       msg: "Products synced successfully",
//       seller: {
//         id: updatedSeller.id,
//         shopName: updatedSeller.shopName,
//         store_id: updatedSeller.store_id
//       },
//       productsCount: productsCount
//     });
//   } catch (err) {
//     console.error("❌ Error syncing store products:", err);
//     res.status(500).json({
//       msg: "Failed to sync products",
//       error: err instanceof Error ? err.message : "Internal server error"
//     });
//   }
// });
// Add this route to your user routes file
router.post("/add-recently-viewed", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, productId, storeId, productName, productImg, productPrice, variantId, } = req.body;
        // Validate input
        if (!userId ||
            !productId ||
            !storeId ||
            !productName ||
            !productImg ||
            !productPrice) {
            return res.status(400).json({
                msg: "Missing required fields",
            });
        }
        // Check if this product was already viewed by this user
        const existingView = yield prisma.recentlyViewedProduct.findFirst({
            where: {
                userId: parseInt(userId),
                productId: parseInt(productId),
                storeId: parseInt(storeId),
            },
        });
        if (existingView) {
            // Update the viewedAt timestamp
            const updated = yield prisma.recentlyViewedProduct.update({
                where: { id: existingView.id },
                data: { viewedAt: new Date() },
            });
            return res.status(200).json({
                msg: "Recently viewed updated",
                data: updated,
            });
        }
        // Create new recently viewed record
        const recentlyViewed = yield prisma.recentlyViewedProduct.create({
            data: {
                userId: parseInt(userId),
                productId: parseInt(productId),
                storeId: parseInt(storeId),
                productName: productName,
                productImg: productImg,
                productPrice: parseInt(productPrice),
                variantId: variantId || null,
            },
        });
        // Keep only last 20 viewed items per user
        const allViewed = yield prisma.recentlyViewedProduct.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { viewedAt: "desc" },
        });
        if (allViewed.length > 20) {
            // @ts-ignore
            const idsToDelete = allViewed.slice(20).map((item) => item.id);
            yield prisma.recentlyViewedProduct.deleteMany({
                where: { id: { in: idsToDelete } },
            });
        }
        return res.status(200).json({
            msg: "Added to recently viewed",
            data: recentlyViewed,
        });
    }
    catch (err) {
        console.error("Error adding to recently viewed:", err);
        res.status(500).json({
            msg: "Failed to add to recently viewed",
            error: err instanceof Error ? err.message : "Internal server error",
        });
    }
}));
// Add this route to your user routes file
router.get("/recently-viewed/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        if (!userId) {
            return res.status(400).json({
                msg: "User ID is required",
            });
        }
        const recentlyViewed = yield prisma.recentlyViewedProduct.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { viewedAt: "desc" },
            take: limit,
        });
        return res.status(200).json({
            msg: "Recently viewed products fetched",
            count: recentlyViewed.length,
            data: recentlyViewed,
        });
    }
    catch (err) {
        console.error("Error fetching recently viewed:", err);
        res.status(500).json({
            msg: "Failed to fetch recently viewed products",
            error: err instanceof Error ? err.message : "Internal server error",
        });
    }
}));
router.put("/update-product/:productId", upload.array("images", 3), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = parseInt(req.params.productId);
        const body = req.body;
        const files = req.files;
        console.log("Updating product:", productId);
        console.log("Body received:", body);
        console.log("New images count:", (files === null || files === void 0 ? void 0 : files.length) || 0);
        // Validate product ID
        if (isNaN(productId)) {
            return res.status(400).json({ msg: "Invalid product ID" });
        }
        // Check if product exists
        const existingProduct = yield prisma.product.findUnique({
            where: { id: productId },
            include: { seller: true },
        });
        if (!existingProduct) {
            return res.status(404).json({ msg: "Product not found" });
        }
        // Verify seller authorization
        if (body.sellerId &&
            parseInt(body.sellerId) !== existingProduct.sellerId) {
            return res
                .status(403)
                .json({ msg: "Unauthorized to update this product" });
        }
        // Prepare update data
        const updateData = {};
        if (body.name)
            updateData.name = body.name;
        if (body.description)
            updateData.description = body.description;
        if (body.price)
            updateData.price = parseInt(body.price);
        if (body.quantity !== undefined)
            updateData.quantity = parseInt(body.quantity);
        if (body.category)
            updateData.category = body.category;
        if (body.isActive !== undefined)
            updateData.isActive =
                body.isActive === "true" || body.isActive === true;
        // Handle image updates
        if (files && files.length > 0) {
            const imageUrls = yield Promise.all(files.map((file) => uploadToCloudinary(file.buffer, "product-images")));
            // Update images based on how many were uploaded
            updateData.image1 = imageUrls[0] || existingProduct.image1;
            updateData.image2 = imageUrls[1] || existingProduct.image2;
            updateData.image3 = imageUrls[2] || existingProduct.image3;
        }
        // Handle individual image deletions (if frontend sends deleteImage1, deleteImage2, etc.)
        if (body.deleteImage2 === "true")
            updateData.image2 = null;
        if (body.deleteImage3 === "true")
            updateData.image3 = null;
        // Update product
        const updatedProduct = yield prisma.product.update({
            where: { id: productId },
            data: updateData,
        });
        console.log("✅ Product updated successfully:", updatedProduct.id);
        res.status(200).json({
            msg: "Product updated successfully",
            data: updatedProduct,
        });
    }
    catch (err) {
        console.error("❌ Error updating product:", err);
        res.status(500).json({
            msg: "Failed to update product",
            error: err.message || "Unknown error occurred",
        });
    }
}));
// Delete Product Route
router.delete("/delete-product/:productId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = parseInt(req.params.productId);
        const { sellerId } = req.body;
        console.log("Deleting product:", productId);
        // Validate product ID
        if (isNaN(productId)) {
            return res.status(400).json({ msg: "Invalid product ID" });
        }
        // Check if product exists
        const existingProduct = yield prisma.product.findUnique({
            where: { id: productId },
            include: { seller: true },
        });
        if (!existingProduct) {
            return res.status(404).json({ msg: "Product not found" });
        }
        // Verify seller authorization
        if (sellerId && parseInt(sellerId) !== existingProduct.sellerId) {
            return res
                .status(403)
                .json({ msg: "Unauthorized to delete this product" });
        }
        // Delete product (this will cascade delete related cart items and order items)
        yield prisma.product.delete({
            where: { id: productId },
        });
        console.log("✅ Product deleted successfully:", productId);
        res.status(200).json({
            msg: "Product deleted successfully",
            productId: productId,
        });
    }
    catch (err) {
        console.error("❌ Error deleting product:", err);
        res.status(500).json({
            msg: "Failed to delete product",
            error: err.message || "Unknown error occurred",
        });
    }
}));
router.get("/products/:sellerId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerId = parseInt(req.params.sellerId);
        // Validate seller ID
        if (isNaN(sellerId)) {
            return res.status(400).json({ msg: "Invalid seller ID" });
        }
        // Check if seller exists
        const seller = yield prisma.seller.findUnique({
            where: { id: sellerId },
        });
        if (!seller) {
            return res.status(404).json({ msg: "Seller not found" });
        }
        // Fetch all products for this seller
        const products = yield prisma.product.findMany({
            where: { sellerId: sellerId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                quantity: true,
                category: true,
                image1: true,
                image2: true,
                image3: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        console.log(`✅ Fetched ${products.length} products for seller ${sellerId}`);
        res.status(200).json({
            success: true,
            total: products.length,
            products: products,
        });
    }
    catch (err) {
        console.error("❌ Error fetching merchant products:", err);
        res.status(500).json({
            msg: "Failed to fetch products",
            error: err.message || "Unknown error occurred",
        });
    }
}));
router.get("/all-merchants-products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🔍 Fetching all merchants with products...");
        // Fetch all sellers from database with their products
        const sellers = yield prisma.seller.findMany({
            select: {
                id: true,
                shopName: true,
                store_id: true,
                logoImg: true,
                description: true,
                kybStatus: true,
                isApproved: true,
                createdAt: true,
                // In backend route, update products select:
                products: {
                    where: {
                        isActive: true,
                    },
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        image1: true,
                        image2: true, // ADD
                        image3: true, // ADD
                        description: true, // ADD
                        category: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        if (sellers.length === 0) {
            return res.status(404).json({
                msg: "No merchants found",
                data: [],
            });
        }
        // Process and format the data
        const merchantsWithProducts = sellers.map((seller) => {
            return {
                merchant: {
                    id: seller.id,
                    shopName: seller.shopName,
                    store_id: seller.store_id,
                    logoImg: seller.logoImg,
                    description: seller.description,
                    kybStatus: seller.kybStatus,
                    isApproved: seller.isApproved,
                    createdAt: seller.createdAt,
                },
                products: seller.products, // ADD THIS
                productsCount: seller._count.products,
            };
        });
        // Calculate total statistics
        const totalMerchants = sellers.length;
        const totalProducts = merchantsWithProducts.reduce((sum, merchant) => sum + merchant.productsCount, 0);
        const merchantsWithProducts_count = merchantsWithProducts.filter((m) => m.productsCount > 0).length;
        console.log(`✅ Fetched ${totalMerchants} merchants with ${totalProducts} total products`);
        return res.status(200).json({
            msg: "All merchants products fetched successfully",
            statistics: {
                totalMerchants: totalMerchants,
                merchantsWithProducts: merchantsWithProducts_count,
                merchantsWithoutProducts: totalMerchants - merchantsWithProducts_count,
                totalProducts: totalProducts,
            },
            data: merchantsWithProducts,
        });
    }
    catch (err) {
        console.error("❌ Error fetching all merchants products:", err);
        res.status(500).json({
            msg: "Failed to fetch merchants products",
            error: err instanceof Error ? err.message : "Internal server error",
        });
    }
}));
router.post("/verify-printful-api", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("requrest reached here ");
        const { api_key } = req.body;
        if (!api_key) {
            return res.status(400).json({
                success: false,
                message: "API key is required",
            });
        }
        // Call Printful API from backend
        const response = yield fetch("https://api.printful.com/stores", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${api_key}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            return res.status(400).json({
                success: false,
                message: "Invalid Printful API Key",
            });
        }
        const data = yield response.json();
        if (data.result && data.result.length > 0) {
            return res.json({
                success: true,
                result: data.result,
                message: "API key verified successfully",
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: "No stores found for this API key",
            });
        }
    }
    catch (error) {
        console.error("Error verifying Printful API:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify API key. Please try again.",
        });
    }
}));
// route ot return all the available stores
router.get("/get-all-stores", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const all_stores = yield getAllStores();
        res
            .status(200)
            .json({ msg: "return all approved stores", data: all_stores });
    }
    catch (err) {
        res.status(500).json({ msg: err });
    }
}));
router.get("/dashboard-metrics", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const metrics = yield getDashboardMetrics();
        res.status(200).json({
            msg: "Dashboard metrics retrieved successfully",
            metrics: metrics,
        });
    }
    catch (err) {
        console.error("Error fetching dashboard metrics:", err);
        res
            .status(500)
            .json({ msg: "Failed to fetch dashboard metrics", error: err });
    }
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        let merchants;
        if (status && typeof status === "string") {
            // Validate status
            const validStatuses = ["PENDING", "APPROVED", "REJECTED", "UNDER_REVIEW"];
            const upperStatus = status.toUpperCase();
            if (!validStatuses.includes(upperStatus)) {
                return res.status(400).json({ msg: "Invalid status parameter" });
            }
            merchants = yield getMerchantsByStatus(upperStatus);
        }
        else {
            merchants = yield getAllMerchants();
        }
        // Transform data to match frontend expectations
        // @ts-ignore
        const formattedMerchants = merchants.map((merchant) => {
            // Map KYBStatus to frontend verification_status
            let verification_status;
            switch (merchant.kybStatus) {
                case "PENDING":
                    verification_status = "pending";
                    break;
                case "APPROVED":
                    verification_status = "approved";
                    break;
                case "REJECTED":
                    verification_status = "rejected";
                    break;
                case "UNDER_REVIEW":
                    verification_status = "under_review";
                    break;
                default:
                    verification_status = "pending";
            }
            return {
                id: merchant.id.toString(),
                name: merchant.shopName,
                category: "General", // Add category field to schema if needed
                city: merchant.businessAddress || "N/A",
                phone: merchant.contactNumber || "N/A",
                email: merchant.businessEmail,
                verification_status: verification_status,
                // @ts-ignore
                kybDocument: merchant.kybDocuments || null,
                logoImg: merchant.logoImg || null,
                // @ts-ignore
                walletAddress: merchant.walletAddress,
                description: merchant.description || null,
                // @ts-ignore
                rejectionReason: merchant.rejectionReason || null,
                created_at: merchant.createdAt.toISOString(),
            };
        });
        res.status(200).json({
            msg: "Merchants retrieved successfully",
            merchants: formattedMerchants,
        });
    }
    catch (err) {
        console.error("Error fetching merchants:", err);
        res.status(500).json({ msg: "Failed to fetch merchants", error: err });
    }
}));
router.get("/pending", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const merchants = yield getPendingMerchants();
        // Transform data to match frontend expectations
        // @ts-ignore
        const formattedMerchants = merchants.map((merchant) => ({
            id: merchant.id.toString(),
            name: merchant.shopName,
            category: "General", // You may want to add a category field to your schema
            city: merchant.businessAddress || "N/A",
            phone: merchant.contactNumber || "N/A",
            email: merchant.businessEmail,
            created_at: merchant.createdAt.toISOString(),
        }));
        res.status(200).json({
            msg: "Pending merchants retrieved successfully",
            merchants: formattedMerchants,
        });
    }
    catch (err) {
        console.error("Error fetching pending merchants:", err);
        res
            .status(500)
            .json({ msg: "Failed to fetch pending merchants", error: err });
    }
}));
// Get merchant details by ID
router.get("/:merchantId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const merchantId = parseInt(req.params.merchantId);
        if (isNaN(merchantId)) {
            return res.status(400).json({ msg: "Invalid merchant ID" });
        }
        const merchant = yield getMerchantById(merchantId);
        if (!merchant) {
            return res.status(404).json({ msg: "Merchant not found" });
        }
        res.status(200).json({
            msg: "Merchant details retrieved successfully",
            merchant: merchant,
        });
    }
    catch (err) {
        console.error("Error fetching merchant details:", err);
        res
            .status(500)
            .json({ msg: "Failed to fetch merchant details", error: err });
    }
}));
// Update merchant verification status
router.patch("/:merchantId/verification", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("request reached here");
        const merchantId = parseInt(req.params.merchantId);
        const { kybStatus, rejection_reason } = req.body; // ← Make sure this says kybStatus
        // Validate merchant ID
        if (isNaN(merchantId)) {
            return res.status(400).json({ msg: "Invalid merchant ID" });
        }
        // Validate KYB status
        if (!kybStatus ||
            !["APPROVED", "REJECTED", "UNDER_REVIEW", "PENDING"].includes(kybStatus)) {
            return res.status(400).json({
                msg: "Invalid KYB status. Must be 'APPROVED', 'REJECTED', 'UNDER_REVIEW', or 'PENDING'",
            });
        }
        // Validate rejection reason if status is REJECTED
        if (kybStatus === "REJECTED" && !rejection_reason) {
            return res.status(400).json({
                msg: "Rejection reason is required when rejecting a merchant",
            });
        }
        // Check if merchant exists
        const merchant = yield prisma.seller.findUnique({
            where: { id: merchantId },
        });
        if (!merchant) {
            return res.status(404).json({ msg: "Merchant not found" });
        }
        // Update merchant verification status
        const updatedMerchant = yield prisma.seller.update({
            where: { id: merchantId },
            data: {
                kybStatus: kybStatus,
                isApproved: kybStatus === "APPROVED",
                approvedAt: kybStatus === "APPROVED" ? new Date() : null,
                rejectionReason: kybStatus === "REJECTED" ? rejection_reason : null,
            },
        });
        // Send email notification to merchant (only for APPROVED or REJECTED)
        if (kybStatus === "APPROVED" || kybStatus === "REJECTED") {
            try {
                console.log("sending email verification ");
                const emailEndpoint = kybStatus === "APPROVED"
                    ? "https://gifq-sender-smtp-gifq.vercel.app/emails/store-approval"
                    : "https://gifq-sender-smtp-gifq.vercel.app/emails/store-rejected";
                fetch(emailEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: updatedMerchant.businessEmail,
                        shopName: updatedMerchant.shopName,
                        rejectionReason: rejection_reason || undefined,
                        merchantId: merchantId || undefined,
                        password: updatedMerchant.password || undefined,
                    }),
                });
            }
            catch (emailError) {
                console.error("⚠️ Email notification error:", emailError);
                // Don't fail the verification if email fails
            }
        }
        console.log(`✅ Merchant ${merchantId} ${kybStatus.toLowerCase()}`);
        res.status(200).json({
            msg: `Merchant status updated to ${kybStatus.toLowerCase()} successfully`,
            data: {
                id: updatedMerchant.id,
                shopName: updatedMerchant.shopName,
                kybStatus: updatedMerchant.kybStatus,
                isApproved: updatedMerchant.isApproved,
                approvedAt: updatedMerchant.approvedAt,
                rejectionReason: updatedMerchant.rejectionReason,
            },
        });
    }
    catch (err) {
        console.error("❌ Error updating merchant verification:", err);
        res.status(500).json({
            msg: "Failed to update merchant verification",
            error: err.message || "Unknown error occurred",
        });
    }
}));
// route to create product
router.post("/create-product", upload.array("images", 3), // Accept up to 3 product images
(req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const files = req.files;
        console.log("this is the body received from the frontend", body);
        console.log("Number of images received:", (files === null || files === void 0 ? void 0 : files.length) || 0);
        // Validate that at least one image is provided
        if (!files || files.length === 0) {
            return res
                .status(400)
                .json({ msg: "At least one product image is required" });
        }
        // Validate maximum 3 images
        if (files.length > 3) {
            return res.status(400).json({ msg: "Maximum 3 images allowed" });
        }
        // Validate required fields
        if (!body.name ||
            !body.price ||
            !body.category ||
            !body.description ||
            !body.sellerId) {
            return res.status(400).json({
                msg: "Missing required fields: name, price, category, description, sellerId",
            });
        }
        // Verify seller exists and is approved
        const seller = yield prisma.seller.findUnique({
            where: { id: parseInt(body.sellerId) },
        });
        if (!seller) {
            return res.status(404).json({ msg: "Seller not found" });
        }
        if (!seller.isApproved || seller.kybStatus !== "APPROVED") {
            return res.status(403).json({
                msg: "Seller must be approved before creating products",
            });
        }
        // Upload all product images to Cloudinary
        const imageUrls = yield Promise.all(files.map((file) => uploadToCloudinary(file.buffer, "product-images")));
        // Create product with uploaded images
        const product = yield prisma.product.create({
            data: {
                name: body.name,
                description: body.description,
                price: parseInt(body.price), // Price in cents
                quantity: parseInt(body.quantity) || 0,
                category: body.category,
                image1: imageUrls[0], // First image is required
                image2: imageUrls[1] || null, // Second image is optional
                image3: imageUrls[2] || null, // Third image is optional
                sellerId: parseInt(body.sellerId),
                isActive: true,
            },
        });
        console.log("✅ Product created successfully:", product.id);
        res.status(201).json({
            msg: "Product created successfully",
            data: {
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                image1: product.image1,
                image2: product.image2,
                image3: product.image3,
                quantity: product.quantity,
                isActive: product.isActive,
            },
        });
    }
    catch (err) {
        console.error("❌ Error creating product:", err);
        res.status(500).json({
            msg: "Failed to create product",
            error: err.message || "Unknown error occurred",
        });
    }
}));
router.post("/import-printfull-product", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        console.log("this is the body received from the frontend", body);
        if (!body.name ||
            !body.price ||
            !body.category ||
            !body.description ||
            !body.sellerId ||
            !body.imageUrl) {
            return res.status(400).json({
                msg: "Missing required fields: name, price, category, description, sellerId, imageUrl",
            });
        }
        // Verify seller exists and is approved
        const seller = yield prisma.seller.findUnique({
            where: { id: parseInt(body.sellerId) },
        });
        if (!seller) {
            return res.status(404).json({ msg: "Seller not found" });
        }
        if (!seller.isApproved || seller.kybStatus !== "APPROVED") {
            return res.status(403).json({
                msg: "Seller must be approved before creating products",
            });
        }
        const product = yield prisma.product.create({
            data: {
                name: body.name,
                description: body.description,
                price: parseInt(body.price), // Price in cents
                quantity: parseInt(body.quantity) || 0,
                category: body.category,
                image1: body.imageUrl,
                sellerId: parseInt(body.sellerId),
                isActive: true,
            },
        });
        console.log("✅ Product created successfully:", product.id);
        res.status(201).json({
            msg: "Product created successfully",
            data: {
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                image: product.image1,
                quantity: product.quantity,
                isActive: product.isActive,
            },
        });
    }
    catch (err) {
        console.error("❌ Error creating product:", err);
        res.status(500).json({
            msg: "Failed to create product",
            error: err.message || "Unknown error occurred",
        });
    }
}));
// 1. Get Seller Information
router.get("/seller-info/:sellerId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerId = parseInt(req.params.sellerId);
        const seller = yield prisma.seller.findUnique({
            where: { id: sellerId },
            select: {
                id: true,
                shopName: true,
                businessEmail: true,
                contactNumber: true,
                walletAddress: true,
                businessAddress: true,
                logoImg: true,
                description: true,
                kybStatus: true,
                isApproved: true,
                createdAt: true,
            },
        });
        if (!seller) {
            return res.status(404).json({ msg: "Seller not found" });
        }
        res.status(200).json({
            msg: "Seller info fetched successfully",
            data: seller,
        });
    }
    catch (err) {
        console.error("Error fetching seller info:", err);
        res.status(500).json({
            msg: "Failed to fetch seller info",
            error: err.message,
        });
    }
}));
// 2. Update Seller Information
router.put("/update-seller/:sellerId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerId = parseInt(req.params.sellerId);
        const { shopName, businessEmail, contactNumber } = req.body;
        // Check if seller exists
        const existingSeller = yield prisma.seller.findUnique({
            where: { id: sellerId },
        });
        if (!existingSeller) {
            return res.status(404).json({ msg: "Seller not found" });
        }
        // Check if email is being changed and if it's already taken by another seller
        if (businessEmail && businessEmail !== existingSeller.businessEmail) {
            const emailExists = yield prisma.seller.findUnique({
                where: { businessEmail },
            });
            if (emailExists) {
                return res
                    .status(400)
                    .json({ msg: "Email already in use by another seller" });
            }
        }
        // Update seller
        const updatedSeller = yield prisma.seller.update({
            where: { id: sellerId },
            data: {
                shopName: shopName || existingSeller.shopName,
                businessEmail: businessEmail || existingSeller.businessEmail,
                contactNumber: contactNumber || existingSeller.contactNumber,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                shopName: true,
                businessEmail: true,
                contactNumber: true,
            },
        });
        res.status(200).json({
            msg: "Seller updated successfully",
            data: updatedSeller,
        });
    }
    catch (err) {
        console.error("Error updating seller:", err);
        res.status(500).json({
            msg: "Failed to update seller",
            error: err.message,
        });
    }
}));
// Get All Orders for Seller
router.get("/all-orders/:sellerId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerId = parseInt(req.params.sellerId);
        const orderItems = yield prisma.orderItem.findMany({
            where: {
                product: {
                    sellerId,
                },
            },
            include: {
                product: {
                    select: {
                        name: true,
                    },
                },
                order: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const formattedOrders = orderItems.map((orderItem) => ({
            id: orderItem.id.toString(),
            userEmail: orderItem.userEmail || orderItem.order.user.email || "N/A",
            userName: orderItem.order.user.name,
            productName: orderItem.productName || orderItem.product.name,
            totalAmount: orderItem.totalAmount || orderItem.productPrice * orderItem.quantity,
            status: orderItem.status,
            createdAt: orderItem.createdAt,
            quantity: orderItem.quantity,
            deliveryAddress: orderItem.deliveryAddress,
            city: orderItem.city,
            state: orderItem.state,
            zipCode: orderItem.zipCode,
            country: orderItem.country,
        }));
        res.status(200).json({
            msg: "Orders fetched successfully",
            data: formattedOrders,
        });
    }
    catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({
            msg: "Failed to fetch orders",
            error: err.message,
        });
    }
}));
// 1. Get Dashboard Stats
router.get("/dashboard-stats/:sellerId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("request reached here for dashboard stats");
        const sellerId = parseInt(req.params.sellerId);
        // Get total products
        const totalProducts = yield prisma.product.count({
            where: { sellerId },
        });
        // Get active products
        const activeProducts = yield prisma.product.count({
            where: {
                sellerId,
                isActive: true,
            },
        });
        // Get all order items for this seller's products
        const orderItems = yield prisma.orderItem.findMany({
            where: {
                product: {
                    sellerId,
                },
            },
            select: {
                totalAmount: true,
            },
        });
        const totalOrders = orderItems.length;
        const totalRevenue = orderItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
        res.status(200).json({
            msg: "Dashboard stats fetched successfully",
            data: {
                totalProducts,
                activeProducts,
                totalOrders,
                totalRevenue,
            },
        });
    }
    catch (err) {
        console.error("Error fetching dashboard stats:", err);
        res.status(500).json({
            msg: "Failed to fetch dashboard stats",
            error: err.message,
        });
    }
}));
// 2. Get Recent Orders
router.get("/recent-orders/:sellerId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerId = parseInt(req.params.sellerId);
        const limit = parseInt(req.query.limit) || 5;
        const recentOrderItems = yield prisma.orderItem.findMany({
            where: {
                product: {
                    sellerId,
                },
            },
            include: {
                product: {
                    select: {
                        name: true,
                    },
                },
                order: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
        });
        const formattedOrders = recentOrderItems.map((orderItem) => ({
            id: orderItem.id.toString(),
            userEmail: orderItem.userEmail || orderItem.order.user.email || "N/A",
            userName: orderItem.order.user.name,
            productName: orderItem.productName || orderItem.product.name,
            totalAmount: orderItem.totalAmount || orderItem.productPrice * orderItem.quantity,
            status: orderItem.status,
            createdAt: orderItem.createdAt,
        }));
        res.status(200).json({
            msg: "Recent orders fetched successfully",
            data: formattedOrders,
        });
    }
    catch (err) {
        console.error("Error fetching recent orders:", err);
        res.status(500).json({
            msg: "Failed to fetch recent orders",
            error: err.message,
        });
    }
}));
// route to takes a store_id and get's all the product offered by him
router.post("/store-products/:store_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const store_id = req.params.store_id;
        const { api_key } = req.body;
        // Validate API key
        if (!api_key) {
            return res.status(400).json({
                msg: "api_key is required in request body",
            });
        }
        const products = yield fetch("https://api.printful.com/store/products", {
            headers: {
                authorization: `Bearer ${api_key}`,
                "X-PF-Store-Id": store_id,
            },
        });
        if (!products.ok) {
            return res.status(products.status).json({
                msg: "Failed to fetch products from Printful",
            });
        }
        const data = yield products.json();
        return res
            .status(200)
            .json({ msg: "Products fetched successfully", data: data });
    }
    catch (err) {
        console.error("Error fetching store products:", err);
        res.status(500).json({
            msg: err instanceof Error ? err.message : "Internal server error",
        });
    }
}));
router.get("/single-product/:store_id/:product_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("request reached here");
        const store_id = req.params.store_id;
        const product_id = req.params.product_id;
        // Get store API key from database
        const store = yield getstoreApiKey(Number(store_id));
        if (!store || !store.api_key) {
            return res.status(404).json({
                success: false,
                msg: "Store not found or API key not configured",
            });
        }
        const api_key = store.api_key;
        // Fetch product details from Printful API
        const response = yield fetch(`https://api.printful.com/store/products/${product_id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${api_key}`,
                "Content-Type": "application/json",
                "X-PF-Store-Id": store_id,
            },
        });
        if (!response.ok) {
            const errorData = yield response.json();
            return res.status(response.status).json({
                success: false,
                msg: "Failed to fetch product from Printful",
                error: errorData,
            });
        }
        const productData = yield response.json();
        // Return the product details
        res.status(200).json({
            success: true,
            data: productData.result,
            store: {
                id: store.id,
                shopName: store.shopName,
                logoImg: store.logoImg,
            },
        });
    }
    catch (err) {
        console.error("Error fetching single product:", err);
        res.status(500).json({
            success: false,
            msg: "Internal server error",
            error: err instanceof Error ? err.message : err,
        });
    }
}));
router.delete("/cart-item/:cartItemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.userId;
        console.log("this is the userId", userId);
        const cartItemId = Number(req.params.cartItemId);
        console.log("this is the cartItemId", cartItemId);
        const payload = {
            userId: userId,
            cartItemId: cartItemId,
        };
        const deletedFromCartItem = yield deleteCartItemFromCart(payload);
        console.log(deletedFromCartItem);
        res.status(200).json({ msg: "product Deleted from the cart" });
    }
    catch (err) {
        res.status(500).json({ msg: err });
    }
}));
router.patch("/cart-item/:cartItemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("requres reached here");
        const quantity = Number(req.body.quantity);
        const cartItemId = Number(req.params.cartItemId);
        const payload = {
            quantity: quantity,
            cartItemId: cartItemId,
        };
        const updatedCart = yield updateQuantityinCart(payload);
        res.status(200).json({ msg: "quantity in the cart updated" });
    }
    catch (err) {
        res.status(500).json({ msg: err });
    }
}));
router.get("/product/:productId/seller-wallet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("searching the seller's wallet address");
        const { productId } = req.params;
        // Get the product with seller information
        const product = yield prisma.product.findUnique({
            where: { id: parseInt(productId) },
            include: {
                seller: {
                    select: {
                        walletAddress: true,
                    },
                },
            },
        });
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }
        if (!product.seller) {
            return res
                .status(404)
                .json({ msg: "Seller not found for this product" });
        }
        console.log("Seller wallet:", product.seller.walletAddress);
        res.status(200).json({
            msg: "Wallet address found",
            walletAddress: product.seller.walletAddress,
        });
    }
    catch (err) {
        console.error("Error fetching seller wallet:", err);
        res
            .status(500)
            .json({ msg: "Failed to fetch seller wallet", error: err });
    }
}));
router.patch("/order-item/:orderItemId/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderItemId } = req.params;
    const { status } = req.body;
    const payload = {
        orderItemId,
        status,
    };
    const updatedItem = yield updateOrderStatus(payload);
    res.json({ success: true, orderItem: updatedItem });
}));
router.get("/store_api_key/:storeId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storeId = Number(req.params.storeId);
        const store = yield getstoreApiKey(storeId);
        res.status(200).json({ apiKey: store === null || store === void 0 ? void 0 : store.api_key });
    }
    catch (err) {
        res.status(500).json({ msg: err });
    }
}));
// Get All Products (from all sellers) - PUBLIC ROUTE
export default router;
