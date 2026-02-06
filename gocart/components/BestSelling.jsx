'use client'
import { useEffect, useState } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { ProductDetailPage } from './ProductDets' 

const BestSelling = () => {

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showProductDetail, setShowProductDetail] = useState(false)
    const [detailProduct, setDetailProduct] = useState(null)

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
                const response = await fetch('https://dmarketplacebackend.vercel.app/user/all-products?page=1&limit=20')
                const result = await response.json()
                setProducts(result.data.products || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

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

    if (loading) {
        return (
            <div className='px-6 my-20 max-w-6xl mx-auto text-center'>
                <div className='animate-pulse'>
                    <div className='h-8 bg-gray-200 rounded w-48 mx-auto mb-4'></div>
                    <div className='h-4 bg-gray-200 rounded w-64 mx-auto mb-12'></div>
                    <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6'>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className='h-64 bg-gray-200 rounded-lg'></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Get last 4 products for Best Selling
    const bestSellingProducts = products.slice(4)
    console.log("these are the best selling products ",bestSellingProducts)

    return (
        <div>
            {showProductDetail && detailProduct && (
                <ProductDetailPage 
                    product={detailProduct} 
                    onClose={handleCloseDetail}
                    onClick={handleProductClick}
                    allProducts={products}
                />
            )}

            <div className='px-6 my-20 max-w-6xl mx-auto text-center'>
                {/* Enhanced Title Section */}
                <div className='relative inline-block mb-4'>
                    <Title 
                        title='Best Selling' 
                        description={`Showing ${bestSellingProducts.length} featured products`} 
                        href='/shop' 
                    />
                </div>
                
                {/* Products Grid */}
                <div className='mt-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6'>
                    {bestSellingProducts.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            product={product}
                            onClick={handleProductClick}
                        />
                    ))}
                </div>
                
                {bestSellingProducts.length === 0 && (
                    <div className='mt-12 text-gray-500'>
                        <p>No products available at the moment</p>
                    </div>
                )}
                
                {/* Bottom decorative line */}
                <div className='mt-16 flex items-center justify-center'>
                    <div className='h-[1px] w-full max-w-md bg-gradient-to-r from-transparent via-gray-200 to-transparent'></div>
                </div>

                <style jsx>{`
                    .relative:hover::after {
                        content: '';
                        position: absolute;
                        bottom: -4px;
                        left: 0;
                        width: 100%;
                        height: 3px;
                        background: #00C950;
                        animation: lineExpand 0.3s ease-out forwards;
                    }

                    @keyframes lineExpand {
                        from {
                            width: 0%;
                        }
                        to {
                            width: 100%;
                        }
                    }
                `}</style>
            </div>
        </div>
    )
}

export default BestSelling