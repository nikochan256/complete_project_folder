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
import { addToprintfullCart, createStore, deleteCartItemFromCart, getAllStores, getstoreApiKey, getStoreWalletAddress, updateOrderStatus, updateQuantityinCart } from "../services/merchant.service.js";
import { upload } from "../config/multer.config.js";
const router = express.Router();
// create-store working , need to add all the fields
// new merchant features , printful integration,
// i will get all the products from the printfull 
// i will need to store the user's api-key and store id in the database for now 
// seller schema will change now 
// cart logic will probably remain the same user must see all the products he has in  his cart
// he should also see what all orders he has also purchased,
// 
router.post("/create-store", upload.fields([
    { name: "image", maxCount: 1 },
    { name: "kybDocument", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const files = req.files;
        if (!files || !files.kybDocument) {
            return res.status(400).json({ msg: "kybDocument is required" });
        }
        const logoImg = files.image[0].path;
        const kybDocuments = files.kybDocument[0].path;
        const payload = {
            shopName: body.shopName,
            walletAddress: body.walletAddress,
            businessEmail: body.businessEmail,
            api_key: body.api_key,
            store_id: Number(body.store_id),
            logoImg: logoImg,
            kybDocument: kybDocuments,
            discription: body.description,
            contact: body.contact,
            address: body.address,
            status: body.status,
        };
        const store = yield createStore(payload);
        console.log("store has been created", store);
        try {
            fetch('https://gifq-sender-smtp-gifq.vercel.app/emails/store-approval', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: body.businessEmail
                })
            });
        }
        catch (emailError) {
            console.error('⚠️ Email service error:', emailError);
            // Don't fail the store creation if email fails
        }
        res.status(200).json({
            msg: "wait for admin to review and allow your application",
            data: store,
        });
    }
    catch (err) {
        res.status(500).json({ msg: "store not created", data: err });
    }
}));
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
// Add this route to your backend (e.g., in your merchant routes file)
router.post('/verify-printful-api', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("requrest reached here ");
        const { api_key } = req.body;
        if (!api_key) {
            return res.status(400).json({
                success: false,
                message: 'API key is required'
            });
        }
        // Call Printful API from backend
        const response = yield fetch('https://api.printful.com/stores', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Printful API Key'
            });
        }
        const data = yield response.json();
        if (data.result && data.result.length > 0) {
            return res.json({
                success: true,
                result: data.result,
                message: 'API key verified successfully'
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'No stores found for this API key'
            });
        }
    }
    catch (error) {
        console.error('Error verifying Printful API:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify API key. Please try again.'
        });
    }
}));
// route ot return all the available stores 
router.get('/get-all-stores', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const all_stores = yield getAllStores();
        res.status(200).json({ msg: "return all approved stores", data: all_stores });
    }
    catch (err) {
        res.status(500).json({ msg: err });
    }
}));
// route to takes a store_id and get's all the product offered by him 
router.get("/store-products/:store_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const store_id = req.params.store_id;
        const store = yield getstoreApiKey(Number(store_id));
        const products = yield fetch("https://api.printful.com/store/products", {
            headers: {
                authorization: `Bearer ${store === null || store === void 0 ? void 0 : store.api_key}`,
                "X-PF-Store-Id": store_id
            }
        });
        if (!products.ok) {
            return res.status(products.status).json({
                msg: "Failed to fetch products from Printful"
            });
        }
        const data = yield products.json();
        return res.status(200).json({ msg: "store found", store: store, data: data });
    }
    catch (err) {
        console.error("Error fetching store products:", err);
        res.status(500).json({
            msg: err instanceof Error ? err.message : "Internal server error"
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
                msg: "Store not found or API key not configured"
            });
        }
        const api_key = store.api_key;
        // Fetch product details from Printful API
        const response = yield fetch(`https://api.printful.com/store/products/${product_id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${api_key}`,
                "Content-Type": "application/json",
                "X-PF-Store-Id": store_id
            }
        });
        if (!response.ok) {
            const errorData = yield response.json();
            return res.status(response.status).json({
                success: false,
                msg: "Failed to fetch product from Printful",
                error: errorData
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
                logoImg: store.logoImg
            }
        });
    }
    catch (err) {
        console.error("Error fetching single product:", err);
        res.status(500).json({
            success: false,
            msg: "Internal server error",
            error: err instanceof Error ? err.message : err
        });
    }
}));
router.post("/add-printfull-product-to-cart/:store_id/:product_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("=== Add to Cart Request Started ===");
        console.log("Params:", req.params);
        console.log("Body:", req.body);
        // Validate required parameters
        const store_id = Number(req.params.store_id);
        const product_id = Number(req.params.product_id);
        const userId = Number(req.body.userId);
        const variant_id = String(req.body.variant_id);
        const quantity = req.body.quantity ? Number(req.body.quantity) : 1;
        const productImg = req.body.productImg;
        const productName = req.body.productName;
        const productPrice = Number(req.body.productPrice);
        // Check for invalid numbers
        if (isNaN(store_id) || store_id <= 0) {
            console.error("Invalid store_id:", req.params.store_id);
            return res.status(400).json({
                success: false,
                msg: "Invalid store ID provided"
            });
        }
        if (isNaN(product_id) || product_id <= 0) {
            console.error("Invalid product_id:", req.params.product_id);
            return res.status(400).json({
                success: false,
                msg: "Invalid product ID provided"
            });
        }
        if (isNaN(userId) || userId <= 0) {
            console.error("Invalid userId:", req.body.userId);
            return res.status(400).json({
                success: false,
                msg: "Invalid user ID provided"
            });
        }
        // Fixed validation: Check if variant_id exists and is not empty
        if (!variant_id || variant_id.trim() === '') {
            console.error("Invalid variant_id:", req.body.variant_id);
            return res.status(400).json({
                success: false,
                msg: "Invalid variant ID provided"
            });
        }
        if (isNaN(quantity) || quantity <= 0) {
            console.error("Invalid quantity:", req.body.quantity);
            return res.status(400).json({
                success: false,
                msg: "Quantity must be a positive number"
            });
        }
        // Validate required string fields
        if (!productImg || !productName) {
            console.error("Missing required fields - productImg:", productImg, "productName:", productName);
            return res.status(400).json({
                success: false,
                msg: "Product image and name are required"
            });
        }
        if (isNaN(productPrice) || productPrice <= 0) {
            console.error("Invalid productPrice:", req.body.productPrice);
            return res.status(400).json({
                success: false,
                msg: "Invalid product price provided"
            });
        }
        const payload = {
            store_id,
            product_id,
            userId,
            variant_id,
            quantity,
            productImg,
            productName,
            productPrice
        };
        console.log("Validated payload:", payload);
        const addToUsersCart = yield addToprintfullCart(payload);
        console.log("Cart item added successfully:", addToUsersCart);
        console.log("=== Add to Cart Request Completed ===");
        res.status(200).json({
            success: true,
            msg: "Product added to cart successfully",
            data: addToUsersCart
        });
    }
    catch (err) {
        console.error("=== Add to Cart Error ===");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("Request params:", req.params);
        console.error("Request body:", req.body);
        console.error("===========================");
        // Handle specific Prisma errors
        if (err.code === 'P2002') {
            return res.status(409).json({
                success: false,
                msg: "This item is already in your cart"
            });
        }
        if (err.code === 'P2003') {
            return res.status(404).json({
                success: false,
                msg: "Product or user not found"
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                msg: "Cart not found for user"
            });
        }
        // Handle custom errors
        if (err.message === "Cart not found for user") {
            return res.status(404).json({
                success: false,
                msg: "User cart not found. Please create a cart first."
            });
        }
        // Generic error response
        res.status(500).json(Object.assign({ success: false, msg: "Failed to add product to cart. Please try again." }, (process.env.NODE_ENV === 'development' && { error: err.message })));
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
            cartItemId: cartItemId
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
            cartItemId: cartItemId
        };
        const updatedCart = yield updateQuantityinCart(payload);
        res.status(200).json({ msg: "quantity in the cart updated" });
    }
    catch (err) {
        res.status(500).json({ msg: err });
    }
}));
export default router;
router.get("/store/:storeId/wallet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("searching the seller's wallet address");
        const { storeId } = req.params;
        ;
        const seller = yield getStoreWalletAddress(Number(storeId));
        console.log(seller);
        res.status(200).json({ msg: "wallet address found", walletAddress: seller === null || seller === void 0 ? void 0 : seller.walletAddress });
    }
    catch (err) {
        res.status(200).json({ msg: err });
    }
}));
router.patch('/order-item/:orderItemId/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderItemId } = req.params;
    const { status } = req.body;
    const payload = {
        orderItemId,
        status
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
