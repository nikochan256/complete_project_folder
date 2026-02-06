'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon, ClockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";

const ProductDetails = ({ product, storeId }) => {

    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    const router = useRouter();

    const [mainImage, setMainImage] = useState(product.image);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication and redirect if not logged in
    useEffect(() => {
        const userId = localStorage.getItem('dmarketplaceUserId');
        
        if (!userId) {
            // Not logged in - redirect to shop
            router.push('/shop');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    // Add to recently viewed when component mounts
    useEffect(() => {
        if (!isAuthenticated) return;

        const addToRecentlyViewed = async () => {
            try {
                const userId = localStorage.getItem('dmarketplaceUserId');
                
                const response = await fetch('https://dmarketplacebackend.vercel.app/user/add-recently-viewed', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: parseInt(userId),
                        productId: parseInt(productId),
                        storeId: parseInt(storeId),
                        productName: product.name,
                        productImg: product.image,
                        productPrice: parseInt(product.price),
                        variantId: product.variantId || null
                    })
                });

                if (!response.ok) {
                    console.error('Failed to add to recently viewed');
                }
            } catch (error) {
                console.error('Error adding to recently viewed:', error);
            }
        };

        addToRecentlyViewed();
    }, [isAuthenticated, productId, storeId, product]);

    // Fetch recently viewed products
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchRecentlyViewed = async () => {
            try {
                const userId = localStorage.getItem('dmarketplaceUserId');
                
                const response = await fetch(`https://dmarketplacebackend.vercel.app/user/recently-viewed/${userId}?limit=8`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch recently viewed');
                }

                const result = await response.json();
                
                // Filter out current product
                const filtered = result.data.filter(item => item.productId !== parseInt(productId));
                setRecentlyViewed(filtered);
            } catch (error) {
                console.error('Error fetching recently viewed:', error);
            } finally {
                setIsLoadingRecent(false);
            }
        };

        fetchRecentlyViewed();
    }, [isAuthenticated, productId]);

    const addToCartHandler = async () => {
        try {
            const userId = localStorage.getItem('dmarketplaceUserId');
            
            if (!userId) {
                alert('Please login to add items to cart');
                router.push('/shop');
                return;
            }

            setIsAddingToCart(true);

            const response = await fetch('https://dmarketplacebackend.vercel.app/user/add_to_cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    productId: parseInt(productId)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add to cart');
            }

            const result = await response.json();

            dispatch(addToCart({ productId }));

        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item to cart. Please try again.');
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-slate-500">Redirecting to shop...</div>
            </div>
        );
    }

    const averageRating = 5;
    
    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex max-lg:flex-col gap-12">
                {/* Product Images */}
                <div className="flex max-sm:flex-col-reverse gap-3">
                    <div className="flex sm:flex-col gap-3">
                        {/* Thumbnail images would go here */}
                    </div>
                    <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg">
                        <Image className="w-full h-full object-cover rounded-lg" src={mainImage} alt={product.name} width={500} height={500} />
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex-1">
                    <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                    <div className='flex items-center mt-2'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                        <p className="text-sm ml-3 text-slate-500">Reviews</p>
                    </div>
                    <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                        <p>{currency}{product.price}</p>
                        <p className="text-xl text-slate-500 line-through">{currency}{product.price}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <TagIcon size={14} />
                    </div>
                    <div className="flex items-end gap-5 mt-10">
                        {cart[productId] && (
                            <div className="flex flex-col gap-3">
                                <p className="text-lg text-slate-800 font-semibold">Quantity</p>
                                <Counter productId={productId} />
                            </div>
                        )}
                    </div>
                    <hr className="border-gray-300 my-5" />
                    <div className="flex flex-col gap-4 text-slate-500">
                        <p className="flex gap-3"><EarthIcon className="text-slate-400" /> Free shipping worldwide</p>
                        <p className="flex gap-3"><CreditCardIcon className="text-slate-400" /> 100% Secured Payment</p>
                        <p className="flex gap-3"><UserIcon className="text-slate-400" /> Trusted by top brands</p>
                    </div>
                </div>
            </div>

            {/* Recently Viewed Section */}
            <div className="mt-16">
                <div className="flex items-center gap-2 mb-6">
                    <ClockIcon className="w-5 h-5 text-slate-600" />
                    <h2 className="text-2xl font-bold text-slate-800">Recently Viewed</h2>
                </div>

                {isLoadingRecent ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : recentlyViewed.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {recentlyViewed.map((item) => (
                            <Link
                                key={item.id}
                                href={`/product/${item.storeId}/${item.productId}`}
                                className="group bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden"
                            >
                                <div className="relative aspect-square bg-slate-100">
                                    <Image
                                        src={item.productImg}
                                        alt={item.productName}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div className="p-3">
                                    <h3 className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {item.productName}
                                    </h3>
                                    <p className="text-lg font-bold text-slate-900 mt-2">
                                        {currency}{item.productPrice}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Viewed {new Date(item.viewedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <ClockIcon size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500">No recently viewed products yet</p>
                        <Link href="/shop" className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block">
                            Browse products →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;