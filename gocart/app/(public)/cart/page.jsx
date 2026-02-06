"use client";
// import Counter from "@/components/Counter";
import PageTitle from "../../../components/PageTitle";
import { Trash2Icon, ShoppingBag, CloudLightning } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// WBTC Contract Configuration
const WBTC_CONTRACT_ADDRESS = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const WBTC_DECIMALS = 8; // WBTC has 8 decimals like Bitcoin

export default function Cart() {
  const currency = "₿"; // Bitcoin/WBTC symbol
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [address, setAddress] = useState(() => {
    if (typeof window !== "undefined") {
      const savedAddress = localStorage.getItem("shippingAddress");
      if (savedAddress) {
        return JSON.parse(savedAddress);
      }
    }
    return {
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      email: "",
    };
  });

  const TESTING_MODE = false;
  const HARDCODED_WBTC_PRICE = 0.00001;

  const [wbtcPrice, setWbtcPrice] = useState(null);
  const [wbtcLoading, setWbtcLoading] = useState(true);

  // Fetch WBTC price
  const fetchWbtcPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=wrapped-bitcoin&vs_currencies=usd"
      );
      const data = await response.json();


      setWbtcPrice(data["wrapped-bitcoin"].usd);
      setWbtcLoading(false);
    } catch (err) {
      console.error("Error fetching WBTC price:", err);
      setWbtcLoading(false);
    }
  };

  // Convert EUR to WBTC
  // Convert USD to WBTC
  const convertToWbtc = (usdAmount) => {

   

    if (TESTING_MODE) {
      return HARDCODED_WBTC_PRICE.toFixed(8);
    }
    if (!wbtcPrice) return "0.00000000";

    const result = (usdAmount / wbtcPrice).toFixed(8);
    return result;
  };

  const fetchCartFromDB = async () => {
    try {
      const userId = localStorage.getItem("dmarketplaceUserId");

      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const url = `https://dmarketplacebackend.vercel.app/user/user-cart/${userId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });


      if (!response.ok) {
        throw new Error(`Failed to fetch cart items: ${response.status}`);
      }

      const result = await response.json();

      // Extract cart items from the nested structure
      if (
        result.data &&
        result.data.cartItems &&
        result.data.cartItems.length > 0
      ) {
        // Map cart items directly - they already contain product info from backend
        const formattedItems = result.data.cartItems.map((item) => {

          return {
            cartItemId: item.id,
            variantId: item.variantId,
            productId: item.productId, // ✅ Add this line
            storeId: item.storeId,
            quantity: item.quantity,
            name: item.productName || "Product",
            image: item.productImg || "/placeholder.png",
            price: item.productPrice || 0,
            currency: item.currency || "$",
            sku: item.sku || "N/A",
            color: item.color || "",
            size: item.size || "",
          };
        });

        setCartItems(formattedItems);
      } else {
        setCartItems([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
      console.error("Error details:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
      });
      setError(err.message);
      setLoading(false);
    }
  };

  // Delete item from cart
  const handleDeleteItemFromCart = async (cartItemId) => {
    try {
      const userId = localStorage.getItem("dmarketplaceUserId");

      const response = await fetch(
        `https://dmarketplacebackend.vercel.app/merchant/cart-item/${cartItemId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      // Refresh cart after deletion
      fetchCartFromDB();
    } catch (err) {
      console.error("Error deleting item from cart:", err);
      alert("Failed to remove item from cart");
    }
  };

  // Update quantity
  const handleQuantityChange = async (cartItemId, newQuantity) => {
    try {
      const userId = localStorage.getItem("dmarketplaceUserId");

      if (newQuantity < 1) {
        // If quantity is 0, delete the item
        await handleDeleteItemFromCart(cartItemId);
        return;
      }

      const response = await fetch(
        `https://dmarketplacebackend.vercel.app/merchant/cart-item/${cartItemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            quantity: newQuantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      // Refresh cart after update
      fetchCartFromDB();
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert("Failed to update quantity");
    }
  };

  // Handle buy now for individual item
  const handleBuyNow = (item) => {
    setSelectedItem(item);
    setShowCheckoutModal(true);
  };

  // Handle checkout submission
  const handleCheckout = async () => {
    let orderItemId = null; // MOVE THIS OUTSIDE TRY BLOCK

    try {
      setPaymentLoading(true);
      setPaymentStatus("Creating order...");
      const userId = localStorage.getItem("dmarketplaceUserId");

      // Validate address and email
      if (
        !address.name ||
        !address.phone ||
        !address.street ||
        !address.city ||
        !address.state ||
        !address.zipCode ||
        !address.country ||
        !address.email
      ) {
        setPaymentLoading(false);
        setPaymentStatus("");
        alert("Please fill in all fields including name and phone");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(address.email)) {
        setPaymentLoading(false);
        setPaymentStatus("");
        alert("Please enter a valid email address");
        return;
      }

      // Create order payload matching the backend API
      const orderPayload = {
        quantity: selectedItem.quantity,
        variantId: selectedItem.variantId,
        productId: selectedItem.productId,
        productImg: selectedItem.image,
        productPrice: selectedItem.price,
        productName: selectedItem.name,
        totalAmount: selectedItem.price * selectedItem.quantity,
        deliveryAddress: address.street,
        userEmail: address.email,
        customerName: address.name,
        customerPhone: address.phone,
        city: address.city,
        zipCode: address.zipCode,
        state: address.state,
        country: address.country,
      };

      const response = await fetch(
        `https://dmarketplacebackend.vercel.app/user/users/${userId}/order/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error("Failed to create order");
      }

      const result = await response.json();

      // Get the order item ID for status update
      orderItemId = result.orderItem.id; // NOW ACCESSIBLE IN CATCH

      // Now initiate payment via MetaMask
      setPaymentStatus("Waiting for wallet confirmation...");

      await handleWBTCPayment(orderItemId, selectedItem);
    } catch (err) {
      setPaymentLoading(false);
      setPaymentStatus("");
      console.error("Error creating order:", err);

      // If order was created but payment failed, we need to handle cleanup
      if (err.orderCreated) {
        alert(
          "Order was created but payment failed. Please contact support or try again."
        );
      } else {
        alert(err.message || "Failed to create order. Please try again.");
      }
    }
  };

  // Handle WBTC payment via MetaMask
  const handleWBTCPayment = async (orderItemId, item) => {
    let paymentOrderId = orderItemId; // CREATE LOCAL COPY

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      // Prefer MetaMask if multiple wallets exist
      let eth = window.ethereum;
      if (window.ethereum.providers?.length) {
        eth = window.ethereum.providers.find((p) => p.isMetaMask);
        if (!eth) {
          throw new Error("MetaMask not found");
        }
      }

      // 1️⃣ CONNECT WALLET (POPUP OPENS)
      const accounts = await eth.request({
        method: "eth_requestAccounts",
      });
      const userAccount = accounts[0];
      setPaymentStatus("Wallet connected...");

      // 2️⃣ ENSURE ETH MAINNET
      const chainId = await eth.request({ method: "eth_chainId" });
      if (chainId !== "0x1") {
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x1" }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            throw new Error("Please add Ethereum Mainnet to your MetaMask and try again.");
          } else if (switchError.code === 4001) {
            throw new Error("Network switch rejected. Please switch to Ethereum Mainnet manually.");
          }
          throw switchError;
        }
      }
      

      // 3️⃣ FETCH MERCHANT WALLET
      // 3️⃣ FETCH MERCHANT WALLET
      const walletRes = await fetch(
        `https://dmarketplacebackend.vercel.app/merchant/product/${item.productId}/seller-wallet`
      );

      if (!walletRes.ok) {
        throw new Error(
          "Failed to fetch merchant wallet address. Please try again."
        );
      }

      const walletJson = await walletRes.json();
      const walletAddress = walletJson.walletAddress;

      // 🔎 HARD DEBUG LOGS
   
      ("=========================");

      // 4️⃣ VALIDATE ADDRESS (CRITICAL)
      const isValidEthAddress = (addr) =>
        typeof addr === "string" && addr.startsWith("0x") && addr.length === 42;

      if (!isValidEthAddress(walletAddress)) {
        console.error("❌ INVALID MERCHANT WALLET ADDRESS:", walletJson);
        throw new Error(
          "Invalid merchant wallet address. Cannot proceed with payment. Please contact the seller."
        );
      }
      // 5️⃣ CALCULATE PAYMENT IN WBTC
      const amountInWbtc = TESTING_MODE
        ? HARDCODED_WBTC_PRICE
        : Number(convertToWbtc(item.price * item.quantity));

      // Convert to smallest WBTC units (8 decimals)
      const wbtcUnits = BigInt(Math.floor(amountInWbtc * 1e8));

      setPaymentStatus("Confirming transaction in MetaMask...");

      // 6️⃣ ENCODE ERC20 TRANSFER
      const transferData =
        "0xa9059cbb" + // transfer function signature
        walletAddress.slice(2).padStart(64, "0") + // recipient address
        wbtcUnits.toString(16).padStart(64, "0"); // amount in hex

      // 7️⃣ SEND WBTC TRANSACTION (METAMASK CONFIRM POPUP)
      const txHash = await eth.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: userAccount,
            to: WBTC_CONTRACT_ADDRESS,
            data: transferData,
            gas: "0x15F90", // 90000 gas for ERC20 transfer
          },
        ],
      });
      setPaymentStatus("Processing payment...");

      // 8️⃣ UPDATE BACKEND
      await updateOrderStatus(orderItemId, "PAID", txHash);

      // 9️⃣ CLEANUP
      await handleDeleteItemFromCart(item.cartItemId);

      setShowCheckoutModal(false);
      setSelectedItem(null);
      // Address is preserved

      setPaymentStatus("Payment successful!");
      alert("✅ Payment successful!");
      setPaymentLoading(false);
      setPaymentStatus("");
    } catch (err) {
      setPaymentLoading(false);
      setPaymentStatus("");
      console.error("=== WBTC PAYMENT ERROR ===", err);

      // Update order status to FAILED if order was created
      if (paymentOrderId) {
        // CHANGED FROM orderItemId
        try {
          await updateOrderStatus(paymentOrderId, "FAILED"); // CHANGED FROM orderItemId
        } catch (statusErr) {
          console.error("Failed to update order status:", statusErr);
        }
      }

      // Handle specific error cases
      if (err.code === 4001) {
        alert(
          "❌ Transaction cancelled by user. Your order has been marked as failed."
        );
      } else if (err.code === -32002) {
        alert(
          "⚠️ MetaMask request already pending. Please check your MetaMask extension."
        );
      } else if (err.message?.includes("insufficient funds")) {
        alert(
          "❌ Insufficient WBTC balance in your wallet. Please add funds and try again."
        );
      } else if (err.message?.includes("Invalid merchant wallet")) {
        alert(
          "❌ Merchant wallet address is invalid. Please contact the seller."
        );
      } else {
        alert(
          `❌ Payment failed: ${
            err.message || "Unknown error"
          }. Your order has been marked as failed.`
        );
      }

      // Throw error with flag so handleCheckout knows order was created
      const enhancedError = new Error(err.message);
      enhancedError.orderCreated = !!paymentOrderId; // CHANGED FROM orderItemId
      throw enhancedError;
    }
  };

  // Update waitForTransactionConfirmation to accept provider
  const waitForTransactionConfirmation = async (txHash, provider) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max wait time

      const checkTransaction = async () => {
        try {
          attempts++;

          const receipt = await provider.request({
            method: "eth_getTransactionReceipt",
            params: [txHash],
          });

          if (receipt && receipt.blockNumber) {
            if (receipt.status === "0x1") {
              resolve(receipt);
            } else {
              reject(new Error("Transaction failed"));
            }
          } else if (attempts >= maxAttempts) {
            reject(new Error("Transaction confirmation timeout"));
          } else {
            // Check again after 2 seconds
            setTimeout(checkTransaction, 2000);
          }
        } catch (error) {
          reject(error);
        }
      };
      checkTransaction();
    });
  };

  // Update order status in backend
  const updateOrderStatus = async (
    orderItemId,
    status,
    transactionHash = null
  ) => {
    try {
      const response = await fetch(
        `https://dmarketplacebackend.vercel.app/merchant/order-item/${orderItemId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            transactionHash,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      return await response.json();
    } catch (err) {
      console.error("Error updating order status:", err);
      throw err;
    }
  };

  // Fetch cart on component mount
  useEffect(() => {
    fetchCartFromDB();
    fetchWbtcPrice();

    // Refresh WBTC price every 60 seconds
    const interval = setInterval(fetchWbtcPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (address.name || address.email || address.street) {
      localStorage.setItem("shippingAddress", JSON.stringify(address));
    }
  }, [address]);

  if (loading || wbtcLoading) {
    return (
      <div className="min-h-[80vh] mx-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] mx-6 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-xl">Error loading cart</p>
          <p className="text-sm mt-2">{error}</p>
          <button
            onClick={fetchCartFromDB}
            className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {cartItems.length > 0 ? (
        <div className="min-h-screen mx-6 text-slate-800 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <PageTitle
              heading="My Cart"
              text={`${cartItems.length} items in your cart`}
              linkText="Continue Shopping"
            />
            <div className="max-w-5xl mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  ₿
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900 mb-1">
                    Payment in WBTC (Wrapped Bitcoin)
                  </p>
                  <p className="text-slate-700">
                    Prices shown in WBTC. Payment will be made using WBTC on
                    Ethereum network via MetaMask. Make sure you have enough
                    WBTC in your wallet.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-5xl">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="bg-slate-50 rounded-lg overflow-hidden w-full sm:w-40 h-40 relative">
                        <Image
                          src={item.image}
                          className="object-contain p-4"
                          alt={item.name || "Product"}
                          fill
                          sizes="160px"
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-grow">
                          <h3 className="text-xl font-bold text-slate-900 mb-1">
                            {item.name}
                          </h3>
                          {item.sku && item.sku !== "N/A" && (
                            <p className="text-xs text-slate-500 font-mono">
                              SKU: {item.sku}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            handleDeleteItemFromCart(item.cartItemId)
                          }
                          className="text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all ml-2"
                          title="Remove from cart"
                        >
                          <Trash2Icon size={20} />
                        </button>
                      </div>

                      {/* Variant Details */}
                      {(item.color || item.size) && (
                        <div className="flex gap-4 mb-4">
                          {item.color && (
                            <div className="text-sm">
                              <span className="text-slate-500">Color: </span>
                              <span className="font-semibold text-slate-900">
                                {item.color}
                              </span>
                            </div>
                          )}
                          {item.size && (
                            <div className="text-sm">
                              <span className="text-slate-500">Size: </span>
                              <span className="font-semibold text-slate-900">
                                {item.size}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Price and Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-auto">
                        {/* Price and Quantity */}
                        <div className="flex items-center gap-8">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">
                              Unit Price
                            </p>
                            <p className="text-2xl font-bold text-slate-900">
                              ₿{" "}
                              {TESTING_MODE
                                ? HARDCODED_WBTC_PRICE.toFixed(8)
                                : convertToWbtc(item.price)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-2">
                              Quantity
                            </p>
                            <div className="flex items-center gap-3 border border-slate-300 rounded-lg p-1">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.cartItemId,
                                    item.quantity - 1
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded transition-colors font-semibold text-lg"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.cartItemId,
                                    item.quantity + 1
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded transition-colors font-semibold text-lg"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">
                              Subtotal
                            </p>
                            <p className="text-2xl font-bold text-slate-900">
                              ₿{" "}
                              {TESTING_MODE
                                ? HARDCODED_WBTC_PRICE.toFixed(8)
                                : convertToWbtc(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>

                        {/* Buy Now Button */}
                        <button
                          onClick={() => handleBuyNow(item)}
                          className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 w-full sm:w-auto font-semibold shadow-md hover:shadow-lg"
                        >
                          <ShoppingBag size={20} />
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="max-w-5xl mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-600 text-sm mb-1">Total Items</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600 text-sm mb-1">Cart Total</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ₿{" "}
                    {TESTING_MODE
                      ? (HARDCODED_WBTC_PRICE * cartItems.length).toFixed(8)
                      : convertToWbtc(
                          cartItems.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          )
                        )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-[80vh] mx-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={48} className="text-slate-400" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-800 mb-2">
              Your cart is empty
            </h1>
            <p className="text-slate-500 mb-6">
              Add some products to get started
            </p>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors">
              Start Shopping
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Checkout</h2>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 mb-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 text-lg">
                Order Summary
              </h3>

              <div className="flex gap-4 mb-4 pb-4 border-b border-slate-200">
                <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedItem.image || "/placeholder.png"}
                    alt={selectedItem.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    {selectedItem.name}
                  </h4>
                  {(selectedItem.color || selectedItem.size) && (
                    <div className="text-xs text-slate-600 space-y-0.5">
                      {selectedItem.color && <p>Color: {selectedItem.color}</p>}
                      {selectedItem.size && <p>Size: {selectedItem.size}</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Unit Price:</span>
                  <span className="font-semibold text-slate-900">
                    ₿{" "}
                    {TESTING_MODE
                      ? HARDCODED_WBTC_PRICE.toFixed(8)
                      : convertToWbtc(selectedItem.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Quantity:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedItem.quantity}
                  </span>
                </div>
                <div className="border-t border-slate-300 pt-2 flex justify-between text-lg">
                  <span className="font-bold text-slate-900">Total:</span>
                  <span className="font-bold text-slate-900">
                    ₿{" "}
                    {TESTING_MODE
                      ? HARDCODED_WBTC_PRICE.toFixed(8)
                      : convertToWbtc(
                          selectedItem.price * selectedItem.quantity
                        )}
                  </span>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-orange-900">
                    <span className="font-semibold">Payment:</span>{" "}
                    {TESTING_MODE
                      ? `${HARDCODED_WBTC_PRICE.toFixed(8)} WBTC (Test Mode)`
                      : `${convertToWbtc(
                          selectedItem.price * selectedItem.quantity
                        )} WBTC`}{" "}
                    via MetaMask
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address Form */}
            <div className="space-y-4 mb-6">
              <h3 className="font-bold text-slate-900 text-lg">
                Shipping Details
              </h3>
              <input
                type="text"
                placeholder="Full Name"
                value={address.name}
                onChange={(e) =>
                  setAddress({ ...address, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={address.phone}
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={address.email}
                onChange={(e) =>
                  setAddress({ ...address, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />

              <input
                type="text"
                placeholder="Street Address"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="State/Province"
                  value={address.state}
                  onChange={(e) =>
                    setAddress({ ...address, state: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="ZIP/Postal Code"
                  value={address.zipCode}
                  onChange={(e) =>
                    setAddress({ ...address, zipCode: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={address.country}
                  onChange={(e) =>
                    setAddress({ ...address, country: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  setSelectedItem(null);
                  // Address is preserved
                }}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={paymentLoading}
                className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {paymentStatus}
                  </>
                ) : (
                  "Pay with WBTC"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
