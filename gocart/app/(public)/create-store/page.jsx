'use client'
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "../../../components/Loading"
import { Store, Upload, FileText, CheckCircle2, X } from "lucide-react"

export default function CreateStore() {

    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [btcRate, setBtcRate] = useState(null)
    const [btcLoading, setBtcLoading] = useState(true)
    const [addingToCart, setAddingToCart] = useState(false)

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        walletAddress: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: null,        // ✅ Changed from "" to null
        kybDocument: null   // ✅ Changed from "" to null
    })
    
    
    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    // Fetch BTC price from API
    const fetchBtcRate = async () => {
        try {
            setBtcLoading(true)
            
            const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD')
            const data = await response.json()
            
            if (data && data.data && data.data.rates && data.data.rates.BTC) {
                const usdToBtc = parseFloat(data.data.rates.BTC)
                setBtcRate(usdToBtc)
            } else {
                throw new Error('Invalid BTC rate response')
            }
        } catch (error) {
            console.error('❌ Error fetching BTC rate:', error)
            toast.error('Failed to fetch BTC exchange rate')
            // Fallback rate
            setBtcRate(0.000011)
        } finally {
            setBtcLoading(false)
        }
    }

    // Convert USD to BTC
    const convertToBtc = (usdAmount) => {
        if (!btcRate || btcLoading) return '...'
        const btcAmount = usdAmount * btcRate
        return btcAmount.toFixed(8) // 8 decimal places for BTC
    }

    // Format BTC with symbol
    const formatBtc = (usdAmount) => {
        return `₿${convertToBtc(usdAmount)}`
    }

    const fetchSellerStatus = async () => {
        // Logic to check if the store is already submitted
        setTimeout(() => {
            setLoading(false)
        }, 500) 
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
      
        
        setAddingToCart(true)
        
        try {
            // Validation
            if (!storeInfo.image) {
                console.error('❌ No store logo uploaded')
                toast.error("Please upload a store logo")
                setAddingToCart(false)  // ✅ Added
                return
            }
            if (!storeInfo.kybDocument) {
                console.error('❌ No KYB document uploaded')
                toast.error("Please upload KYB document")
                setAddingToCart(false)  // ✅ Added
                return
            }
        
            // File size validation (5MB)
            const maxSize = 5 * 1024 * 1024

            if (storeInfo.image.size > maxSize) {
                toast.error("Logo image must be less than 5MB")
                setAddingToCart(false)  // ✅ Added
                return
            }
            if (storeInfo.kybDocument.size > maxSize) {
                toast.error("KYB document must be less than 5MB")
                setAddingToCart(false)  // ✅ Added
                return
            }
        
            const formData = new FormData()
            formData.append("image", storeInfo.image)
            formData.append("kybDocument", storeInfo.kybDocument)
            formData.append("shopName", storeInfo.name)
            formData.append("walletAddress", storeInfo.walletAddress)
            formData.append("businessEmail", storeInfo.email)
            formData.append("description", storeInfo.description)
            formData.append("contact", storeInfo.contact)
            formData.append("address", storeInfo.address)
    
          
            // ✅ Log FormData contents for debugging
            for (let pair of formData.entries()) {
            }
        
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dmarketplacebackend.vercel.app"
            // const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        
            toast.loading("Submitting application...")
            
            const response = await fetch(`${API_URL}/merchant/create-store`, {  // ✅ Use API_URL variable
                method: "POST",
                body: formData
            })
        
            const data = await response.json()
        
            if (!response.ok) {
                toast.dismiss()
                toast.error(data.msg || "Failed to submit application")
                return
            }
          
            // Success
    
            toast.dismiss()
            toast.success("Application submitted!")
    
            setAlreadySubmitted(true)
            setStatus("pending")
            setMessage(data.msg || "Your application has been submitted successfully!")
            
            return data
        } catch (error) {
            console.error("❌ Submission error:", error)
            toast.dismiss()
            toast.error(error.message || "Error submitting application")
        } finally {
            setAddingToCart(false)
        }
    }

    
    useEffect(() => {
        fetchSellerStatus()
        fetchBtcRate()
        
        // Refresh BTC rate every 60 seconds
        const interval = setInterval(() => {
            fetchBtcRate()
        }, 60000)
        
        return () => clearInterval(interval)
    }, [])

    return !loading ? (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            {/* BTC Rate Display */}
            {btcLoading ? (
                <div className="fixed top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    <span className="text-sm text-slate-600">Loading BTC rate...</span>
                </div>
            ) : (
                <div className="fixed top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md border border-slate-200">
                    <span className="text-sm text-slate-600">1 USD = </span>
                    <span className="text-sm font-bold text-orange-600">₿{btcRate?.toFixed(8)}</span>
                </div>
            )}

            {!alreadySubmitted ? (
                <div className="max-w-3xl w-full mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                            Add Your <span className="text-indigo-600">Store</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Complete the form below to launch your business on GoCart.
                        </p>
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-white py-10 px-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
                        <form onSubmit={onSubmitHandler} className="flex flex-col gap-8">
                            
                            {/* Logo Upload Section */}
                            <div className="flex flex-col items-center sm:flex-row gap-8 pb-8 border-b border-slate-100">
                                <div className="relative w-32 h-32 rounded-full bg-slate-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                                    {storeInfo.image ? (
                                        <Image 
                                            src={URL.createObjectURL(storeInfo.image)} 
                                            alt="Preview" 
                                            fill 
                                            className="object-cover" 
                                        />
                                    ) : (
                                        <Store className="w-10 h-10 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-3 text-center sm:text-left">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">Store Logo</h3>
                                        <p className="text-sm text-slate-500">Upload your brand logo. Recommended size: 400x400px.</p>
                                    </div>
                                    <label className="cursor-pointer inline-flex justify-center sm:justify-start items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition active:scale-95 w-fit mx-auto sm:mx-0">
                                        <Upload className="w-4 h-4" />
                                        Upload Image
                                        <input type="file" accept="image/*" onChange={(e) => {
                                            setStoreInfo({ ...storeInfo, image: e.target.files[0] })
                                        }} hidden />
                                    </label>
                                </div>
                            </div>

                            {/* Inputs Section */}
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Store Name <span className="text-red-500">*</span></label>
                                        <input 
                                            name="name" 
                                            required
                                            onChange={onChangeHandler} 
                                            value={storeInfo.name} 
                                            type="text" 
                                            placeholder="e.g. The Fashion Hub" 
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-slate-50/50 focus:bg-white" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Wallet Address <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input 
                                                name="walletAddress"
                                                required 
                                                onChange={onChangeHandler} 
                                                value={storeInfo.walletAddress} 
                                                type="text" 
                                                placeholder="0x..." 
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-slate-50/50 focus:bg-white font-medium text-slate-600" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Description</label>
                                    <textarea 
                                        name="description" 
                                        onChange={onChangeHandler} 
                                        value={storeInfo.description} 
                                        rows={4} 
                                        placeholder="Tell us about your store..." 
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none bg-slate-50/50 focus:bg-white" 
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Business Email <span className="text-red-500">*</span></label>
                                        <input 
                                            name="email" 
                                            required
                                            onChange={onChangeHandler} 
                                            value={storeInfo.email} 
                                            type="email" 
                                            placeholder="contact@mystore.com" 
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-slate-50/50 focus:bg-white" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Contact Number <span className="text-red-500">*</span></label>
                                        <input 
                                            name="contact"
                                            required 
                                            onChange={onChangeHandler} 
                                            value={storeInfo.contact} 
                                            type="text" 
                                            placeholder="+1 (555) 000-0000" 
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-slate-50/50 focus:bg-white" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Business Address</label>
                                    <textarea 
                                        name="address" 
                                        onChange={onChangeHandler} 
                                        value={storeInfo.address} 
                                        rows={3} 
                                        placeholder="Full registered business address" 
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none bg-slate-50/50 focus:bg-white" 
                                    />
                                </div>
                            </div>

                            {/* KYB Section */}
                            <div className="pt-4 border-t border-slate-100">
                                <div className="mb-4">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        Business Verification (KYB) <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-sm text-slate-500 mt-1">Upload a valid business registration or tax document.</p>
                                </div>
                                
                                <label className={`flex flex-col items-center justify-center w-full px-4 py-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${storeInfo.kybDocument ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-slate-50 hover:bg-white hover:border-indigo-400 text-slate-500'}`}>
                                    {storeInfo.kybDocument ? (
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-8 h-8" />
                                            <div className="text-left">
                                                <p className="text-base font-semibold">Document Selected</p>
                                                <p className="text-xs opacity-80 truncate max-w-[200px]">{storeInfo.kybDocument.name}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <Upload className="w-8 h-8 mb-2 opacity-50" />
                                            <p className="text-base font-medium">Click to upload document</p>
                                            <p className="text-xs opacity-70">PDF, PNG, JPG (Max 5MB)</p>
                                        </div>
                                    )}
                                    <input type="file" required accept=".pdf,image/*" onChange={(e) => {
                                        setStoreInfo({ ...storeInfo, kybDocument: e.target.files[0] })
                                    }} hidden />
                                </label>
                            </div>

                            <button 
                                type="submit"
                                disabled={addingToCart}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-lg shadow-indigo-900/10 hover:shadow-indigo-600/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {addingToCart ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="max-w-lg mx-auto bg-white p-12 rounded-2xl shadow-xl text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Submission Received!</h2>
                    <p className="text-lg text-slate-500 mb-8">{message}</p>
                    {status === "approved" && (
                        <div className="bg-slate-50 py-3 px-6 rounded-full inline-block">
                            <p className="text-slate-500 text-sm">Redirecting in <span className="font-bold text-slate-800">5 seconds...</span></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    ) : (<Loading />)
}