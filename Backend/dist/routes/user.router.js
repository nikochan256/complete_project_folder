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
import { createNewOrder, createUser, getCartDetails, getCartItem, } from "../services/user.service.js";
import { OrderStatus } from "../generated/prisma/enums.js";
export const router = express.Router();
const countryNameToCode = {
    'united states': 'US',
    'usa': 'US',
    'united states of america': 'US',
    'canada': 'CA',
    'united kingdom': 'GB',
    'uk': 'GB',
    'great britain': 'GB',
    'india': 'IN',
    'australia': 'AU',
    'germany': 'DE',
    'france': 'FR',
    'spain': 'ES',
    'italy': 'IT',
    'mexico': 'MX',
    'brazil': 'BR',
    'japan': 'JP',
    'china': 'CN',
    'south korea': 'KR',
    'netherlands': 'NL',
    'belgium': 'BE',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'finland': 'FI',
    'poland': 'PL',
    'austria': 'AT',
    'switzerland': 'CH',
    'ireland': 'IE',
    'new zealand': 'NZ',
    'singapore': 'SG',
};
const stateNameToCode = {
    // US States
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
    'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
    'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
    'wisconsin': 'WI', 'wyoming': 'WY',
    // Canadian Provinces
    'alberta': 'AB', 'british columbia': 'BC', 'manitoba': 'MB',
    'new brunswick': 'NB', 'newfoundland and labrador': 'NL', 'nova scotia': 'NS',
    'ontario': 'ON', 'prince edward island': 'PE', 'quebec': 'QC', 'saskatchewan': 'SK',
    // Indian States
    'andhra pradesh': 'AP', 'arunachal pradesh': 'AR', 'assam': 'AS', 'bihar': 'BR',
    'chhattisgarh': 'CG', 'goa': 'GA', 'gujarat': 'GJ', 'haryana': 'HR',
    'himachal pradesh': 'HP', 'jharkhand': 'JH', 'karnataka': 'KA', 'kerala': 'KL',
    'madhya pradesh': 'MP', 'maharashtra': 'MH', 'manipur': 'MN', 'meghalaya': 'ML',
    'mizoram': 'MZ', 'nagaland': 'NL', 'odisha': 'OR', 'punjab': 'PB',
    'rajasthan': 'RJ', 'sikkim': 'SK', 'tamil nadu': 'TN', 'telangana': 'TS',
    'tripura': 'TR', 'uttar pradesh': 'UP', 'uttarakhand': 'UK', 'west bengal': 'WB',
    'delhi': 'DL',
};
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("request recieved");
    const body = req.body;
    if (!body.walletAddress) {
        res.status(422).json({ msg: "wallet address needed" });
    }
    try {
        const user = yield createUser(body.walletAddress);
        res.status(200).json({ msg: "user created", data: user });
    }
    catch (err) {
        console.log("user not created ", err);
        res.status(500).json({ msg: "user not created", error: err });
    }
}));
// router.get("/get_all_products" , async(req:Request,res:Response)=>{
//                try{
//                               const allProducts = await getallProducts();
//                               const baseUrl = `${req.protocol}://${req.get('host')}`;
//                               const ProductWithLiveImages = allProducts.map(product =>({
//                                              ...product,
//                                              image:product.image? `${baseUrl}/${product.image.replace(/\\/g,'/')}` : null
//                               }));
//                               res.status(200).json({msg:"all products for user " , data:ProductWithLiveImages})
//                }catch(err){
//                               res.status(500).json({msg:err})
//                }
// })
// router.post('/add_to_cart' , async(req:Request , res:Response)=>{
//                try{
//                           const body = req.body;
//                           const payload = {productId:Number(body.productId) , userId:Number(body.userId)}
//                           console.log(payload)
//                           const productaddedToUsersCart = await addToUsersCart(payload);
//                           res.status(200).json({msg:"product added to your cart" , data:productaddedToUsersCart})
//                }catch(err){
//                               res.status(500).json({msg:err})
//                }
// })
// router.get("/single-product/:id" , async(req:Request,res:Response)=>{
//                try{
//                               const productId = Number(req.params.id);
//                               const product =await getProduct(productId) ;
//                               const baseUrl = `${req.protocol}://${req.get('host')}`;
//                                              if(product){
//                                                             const ProductWithLiveImages = {
//                                                                            ...product,
//                                                                            image:product.image? `${baseUrl}/${product.image.replace(/\\/g,'/')}` : null
//                                                             };
//                                                             res.status(200).json({msg:"product found" , data:ProductWithLiveImages})
//                                              }
//                }catch(err){
//                               res.status(500).json({msg:err})
//                }
// })
router.post("/cart-products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const cart_items = yield getCartItem(Number(body.id));
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const ProductWithLiveImages = cart_items.map((product) => (Object.assign({}, product)));
        res.status(200).json({ data: ProductWithLiveImages });
    }
    catch (err) {
        res.status(500).json({ msg: err });
    }
}));
router.get("/user-cart/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.userId);
        const cartDets = yield getCartDetails(userId);
        res.status(200).json({ msg: "cart found", data: cartDets });
    }
    catch (err) {
        res.status(500).json({ msg: "this is the error msg", err });
    }
}));
// ISO code mapping helpers
// Helper function to convert country name to ISO code
function getCountryCode(countryName) {
    if (!countryName)
        return null;
    // Check if already an ISO code (2 letters)
    if (countryName.length === 2 && /^[A-Z]{2}$/.test(countryName)) {
        return countryName;
    }
    const normalized = countryName.toLowerCase().trim();
    return countryNameToCode[normalized] || countryName.substring(0, 2).toUpperCase();
}
// Helper function to convert state name to ISO code
function getStateCode(stateName, countryCode) {
    if (!stateName)
        return '';
    // Check if already an ISO code (2 letters)
    if (stateName.length === 2 && /^[A-Z]{2}$/.test(stateName)) {
        return stateName;
    }
    const normalized = stateName.toLowerCase().trim();
    const stateCode = stateNameToCode[normalized];
    // If found in mapping, return it
    if (stateCode)
        return stateCode;
    // For US/CA/IN, return first 2 letters uppercase as fallback
    if (countryCode && ['US', 'CA', 'IN'].includes(countryCode)) {
        return stateName.substring(0, 2).toUpperCase();
    }
    // For other countries, return empty string (many don't require state_code)
    return '';
}
router.post("/users/:userId/order/items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        console.log('user placing order request reached here');
        const { userId } = req.params;
        console.log('User ID:', userId);
        const { quantity, variantId, storeId, productImg, productPrice, productName, status, totalAmount, deliveryAddress, userEmail, city, zipCode, state, country, printfulApiKey, customerName, customerPhone, } = req.body;
        // Validate required fields
        if (!storeId ||
            !productImg ||
            !productPrice ||
            !productName ||
            !deliveryAddress ||
            !userEmail ||
            !city ||
            !zipCode ||
            !state ||
            !country ||
            !printfulApiKey ||
            !variantId) {
            return res.status(400).json({
                error: "Missing required fields",
                missingFields: {
                    storeId: !storeId,
                    productImg: !productImg,
                    productPrice: !productPrice,
                    productName: !productName,
                    deliveryAddress: !deliveryAddress,
                    userEmail: !userEmail,
                    city: !city,
                    zipCode: !zipCode,
                    state: !state,
                    country: !country,
                    printfulApiKey: !printfulApiKey,
                    variantId: !variantId,
                }
            });
        }
        const orderQuantity = quantity || 1;
        const calculatedTotal = totalAmount || productPrice * orderQuantity;
        const payload = {
            quantity: orderQuantity,
            variantId,
            storeId,
            productImg,
            productPrice,
            productName,
            status: status || OrderStatus.PENDING_PAYMENT,
            totalAmount: calculatedTotal,
            deliveryAddress,
            userEmail,
            city,
            zipCode,
            state,
            country,
            userId: parseInt(userId),
        };
        // Create order item in your database
        const orderItem = yield createNewOrder(payload);
        console.log('✅ Order item created in database:', orderItem.id);
        // Convert country and state to ISO codes
        const countryCode = getCountryCode(country);
        const stateCode = getStateCode(state, countryCode);
        console.log(`🌍 Converting: "${country}" -> "${countryCode}", "${state}" -> "${stateCode}"`);
        // Prepare Printful order payload with ISO codes
        const printfulPayload = {
            recipient: Object.assign({ name: customerName || ((_a = deliveryAddress.split(",")[0]) === null || _a === void 0 ? void 0 : _a.trim()) || "Customer", address1: deliveryAddress, city: city, state_code: stateCode, country_code: countryCode, zip: zipCode, email: userEmail }, (customerPhone && { phone: customerPhone })),
            items: [
                {
                    sync_variant_id: parseInt(variantId),
                    quantity: orderQuantity,
                },
            ],
            confirm: true,
        };
        console.log('📦 Sending order to Printful:', JSON.stringify(printfulPayload, null, 2));
        // Place order on Printful
        console.log("this is the printful api key ", printfulApiKey);
        console.log("store id = ", storeId);
        let printfulOrderId = null;
        try {
            const printfulOrder = yield fetch("https://api.printful.com/orders", {
                method: "POST",
                headers: Object.assign({ Authorization: `Bearer ${printfulApiKey}`, "Content-Type": "application/json" }, (storeId && { "X-PF-Store-Id": storeId })),
                body: JSON.stringify(printfulPayload),
            });
            const printfulResponse = yield printfulOrder.json();
            if (!printfulOrder.ok) {
                console.error("❌ Printful order creation failed:");
                console.error("Status:", printfulOrder.status);
                console.error("Response:", JSON.stringify(printfulResponse, null, 2));
                return res.status(500).json({
                    error: "Printful order creation failed",
                    details: printfulResponse.error || printfulResponse,
                    orderItemId: orderItem.id,
                    message: "Order saved in database but Printful order failed. Please contact support.",
                });
            }
            else {
                printfulOrderId = (_b = printfulResponse.result) === null || _b === void 0 ? void 0 : _b.id;
                console.log("✅ Printful order created successfully!");
                console.log("Printful Order ID:", printfulOrderId);
                console.log("Order Status:", (_c = printfulResponse.result) === null || _c === void 0 ? void 0 : _c.status);
            }
        }
        catch (printfulError) {
            console.error("❌ Printful service error:", printfulError);
            return res.status(500).json({
                error: "Printful service unavailable",
                details: printfulError,
                orderItemId: orderItem.id,
                message: "Order saved in database but Printful order failed. Please contact support.",
            });
        }
        // Send order confirmation email
        try {
            yield fetch("https://gifq-sender-smtp-gifq.vercel.app/emails/order-confirmation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: userEmail,
                    orderDetails: {
                        orderId: orderItem.id,
                        printfulOrderId: printfulOrderId,
                        productName,
                        productImg,
                        quantity: orderQuantity,
                        productPrice,
                        totalAmount: calculatedTotal,
                        deliveryAddress,
                        city,
                        state,
                        zipCode,
                        country: countryCode,
                    },
                }),
            });
            console.log("✅ Order confirmation email sent");
        }
        catch (emailError) {
            console.error("⚠️ Email service error:", emailError);
        }
        return res.status(201).json({
            success: true,
            orderItem,
            printfulOrderId,
            message: "Order created successfully and submitted to Printful",
        });
    }
    catch (error) {
        console.error("❌ Error adding product to order:", error);
        return res.status(500).json({
            error: "Failed to add product to order",
            details: error,
        });
    }
}));
