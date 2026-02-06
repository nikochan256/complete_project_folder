'use client'
import { useState, useEffect } from 'react'
import Banner from "../../components/Banner";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ProductDetailPage } from "../../components/ProductDets";

export default function PublicLayout({ children }) {
    const [showProductDetail, setShowProductDetail] = useState(false)
    const [detailProduct, setDetailProduct] = useState(null)
    const [allProducts, setAllProducts] = useState([])

    // Listen for product detail events from Navbar search
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

    // Fetch products for recommendations
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('https://dmarketplacebackend.vercel.app/user/all-products?page=1&limit=20')
                const result = await response.json()
                setAllProducts(result.data.products || [])
            } catch (err) {
                console.error('Failed to fetch products:', err)
            }
        }
        fetchProducts()
    }, [])

    const handleCloseDetail = () => {
        setShowProductDetail(false)
        setDetailProduct(null)
    }

    const handleProductClick = (product) => {
        setDetailProduct(product)
        setShowProductDetail(true)
    }

    return (
        <>
            {showProductDetail && detailProduct && (
                <ProductDetailPage 
                    product={detailProduct} 
                    onClose={handleCloseDetail}
                    onClick={handleProductClick}
                    allProducts={allProducts}
                />
            )}
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}