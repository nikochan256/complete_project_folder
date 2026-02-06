import { json } from "node:stream/consumers";
import { KYBStatus, OrderStatus } from "../generated/prisma/enums.js";
import { Or } from "../generated/prisma/internal/prismaNamespace.js";
import prisma from "../lib/prisma.js";


interface payloadInterface {
  shopName: string;
  walletAddress: string;
  businessEmail: string;
  description?: string;
  contact?: string;
  address?: string;
  api_key: string;
  store_id: number;
  logoImg: string;
  kybDocument: string;
  status?: string;
  createdAt?: Date;
}
interface productPayload  {
  name:string,
  description:string ,
  price:number , 
  stock:number ,
  image:string ,
  category: string ,
  sellerId : number
}

interface printfullCartpayload  {
  store_id: number,
  product_id:number,
  variant_id:string ,
  userId:number, 
  quantity:number,
  productImg : string,
  productName :string,
  productPrice:number
}


interface Deletpayload  {
  userId:number,
  cartItemId:number
}

interface cartItemQuantityUpdate{
  quantity:number,
  cartItemId:number
}

// export const createStore = async (payload: payloadInterface) => {
//   try {
//     console.log("🔍 Checking if seller already exists...");

//     // Check if wallet address already exists
//     const alreadySeller = await prisma.seller.findUnique({
//       where: { walletAddress: payload.walletAddress },
//     });

//     if (alreadySeller) {
//       console.error("❌ Seller with this wallet address already exists");
//       throw new Error("A store with this wallet address already exists");
//     }

//     // Check if business email already exists
//     const alreadyBusinessEmail = await prisma.seller.findUnique({
//       where: { businessEmail: payload.businessEmail },
//     });

//     if (alreadyBusinessEmail) {
//       console.error("❌ Seller with this business email already exists");
//       throw new Error("A store with this business email already exists");
//     }

//     console.log("💾 Creating new store in database...");

//     // Create new store
//     const store = await prisma.seller.create({
//       data: {
//         shopName: payload.shopName,
//         walletAddress: payload.walletAddress,
//         businessEmail: payload.businessEmail,
//         description: payload.description,
//         contactNumber: payload.contact,
//         businessAddress: payload.address ,
//         // api_key: payload.api_key,
//         // store_id: payload.store_id,
//         kybDocuments: payload.kybDocument,
//         logoImg: payload.logoImg,
//         isApproved: false,
//         createdAt: payload.createdAt || new Date(),
//         updatedAt: new Date(),
//       },
//     });

//     console.log("✅ Store created successfully:", store.id);

//     return store;
//   } catch (err: any) {
//     console.error("❌ Error in createStore service:", err);
//     throw err;
//   }
// };





// export const addToprintfullCart = async(payload: printfullCartpayload) => {
//   try {
//     console.log("request reached addToprintfullCart here")
    
//     const cart = await prisma.cart.findUnique({
//       where: {
//         userId: payload.userId,
//       }
//     })
//     console.log(cart)

//     if (!cart) {
//       throw new Error("Cart not found for user")
//     }

//     // Check if item already exists in cart
//     const existingItem = await prisma.cartItem.findFirst({
//       where: {
//           cartId: cart.id,
//           variantId:payload.variant_id.toString()
//       }
//     })

//     // If exists, update quantity; otherwise create new
//     if (existingItem) {
//       const updatedItem = await prisma.cartItem.update({
//         where: { id: existingItem.id },
//         data: {
//           quantity: existingItem.quantity + (payload.quantity || 1)
//         }
//       })
//       console.log(updatedItem)
//       return updatedItem
//     }

//     const newCartItem = await prisma.cartItem.create({
//       data: {
//         cartId: cart.id,
//         // storeId: payload.store_id,
//         variantId: payload.variant_id, // Fixed typo here
//         quantity: payload.quantity || 1,
//         productImg:payload.productImg,
//         productName:payload.productName,
//         productPrice : payload.productPrice
//       } 
//     }) 

//     console.log(newCartItem)
//     return newCartItem

//   } catch (err) {
//     throw err
//   }
// }



export const getAllStores = async()=>{
    try{
          //this is the correct format 
      // const allStores = await prisma.seller.findMany({
      //   where:{
      //     isApproved:true
        // }
      // })  
       const allStores = await prisma.seller.findMany()
       return allStores  
    }catch(err){
      throw err
    }
}

