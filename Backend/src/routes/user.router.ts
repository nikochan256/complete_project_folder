import express, { Request, Response } from "express";
import {
  createNewOrder,
  createUser,
  getCartDetails,
  getCartItem,
} from "../services/user.service.js";
import { error } from "console";
import { OrderStatus } from "../generated/prisma/enums.js";
import prisma from "../lib/prisma.js";
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


router.get("/all-products", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true, // Only active products
      seller: {
        isApproved: true,
        kybStatus: 'APPROVED'
      }
    };


    // Filter by category if provided
    if (category && category !== "ALL") {
      where.category = category;
    }

    // Search by product name if provided
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get total count for pagination
    const totalProducts = await prisma.product.count({ where });

    // Get products with seller information
    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            shopName: true,
            businessEmail: true,
            logoImg: true,
            isApproved: true,
            kybStatus: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Filter only products from approved sellers
    const approvedProducts = products.filter(
      product => product.seller.isApproved && product.seller.kybStatus === 'APPROVED'
    );

    res.status(200).json({
      msg: "Products fetched successfully",
      data: {
        products: approvedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts: totalProducts,
          productsPerPage: limit,
          hasNextPage: page * limit < totalProducts,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (err: any) {
    console.error("Error fetching all products:", err);
    res.status(500).json({ 
      msg: "Failed to fetch products", 
      error: err.message 
    });
  }
});


router.post("/register", async (req: Request, res: Response) => {
  console.log("request recieved");
  const body = req.body;
  if (!body.walletAddress) {
    res.status(422).json({ msg: "wallet address needed" });
  }
  try {
    const user = await createUser(body.walletAddress);

    res.status(200).json({ msg: "user created", data: user });
  } catch (err) {
    console.log("user not created ", err);
    res.status(500).json({ msg: "user not created", error: err });
  }
});

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

// Add to Cart Route
router.post('/add-to-cart', async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    // Validate required fields
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Product ID are required'
      });
    }

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Check if requested quantity is available
    if (quantity > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} items available in stock`
      });
    }

    // Find or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    // Check if product already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity if item already exists
      const newQuantity = existingCartItem.quantity + quantity;

      // Check if new quantity exceeds available stock
      if (newQuantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more. Only ${product.quantity - existingCartItem.quantity} items left in stock`
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
          productImg: product.image1,
          productName: product.name,
          productPrice: product.price,
          variantId: null
        }
      });
    }

    // Get updated cart with all items
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        cartItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!updatedCart) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve cart'
      });
    }

    return res.status(200).json({
      success: true,
      message: existingCartItem ? 'Cart updated successfully' : 'Product added to cart',
      data: {
        cartItem,
        cart: updatedCart,
        totalItems: updatedCart.cartItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add product to cart',
      error: error
    });
  }
});


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

router.post("/cart-products", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const cart_items = await getCartItem(Number(body.id));
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const ProductWithLiveImages = cart_items.map((product) => ({
      ...product,
      // image:product.image? `${baseUrl}/${product.image.replace(/\\/g,'/')}` : null
    }));

    res.status(200).json({ data: ProductWithLiveImages });
  } catch (err) {
    res.status(500).json({ msg: err });
  }
});



router.get("/user-cart/:userId", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const cartDets = await getCartDetails(userId);
    res.status(200).json({ msg: "cart found", data: cartDets });
  } catch (err) {
    res.status(500).json({ msg: "this is the error msg", err });
  }
});

// ISO code mapping helpers

// Helper function to convert country name to ISO code
function getCountryCode(countryName: string | null | undefined): string | null {
  if (!countryName) return null;
  
  // Check if already an ISO code (2 letters)
  if (countryName.length === 2 && /^[A-Z]{2}$/.test(countryName)) {
    return countryName;
  }
  
  const normalized = countryName.toLowerCase().trim();
  return countryNameToCode[normalized as keyof typeof countryNameToCode] || countryName.substring(0, 2).toUpperCase();
}

// Helper function to convert state name to ISO code
function getStateCode(stateName: string | null | undefined, countryCode: string | null): string {
  if (!stateName) return '';
  
  // Check if already an ISO code (2 letters)
  if (stateName.length === 2 && /^[A-Z]{2}$/.test(stateName)) {
    return stateName;
  }
  
  const normalized = stateName.toLowerCase().trim();
  const stateCode = stateNameToCode[normalized as keyof typeof stateNameToCode];
  
  // If found in mapping, return it
  if (stateCode) return stateCode;
  
  // For US/CA/IN, return first 2 letters uppercase as fallback
  if (countryCode && ['US', 'CA', 'IN'].includes(countryCode)) {
    return stateName.substring(0, 2).toUpperCase();
}
  
  // For other countries, return empty string (many don't require state_code)
  return '';
}


router.post("/users/:userId/order/items", async (req, res) => {
  try {
    console.log('user placing order request reached here');
    const { userId } = req.params;
    console.log('User ID:', userId);
    
    const {
      quantity,
      variantId,
      productId, // ✅ Need this from frontend
      productImg,
      productPrice,
      productName,
      status,
      totalAmount,
      deliveryAddress,
      userEmail,
      city,
      zipCode,
      state,
      country,
      customerName,
      customerPhone,
    } = req.body;

    // Validate required fields
    if (
      !productId ||
      !productImg ||
      !productPrice ||
      !productName ||
      !deliveryAddress ||
      !userEmail ||
      !city ||
      !zipCode ||
      !state ||
      !country
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields: {
          productId: !productId,
          productImg: !productImg,
          productPrice: !productPrice,
          productName: !productName,
          deliveryAddress: !deliveryAddress,
          userEmail: !userEmail,
          city: !city,
          zipCode: !zipCode,
          state: !state,
          country: !country,
        }
      });
    }

    const orderQuantity = quantity || 1;
    const calculatedTotal = totalAmount || productPrice * orderQuantity;

    // ✅ First create the Order
    const order = await prisma.order.create({
      data: {
        userId: parseInt(userId),
      }
    });

    // ✅ Then create the OrderItem with correct fields
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: parseInt(productId),
        quantity: orderQuantity,
        variantId,
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
      }
    });

    console.log('✅ Order created in database:', order.id);
    console.log('✅ Order item created:', orderItem.id);

    // Send order confirmation email
    try {
      await fetch("https://gifq-sender-smtp-gifq.vercel.app/emails/order-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          orderDetails: {
            orderId: orderItem.id,
            productName,
            productImg,
            quantity: orderQuantity,
            productPrice,
            totalAmount: calculatedTotal,
            deliveryAddress,
            city,
            state,
            zipCode,
            country,
            customerName,
            customerPhone,
          },
        }),
      });
      console.log("✅ Order confirmation email sent");
    } catch (emailError) {
      console.error("⚠️ Email service error:", emailError);
    }

    return res.status(201).json({
      success: true,
      order,
      orderItem,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("❌ Error adding product to order:", error);
    return res.status(500).json({
      error: "Failed to add product to order",
      details: error,
    });
  }
});