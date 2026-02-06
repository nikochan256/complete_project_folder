'use client'
import { Suspense, useEffect, useState, useMemo } from "react"
import { ShoppingBag, Star, X, Sparkles, Gift } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { ProductDetailPage } from "../../../components/ProductDets" 

// Spinning Wheel Component
function SpinningWheel({ isOpen, onClose, onComplete, randomProduct }) {
    const [isSpinning, setIsSpinning] = useState(false)
    const [rotation, setRotation] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [discount, setDiscount] = useState(0)

    const discounts = [5, 10, 0, 15]
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']


    const spinWheel = () => {
        if (isSpinning) return
        setIsSpinning(true)
        
        // 1. Pick a random index
        const randomIndex = Math.floor(Math.random() * discounts.length)
        const selectedValue = discounts[randomIndex]
        
        // 2. Calculate rotation
        const sliceWidth = 360 / discounts.length
        const extraSpins = (5 + Math.random() * 3) * 360 // 5 to 8 full spins
        
        // To land on a specific slice at the top (12 o'clock position):
        // We need to rotate so that the CENTER of that slice aligns with the pointer
        // The center of slice at index i is at: (i * sliceWidth) + (sliceWidth / 2)
        const targetAngle = (randomIndex * sliceWidth) + (sliceWidth / 2)
        
        // Final rotation: extra spins + angle to reach target
        // We add 360 - targetAngle to rotate clockwise to the correct position
        const finalRotation = extraSpins + (360 - targetAngle)
        
        setRotation(finalRotation)
        setDiscount(selectedValue)

        setTimeout(() => {
            setIsSpinning(false)
            setShowResult(true)
            setTimeout(() => {
                onComplete(selectedValue)
            }, 3000)
        }, 4000)
    }

    useEffect(() => {
        if (isOpen) {
            setShowResult(false)
            setRotation(0)
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-lg w-full max-h-[95vh] overflow-y-auto relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
                    <X size={24} />
                </button>

                {!showResult ? (
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4 mt-4">
                            <Sparkles className="text-yellow-500 shrink-0" size={24} />
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Lucky Draw!</h2>
                            <Sparkles className="text-yellow-500 shrink-0" size={24} />
                        </div>
                        <p className="text-slate-600 mb-6 text-sm sm:text-base">Spin to win amazing discounts!</p>

                        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-8">
                            <div 
                                className="w-full h-full rounded-full relative transition-transform duration-[4000ms] ease-out border-4 border-slate-100 shadow-inner"
                                style={{ 
                                    transform: `rotate(${rotation}deg)`,
                                    background: `conic-gradient(${colors.map((color, i) => 
                                        `${color} ${(360 / discounts.length) * i}deg ${(360 / discounts.length) * (i + 1)}deg`
                                    ).join(', ')})`
                                }}
                            >
                                {discounts.map((disc, i) => (
                                    <div
                                        key={i}
                                        className="absolute top-1/2 left-1/2 text-white font-bold text-sm sm:text-xl"
                                        style={{
                                            transform: `rotate(${(360 / discounts.length) * i + (360 / discounts.length / 2)}deg) translate(clamp(70px, 20vw, 100px)) rotate(-${(360 / discounts.length) * i + (360 / discounts.length / 2)}deg)`,
                                            transformOrigin: '0 0',
                                            marginLeft: '-15px',
                                            marginTop: '-10px'
                                        }}
                                    >
                                        {disc}%
                                    </div>
                                ))}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                                    <Sparkles className="text-yellow-500" size={24} />
                                </div>
                            </div>
                            {/* The Pointer */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-red-500 sm:border-l-[15px] sm:border-r-[15px] sm:border-t-[30px]"></div>
                            </div>
                        </div>

                        <button
                            onClick={spinWheel}
                            disabled={isSpinning}
                            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 shadow-lg transition-all"
                        >
                            {isSpinning ? 'Spinning...' : 'SPIN NOW!'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <div className="text-5xl mb-2">🎉</div>
                        <h3 className="text-2xl font-bold text-slate-800">Congratulations!</h3>
                        <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 my-4">
                            {discount}% OFF
                        </div>
                        
                        {randomProduct && (
                            <div className="bg-slate-50 rounded-xl p-4 mb-6 mx-auto">
                                <img src={randomProduct.image} alt={randomProduct.name} className="w-24 h-24 object-contain mx-auto mb-2"/>
                                <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{randomProduct.name}</h4>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <span className="text-slate-400 line-through text-sm">${(randomProduct.price / 100).toFixed(2)}</span>
                                    <span className="text-xl font-bold text-green-600">${((randomProduct.price * (100 - discount)) / 10000).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={onClose} className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold order-2 sm:order-1">Close</button>
                            <button onClick={onClose} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold order-1 sm:order-2">Buy Now</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function ProductCard({ product, onClick }) {
    const [btcPrice, setBtcPrice] = useState(null)

    useEffect(() => {
        const fetchBtcRate = async () => {
            try {
                const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD')
                const data = await response.json()
                const rate = parseFloat(data.data.rates.BTC)
                setBtcPrice((product.price) * rate)
            } catch (error) {
                console.error('Failed to fetch BTC rate:', error)
            }
        }
        fetchBtcRate()
    }, [product.price])

    return (
        <div 
            onClick={() => onClick(product)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-slate-100 cursor-pointer"
        >
            <div className="px-4 pt-4">
                <span className="inline-block bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full uppercase font-medium">
                    {product.category}
                </span>
            </div>
            <div className="relative w-full h-40 sm:h-48 p-6 flex items-center justify-center">
                <img src={product.image1} alt={product.name} className="max-w-full max-h-full object-contain hover:scale-110 transition-transform duration-300"/>
            </div>
            <div className="px-5 pb-5 flex flex-col">
                <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-1 mb-3">
                    <Star size={14} className="fill-orange-400 text-orange-400" />
                </div>
                <div className="space-y-2">
                    {btcPrice !== null ? (
                        <div>
                            <div className="text-lg sm:text-xl font-bold text-orange-600">
                                ₿ {btcPrice.toFixed(8)}
                            </div>
                            <div className="text-xs text-slate-600">
                                ≈ ${product.price } USD
                            </div>
                        </div>
                    ) : (
                        <div className="text-lg sm:text-xl font-bold text-slate-300">
                            Loading...
                        </div>
                    )}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation()
                            onClick(product)
                        }}
                        className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors text-sm sm:text-base"
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    )
}

// function SpinningWheel({ isOpen, onClose, onComplete, randomProduct }) {
//     const [isSpinning, setIsSpinning] = useState(false)
//     const [rotation, setRotation] = useState(0)
//     const [showResult, setShowResult] = useState(false)
//     const [discount, setDiscount] = useState(0)

//     const discounts = [5, 10, 0, 15]
//     const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']

//     const spinWheel = () => {
//         if (isSpinning) return
//         setIsSpinning(true)
        
//         // 1. Pick a random index
//         const randomIndex = Math.floor(Math.random() * discounts.length)
//         const selectedValue = discounts[randomIndex]
        
//         // 2. Calculate rotation
//         const sliceWidth = 360 / discounts.length
//         const extraSpins = (5 + Math.random() * 3) * 360 // 5 to 8 full spins
        
//         // To land on a specific slice at the top (12 o'clock position):
//         // We need to rotate so that the CENTER of that slice aligns with the pointer
//         // The center of slice at index i is at: (i * sliceWidth) + (sliceWidth / 2)
//         const targetAngle = (randomIndex * sliceWidth) + (sliceWidth / 2)
        
//         // Final rotation: extra spins + angle to reach target
//         // We add 360 - targetAngle to rotate clockwise to the correct position
//         const finalRotation = extraSpins + (360 - targetAngle)
        
//         setRotation(finalRotation)
//         setDiscount(selectedValue)

//         setTimeout(() => {
//             setIsSpinning(false)
//             setShowResult(true)
//             setTimeout(() => {
//                 onComplete(selectedValue)
//             }, 3000)
//         }, 4000)
//     }

//     useEffect(() => {
//         if (isOpen) {
//             setShowResult(false)
//             setRotation(0)
//         }
//     }, [isOpen])

//     if (!isOpen) return null

//     return (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
//             <div className="bg-white rounded-3xl p-5 max-w-lg w-full max-h-[95vh] overflow-y-auto relative shadow-2xl">
//                 <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
//                     <X size={24} />
//                 </button>

//                 {!showResult ? (
//                     <div className="text-center">
//                         <div className="flex items-center justify-center gap-2 mb-4 mt-4">
//                             <Sparkles className="text-yellow-500 shrink-0" size={24} />
//                             <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Lucky Draw!</h2>
//                             <Sparkles className="text-yellow-500 shrink-0" size={24} />
//                         </div>
//                         <p className="text-slate-600 mb-6 text-sm sm:text-base">Spin to win amazing discounts!</p>

//                         <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-8">
//                             <div 
//                                 className="w-full h-full rounded-full relative transition-transform duration-[4000ms] ease-out border-4 border-slate-100 shadow-inner"
//                                 style={{ 
//                                     transform: `rotate(${rotation}deg)`,
//                                     background: `conic-gradient(${colors.map((color, i) => 
//                                         `${color} ${(360 / discounts.length) * i}deg ${(360 / discounts.length) * (i + 1)}deg`
//                                     ).join(', ')})`
//                                 }}
//                             >
//                                 {discounts.map((disc, i) => (
//                                     <div
//                                         key={i}
//                                         className="absolute top-1/2 left-1/2 text-white font-bold text-sm sm:text-xl"
//                                         style={{
//                                             transform: `rotate(${(360 / discounts.length) * i + (360 / discounts.length / 2)}deg) translate(clamp(70px, 20vw, 100px)) rotate(-${(360 / discounts.length) * i + (360 / discounts.length / 2)}deg)`,
//                                             transformOrigin: '0 0',
//                                             marginLeft: '-15px',
//                                             marginTop: '-10px'
//                                         }}
//                                     >
//                                         {disc}%
//                                     </div>
//                                 ))}
//                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
//                                     <Sparkles className="text-yellow-500" size={24} />
//                                 </div>
//                             </div>
//                             {/* The Pointer */}
//                             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
//                                 <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-red-500 sm:border-l-[15px] sm:border-r-[15px] sm:border-t-[30px]"></div>
//                             </div>
//                         </div>

//                         <button
//                             onClick={spinWheel}
//                             disabled={isSpinning}
//                             className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 shadow-lg transition-all"
//                         >
//                             {isSpinning ? 'Spinning...' : 'SPIN NOW!'}
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="text-center py-4">
//                         <div className="text-5xl mb-2">🎉</div>
//                         <h3 className="text-2xl font-bold text-slate-800">Congratulations!</h3>
//                         <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 my-4">
//                             {discount}% OFF
//                         </div>
                        
//                         {randomProduct && (
//                             <div className="bg-slate-50 rounded-xl p-4 mb-6 mx-auto">
//                                 <img src={randomProduct.image} alt={randomProduct.name} className="w-24 h-24 object-contain mx-auto mb-2"/>
//                                 <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{randomProduct.name}</h4>
//                                 <div className="flex items-center justify-center gap-2 mt-1">
//                                     <span className="text-slate-400 line-through text-sm">${(randomProduct.price / 100).toFixed(2)}</span>
//                                     <span className="text-xl font-bold text-green-600">${((randomProduct.price * (100 - discount)) / 10000).toFixed(2)}</span>
//                                 </div>
//                             </div>
//                         )}
                        
//                         <div className="flex flex-col sm:flex-row gap-3">
//                             <button onClick={onClose} className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold order-2 sm:order-1">Close</button>
//                             <button onClick={onClose} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold order-1 sm:order-2">Buy Now</button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }
function AdCard({ size = 'small', type = 'lucky', onOpenLuckyDraw }) {
    if (type === 'lucky' && size === 'large') {
        return (
            <div className="hidden lg:block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles size={40} className="animate-pulse text-yellow-300" />
                            <h3 className="text-4xl font-black tracking-tight">LUCKY DRAW!</h3>
                        </div>
                        <p className="text-white/90 text-xl mb-8 font-medium">Spin the wheel and unlock exclusive discounts up to 40% OFF on your favorite items!</p>
                        <button onClick={onOpenLuckyDraw} className="bg-white text-purple-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center gap-3 group">
                            <Sparkles size={24} className="group-hover:rotate-12 transition-transform" /> 
                            SPIN AND WIN NOW
                        </button>
                    </div>
                    <div className="text-9xl animate-bounce drop-shadow-2xl">🎰</div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white h-full min-h-[160px] flex flex-col justify-between shadow-md">
            <div>
                <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3">🔥</div>
                <h3 className="text-xl font-bold mb-1">Hot Deals</h3>
                <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Limited Time Only</p>
            </div>
            <button className="bg-white text-slate-800 px-5 py-2 rounded-xl text-xs font-bold w-fit mt-4 hover:bg-slate-100 transition-colors">Shop Now</button>
        </div>
    )
}




function ShopContent() {
    const [productsData, setProductsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [showProductDetail, setShowProductDetail] = useState(false)
    const [detailProduct, setDetailProduct] = useState(null)

    const [pagination, setPagination] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('All Product')
    const [wheelOpen, setWheelOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)

    const searchParams = useSearchParams()
    const search = searchParams.get('search')

    const handleOpenWheel = () => {
        if (filteredProducts.length > 0) {
            const randomProduct = filteredProducts[Math.floor(Math.random() * filteredProducts.length)]
            setSelectedProduct(randomProduct)
            setWheelOpen(true)
        }
    }

    const handleProductClick = (product) => {
        setDetailProduct(product)
        setShowProductDetail(true)
    }
    
    const handleCloseDetail = () => {
        setShowProductDetail(false)
        setDetailProduct(null)
    }

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                const response = await fetch(`https://dmarketplacebackend.vercel.app/user/all-products?page=${page}&limit=20`)
                const result = await response.json()
                setProductsData(result.data.products || [])
                setPagination(result.data.pagination)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [page])


    useEffect(() => {
        const handleOpenProduct = (event) => {
            setDetailProduct(event.detail.product)
            setShowProductDetail(true)
        }
        
        window.addEventListener('openProductDetail', handleOpenProduct)
        
        return () => {
            window.removeEventListener('openProductDetail', handleOpenProduct)
        }
    }, [])



    const categories = useMemo(() => ['All Product', ...new Set(productsData.map(p => p.category))], [productsData])

    const filteredProducts = useMemo(() => {
        let filtered = productsData
        if (selectedCategory !== 'All Product') filtered = filtered.filter(p => p.category === selectedCategory)
        if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        return filtered
    }, [productsData, selectedCategory, search])

    if (loading) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading amazing products...</p>
        </div>
    )

    return (
        
        <div className="min-h-screen bg-slate-50 pb-20 sm:pb-8">
            {showProductDetail && detailProduct && (
                <ProductDetailPage 
                    product={detailProduct} 
                    onClose={handleCloseDetail}
                    onClick={handleProductClick}
                    allProducts={productsData}
                />
            )}

            {/* MOBILE FLOATING ACTION BUTTON FOR LUCKY DRAW */}
            <button 
                onClick={handleOpenWheel}
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl animate-bounce flex items-center justify-center"
            >
                <Gift size={28} />
            </button>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-3">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-3xl shadow-sm p-5 lg:sticky lg:top-8 border border-slate-100">
                            <h2 className="font-bold text-lg text-slate-800 mb-5 flex items-center gap-2">
                                <span className="p-2 bg-red-50 text-red-500 rounded-xl"><ShoppingBag size={20} /></span>
                                Categories
                            </h2>
                            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 no-scrollbar">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`whitespace-nowrap lg:w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                                            selectedCategory === cat 
                                            ? 'bg-red-500 text-white shadow-md shadow-red-200' 
                                            : 'bg-slate-50 lg:bg-transparent text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div className="hidden lg:block mt-8">
                                <AdCard size="small" />
                            </div>
                        </div>
                    </aside>

                    <main className="flex-1">
                        <AdCard size="large" type="lucky" onOpenLuckyDraw={handleOpenWheel} />

                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-2">
                            {filteredProducts.map((product) => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product}
                                    onClick={handleProductClick}
                                />
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-slate-800">No products found</h3>
                                <p className="text-slate-500 mt-2">Try adjusting your filters or search terms</p>
                            </div>
                        )}

                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 mt-16">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    disabled={page === 1}
                                >
                                    Prev
                                </button>
                                <div className="flex gap-1">
                                    {[...Array(pagination.totalPages)].map((_, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => setPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === i + 1 ? 'bg-black text-white' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setPage(p => p + 1)} 
                                    className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                                    disabled={page === pagination.totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <SpinningWheel isOpen={wheelOpen} onClose={() => setWheelOpen(false) } randomProduct={selectedProduct} />
        </div>
    )
}


export default function Shop() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center text-slate-400 font-medium">Initializing shop...</div>}>
            <ShopContent />
        </Suspense>
    )
}