export const getstoreApiKey = async(id:number)=>{
    try{
        const apiKey = await prisma.seller.findUnique({
          where:{
            store_id:id
          }
        })
        return apiKey ; 
    }catch(err){
      throw err
    }
}

export const deleteCartItemFromCart = async(payload:Deletpayload)=>{
  try{
      const deleteFromTheCart = await prisma.cartItem.delete({
        where:{
          id:payload.cartItemId,
        }
      })
      return deleteFromTheCart;
  }catch(err){
    throw err
  }
}

export const updateQuantityinCart = async(payload:cartItemQuantityUpdate)=>{
  try{
      const updated = await prisma.cartItem.update({
        where:{
          id:payload.cartItemId
        },
        data:{
          quantity:payload.quantity
        }
      })
      return updated ; 
  }catch(err){
    throw err
  }
}


export async function getDashboardMetrics() {
  try {
    // Fetch all metrics in parallel for better performance
    const [totalUsers, totalMerchants, pendingApprovals, approvedMerchants] = await Promise.all([
      // Count total users
      prisma.user.count(),
      
      // Count total merchants/sellers
      prisma.seller.count(),
      
      // Count sellers with PENDING KYB status
      prisma.seller.count({
        where: {
          kybStatus: "PENDING"
        }
      }),
      
      // Count approved merchants
      prisma.seller.count({
        where: {
          kybStatus: "APPROVED",
          isApproved: true
        }
      })
    ])

    return {
      totalUsers,
      totalMerchants,
      pendingApprovals,
      approvedMerchants
    }
  } catch (error) {
    console.error("Error in getDashboardMetrics:", error)
    throw error
  }
}


export async function getPendingMerchants() {
  try {
    const pendingMerchants = await prisma.seller.findMany({
      where: {
        kybStatus: "PENDING"
      },
      select: {
        id: true,
        shopName: true,
        businessEmail: true,
        contactNumber: true,
        businessAddress: true,
        createdAt: true,
        kybStatus: true,
        kybDocuments: true,
        logoImg: true,
        description: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return pendingMerchants
  } catch (error) {
    console.error("Error in getPendingMerchants:", error)
    throw error
  }
}

export async function getMerchantById(merchantId: number) {
  try {
    const merchant = await prisma.seller.findUnique({
      where: {
        id: merchantId
      },
      select: {
        id: true,
        shopName: true,
        walletAddress: true,
        businessEmail: true,
        contactNumber: true,
        businessAddress: true,
        logoImg: true,
        description: true,
        kybDocuments: true,
        kybStatus: true,
        isApproved: true,
        approvedAt: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return merchant
  } catch (error) {
    console.error("Error in getMerchantById:", error)
    throw error
  }
}

export async function updateMerchantVerification(
  merchantId: number, 
  status: 'approved' | 'rejected',
  rejectionReason?: string
) {
  try {
    const updateData: any = {
      kybStatus: status === 'approved' ? KYBStatus.APPROVED : KYBStatus.REJECTED,
      isApproved: status === 'approved',
      updatedAt: new Date()
    }

    if (status === 'approved') {
      updateData.approvedAt = new Date()
      updateData.rejectionReason = null
    } else if (rejectionReason) {
      updateData.rejectionReason = rejectionReason
      updateData.approvedAt = null
    }

    const updatedMerchant = await prisma.seller.update({
      where: {
        id: merchantId
      },
      data: updateData
    })

    return updatedMerchant
  } catch (error) {
    console.error("Error in updateMerchantVerification:", error)
    throw error
  }
}


export async function getAllMerchants() {
  return await prisma.seller.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getMerchantsByStatus(status: KYBStatus) {
  return await prisma.seller.findMany({
    where: {
      kybStatus: status
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}


export const getStoreWalletAddress = async(storeId:number)=>{
try{
  const walletAddress = await prisma.seller.findUnique({
    where:{
      store_id:storeId
    },
    select:{
      walletAddress:true
    }
  })
  return walletAddress
}catch(err){
  throw err
}
}

export const updateOrderStatus = async(payload:{orderItemId:string , status:OrderStatus})=>{
  try{
    const updatedItem = await prisma.orderItem.update({
      where: { id: Number(payload.orderItemId) },
      data: { status : payload.status  }
    });
    return updatedItem
  }catch(err){
    throw err
  }
}