import { channel } from "node:diagnostics_channel";
import prisma from "../lib/prisma.js";
import { OrderStatus } from "../generated/prisma/enums.js"; // Import from Prisma
import { Or } from "../generated/prisma/internal/prismaNamespace.js";

interface addToCartPayload {
  productId: number, 
  userId: number
}

// Remove this enum - use the imported one from Prisma instead
// enum OrderStatus {
//   PENDING_PAYMENT,
//   PAID,
//   PROCESSING,
//   SHIPPED,
//   DELIVERED,
//   CANCELLED,
//   REFUNDED
// }

interface newOrderInterface {
  quantity?: number
  variantId?: string
  storeId: number
  productImg: string
  productPrice: number
  productName: string
  status?: OrderStatus 
  totalAmount?: number
  deliveryAddress: string
  userEmail: string
  city: string
  zipCode: string
  state: string
  country: string
  userId: number
}


export const createUser = async (address: string) => {
  try {
    const user = await prisma.user.upsert({
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
  } catch (err) {
    throw err;
  }
};


export const getCartItem = async (userId: number) => {
  try {
    const cartProducts = await prisma.cartItem.findMany({});

    return cartProducts;

  } catch (err) {
    throw err;
  }
};


export const getCartDetails = async(userId:number)=>{
  try{
      const cart = await prisma.cart.findUnique({
        where:{
          userId:userId
        },
        include:{
          cartItems:true
        }
      })
      return cart
  }catch(err){
    throw err
  }
}



export const createNewOrder = async(payload: newOrderInterface) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        userId: payload.userId,
      },
    });

    if (!order) {
      throw new Error("Order not found for user");
    }

    const orderItem = await prisma.orderItem.create({
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

  } catch (err) {
    throw err;
  }
}