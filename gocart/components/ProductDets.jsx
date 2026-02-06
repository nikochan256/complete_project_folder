import {
  ShoppingBag,
  Star,
  X,
  Sparkles,
  Gift,
  ShieldCheck,
  Truck,
  Zap,
  Tag,
  TrendingUp,
  Award,
  Heart,
  Share2,
  ChevronRight,
  Store,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

// Mini Product Card for recommendations
function MiniProductCard({ product, onClick }) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-400 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-square bg-slate-50 p-4 flex items-center justify-center overflow-hidden">
        <img
          src={product.image1}
          alt={product.name}
          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white p-2 rounded-full shadow-md hover:bg-red-50">
            <Heart size={16} className="text-slate-600" />
          </button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="fill-orange-400 text-orange-400" />
          <span className="text-xs text-slate-500">
            {(Math.random() * (5 - 4) + 4).toFixed(1)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
  <span className="text-lg font-bold text-slate-900">
    ₿ {((product.price) * 0.000010).toFixed(8)}
  </span>
  <span className="text-xs text-slate-600">
    ≈ ${product.price}
  </span>
</div>
<button className="bg-slate-900 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors">
  <ShoppingBag size={14} />
</button>

      </div>
    </div>
  );
}

export function ProductDetailPage({ product, onClose, onClick, allProducts }) {
  const [quantity, setQuantity] = useState(1);
  const [btcPrice, setBtcPrice] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState({ type: "", text: "" });
  const containerRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [animateCart, setAnimateCart] = useState(false);
  const navigate = useRouter();

  useEffect(() => {
    const fetchBtcRate = async () => {
      try {
        const response = await fetch(
          "https://api.coinbase.com/v2/exchange-rates?currency=USD"
        );
        const data = await response.json();
        const rate = parseFloat(data.data.rates.BTC);
        setBtcPrice((product.price) * rate);
      } catch (error) {
        console.error("Failed to fetch BTC rate:", error);
      }
    };
    fetchBtcRate();
  }, [product.price]);

  // Fetch initial cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const userId = localStorage.getItem("dmarketplaceUserId");
        if (!userId) return;

        const response = await fetch(
          `https://dmarketplacebackend.vercel.app/user/cart/${userId}`
        );
        const result = await response.json();

        if (result.success) {
          const totalItems =
            result.data.cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          setCartCount(totalItems);
        }
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
      }
    };

    fetchCartCount();
  }, []);

  useEffect(() => {
    // Scroll the fixed container to top
    const container = document.querySelector(".fixed.inset-0.overflow-y-auto");
    if (container) {
      container.scrollTop = 0;
    }
  }, [product]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = (event) => {
      setCartCount(event.detail.totalItems);

      // Trigger animation
      setAnimateCart(true);
      setTimeout(() => setAnimateCart(false), 600);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const similarProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  const recentlyViewed = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 6);

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));

  // Handle clicking on similar products - switches to that product
  const handleSimilarProductClick = (clickedProduct) => {
    onClick(clickedProduct);
    setQuantity(1);
    setCartMessage({ type: "", text: "" });
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      setCartMessage({ type: "", text: "" });

      const userId = localStorage.getItem("dmarketplaceUserId");

      if (!userId) {
        setCartMessage({
          type: "error",
          text: "Please login to add items to cart",
        });
        setAddingToCart(false);
        return;
      }

      const response = await fetch("https://dmarketplacebackend.vercel.app/user/add-to-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          productId: product.id,
          quantity: quantity,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCartMessage({
          type: "success",
          text: result.message || "Added to cart successfully!",
        });

        window.dispatchEvent(
          new CustomEvent("cartUpdated", {
            detail: { totalItems: result.data.totalItems },
          })
        );

        setTimeout(() => {
          setCartMessage({ type: "", text: "" });
        }, 3000);
      } else {
        setCartMessage({
          type: "error",
          text: result.message || "Failed to add to cart",
        });
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      setCartMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleGoToCart = () => {
    navigate.push("/cart");
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-slate-50 z-[110] overflow-y-auto"
    >
      {cartMessage.text && (
        <div
          className={`fixed top-24 right-6 z-[120] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top ${
            cartMessage.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {cartMessage.type === "success" ? (
            <Check size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-semibold">{cartMessage.text}</span>
        </div>
      )}

      {/* Professional Promo Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 text-white py-3 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm">
          <Zap size={16} className="text-white fill-white animate-bounce" />
          <span className="font-bold tracking-tight">SPECIAL OFFER:</span>
          <span className="font-medium">
            Use code{" "}
            <span className="bg-white text-red-600 px-2 py-0.5 rounded-full font-bold mx-1">
              AGENTIC10
            </span>{" "}
            for 10% off
          </span>
          <Zap size={16} className="text-white fill-white animate-bounce" />
        </div>
      </div>

      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
            >
              <X
                size={20}
                className="group-hover:rotate-90 transition-transform"
              />
              <span className="font-semibold">Back to Shop</span>
            </button>

            <div className="flex items-center gap-3">
            

              {/* Cart Button */}
              <button
                onClick={handleGoToCart}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors group"
              >
                <ShoppingCart
                  size={24}
                  className={`text-slate-700 group-hover:text-slate-900 transition-transform ${
                    animateCart ? "animate-bounce" : ""
                  }`}
                />

                {cartCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg transition-transform ${
                      animateCart ? "scale-125" : "scale-100"
                    }`}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Minimal Seller Info - Top of Page */}
        {product.seller && (
          <div className="flex items-center gap-3 mb-6">
            {product.seller.logoImg ? (
              <img
                src={product.seller.logoImg}
                alt={product.seller.shopName}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                <Store size={20} className="text-slate-600" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900">
                  {product.seller.shopName}
                </span>
                {product.seller.isApproved && product.seller.kybStatus === "APPROVED" && (
                  <CheckCircle
                    size={16}
                    className="text-blue-600 fill-blue-600"
                    title="Verified Merchant"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Single Product Image */}
          <div className="space-y-6">
  {/* Main Image Display */}
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden aspect-square flex items-center justify-center p-8 relative group">
    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
      <Tag size={12} /> NEW ARRIVAL
    </div>
    <img
      src={[product.image1, product.image2, product.image3].filter(Boolean)[selectedImage] || product.image1}
      alt={product.name}
      className="max-w-[90%] max-h-[90%] object-contain group-hover:scale-105 transition-transform duration-700"
    />
  </div>

  {/* Thumbnail Images */}
  {[product.image1, product.image2, product.image3].filter(Boolean).length > 1 && (
    <div className="grid grid-cols-3 gap-3">
      {[product.image1, product.image2, product.image3].filter(Boolean).map((img, idx) => (
        <button
          key={idx}
          onClick={() => setSelectedImage(idx)}
          className={`bg-white rounded-xl border-2 overflow-hidden aspect-square p-2 hover:border-blue-500 transition-all ${
            selectedImage === idx ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
          }`}
        >
          <img
            src={img}
            alt={`${product.name} view ${idx + 1}`}
            className="w-full h-full object-contain"
          />
        </button>
      ))}
    </div>
  )}


            {/* Professional Ad Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
                        LIMITED TIME
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      Bundle & Save More
                    </h3>
                    <p className="text-blue-100 text-sm mb-4">
                      Buy 2 or more items and get 15% off instantly
                    </p>
                    <button
                    onClick={onClose}
                    className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm flex items-center gap-2">
                      Shop Bundle <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="text-6xl">🎁</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                {product.category}
              </span>
              <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{" "}
                In Stock
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-orange-400 text-orange-400"
                  />
                ))}
              </div>
              <span className="text-slate-600 text-sm font-medium">
                4.8 (128 reviews)
              </span>
            </div>

{/* Price Section */}
<div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200">
  <div className="flex items-baseline gap-3 mb-2">
    {btcPrice !== null ? (
      <>
        <span className="text-4xl font-bold text-orange-400">
          ₿ {btcPrice.toFixed(8)}
        </span>
        <span className="text-lg text-slate-400 line-through">
          ₿ {(btcPrice * 1.3).toFixed(8)}
        </span>
        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
          SAVE 30%
        </span>
      </>
    ) : (
      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    )}
  </div>
  <div className="text-slate-600 text-sm">
    ≈ ${product.price} USD
  </div>
</div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
              <h3 className="font-semibold text-slate-900 text-sm mb-3 uppercase tracking-wide">
                Product Description
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {product.description ||
                  "Premium quality product with exceptional performance and durability. Carefully crafted with attention to detail and built to last. Perfect for everyday use with a modern design that fits any style."}
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <Truck size={24} className="text-blue-600 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-slate-700">
                  Free Shipping
                </span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <ShieldCheck
                  size={24}
                  className="text-green-600 mx-auto mb-2"
                />
                <span className="text-xs font-semibold text-slate-700">
                  1 Year Warranty
                </span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <Gift size={24} className="text-purple-600 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  Gift Wrap
                </span>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-900 text-sm">
                  Quantity:
                </span>
                <div className="flex items-center bg-white border border-slate-300 rounded-lg">
                  <button
                    onClick={decreaseQty}
                    disabled={addingToCart}
                    className="w-10 h-10 flex disabled:opacity-50 items-center justify-center hover:bg-slate-50 text-lg font-bold"
                  >
                    -
                  </button>
                  <div className="w-12 text-center font-bold">{quantity}</div>
                  <button
                    onClick={increaseQty}
                    disabled={addingToCart}
                    className="w-10 h-10 flex disabled:opacity-50 items-center justify-center hover:bg-slate-50 text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="py-3.5 px-6 rounded-xl border-2 border-slate-900 font-semibold hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} /> Add to Cart
                    </>
                  )}
                </button>
                {/* <button className="py-3.5 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
                  <Sparkles size={20} /> Buy Now
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Trending Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl overflow-hidden mb-12">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <TrendingUp size={32} className="text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-1">Trending This Week</h3>
                <p className="text-purple-100">
                  Discover what everyone's buying right now
                </p>
              </div>
            </div>
            <button
          onClick={onClose}
            className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2">
              Explore Trends <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Enhanced Recommendations */}
        <div className="space-y-10">
          {similarProducts.length > 0 && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  You Might Also Like
                </h2>
                <p className="text-slate-600">
                  Similar products in the same category
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {similarProducts.map((p) => (
                  <MiniProductCard
                    key={p.id}
                    product={p}
                    onClick={() => handleSimilarProductClick(p)}
                  />
                ))}
              </div>
            </section>
          )}

          {recentlyViewed.length > 0 && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  More Products to Explore
                </h2>
                <p className="text-slate-600">
                  Handpicked recommendations just for you
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {recentlyViewed.map((p) => (
                  <MiniProductCard
                    key={p.id}
                    product={p}
                    onClick={() => handleSimilarProductClick(p)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}