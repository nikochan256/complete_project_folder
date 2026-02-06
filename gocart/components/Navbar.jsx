'use client'
import { ChevronsLeftRightEllipsis, Search, ShoppingCart, Wallet, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
// import { useSelector } from "react-redux";
import img from "../assets/logo.png"

const Navbar = () => {

    const router = useRouter();

    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [walletAddress, setWalletAddress] = useState('')
    const [isConnecting, setIsConnecting] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [error, setError] = useState('')
    // const cartCount = useSelector(state => state.cart.total)
    
    const searchRef = useRef(null)
    const debounceTimerRef = useRef(null)

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Listen for account changes
    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('accountsChanged', handleAccountsChanged)
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
            }
        }
    }, [])

    // Debounced search effect
    useEffect(() => {
        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Don't search if query is empty or too short
        if (!search || search.trim().length < 2) {
            setSearchResults([])
            setShowDropdown(false)
            return
        }

        // Set new timer for debounced search
        debounceTimerRef.current = setTimeout(() => {
            searchProducts(search)
        }, 500) // 500ms debounce delay

        // Cleanup timer on unmount or when search changes
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [search])

    const searchProducts = async (query) => {
        try {
            setIsSearching(true)
            
            // Fetch all merchants with products
            const response = await fetch('https://dmarketplacebackend.vercel.app/merchant/all-merchants-products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
            })
            
            if (!response.ok) {
                throw new Error('Failed to fetch products')
            }
    
            const result = await response.json()
            const merchantsData = result.data || []
    
            // Search through all products from all merchants
            const foundProducts = []
            
            merchantsData.forEach(({ merchant, products }) => {
                if (products && Array.isArray(products)) {
                    products.forEach(product => {
                        // Case-insensitive search in product name AND category
                        const searchLower = query.toLowerCase()
                        const matchesName = product.name && product.name.toLowerCase().includes(searchLower)
                        const matchesCategory = product.category && product.category.toLowerCase().includes(searchLower)
                        
                        if (matchesName || matchesCategory) {
                            foundProducts.push({
                                ...product,
                                thumbnail_url: product.image1,
                                merchantName: merchant.shopName,
                                store_id: merchant.store_id
                            })
                        }
                    })
                }
            })
    
            setSearchResults(foundProducts.slice(0, 8))
            setShowDropdown(true)
        } catch (err) {
            console.error('Search error:', err)
            setSearchResults([])
            setShowDropdown(false)
        } finally {
            setIsSearching(false)
        }
    }
    const handleProductClick = (product) => {
        // Format the product data to match ProductDetailPage expectations
        const formattedProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            image1: product.thumbnail_url,
            image2: product.image2,
            image3: product.image3,
            description: product.description,
            seller: {
                shopName: product.merchantName,
                store_id: product.store_id,
                logoImg: product.sellerLogo,
                isApproved: product.isApproved,
                kybStatus: product.kybStatus
            }
        };
        
        // Dispatch event to open product detail
        window.dispatchEvent(
            new CustomEvent('openProductDetail', {
                detail: { product: formattedProduct }
            })
        );
        
        setShowDropdown(false);
        setSearch('');
        setSearchResults([]);
    };

    const registerUser = async (walletAddress) => {
        try {
            // const response = await fetch("https://dmarketplacebackend.vercel.app/user/register", {
            const response = await fetch("https://dmarketplacebackend.vercel.app/user/register", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ walletAddress })
            });
            localStorage.setItem("DmarketPlacewalletAddress" , walletAddress)
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
    
            const data = await response.json();
            localStorage.setItem("dmarketplaceUserId" , data.data.id)
            setIsLogin(true);
            return data;
        } catch (err) {
            console.error(err);
            setError(`Failed to register user: ${err.message}`);
            throw err;
        }
    };
    
    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            setWalletAddress('')
        } else {
            try{
                const data = { walletAddress: accounts[0] } ; 
                fetch("https://dmarketplacebackend.vercel.app/user/register", {
                    method:"POST", 
                    headers:{
                        'Content-Type': 'application/json',
                    },
                    body:JSON.stringify(data)
                })
                .then(respons=>{
                    if(!respons.ok){
                        setError("http error" , respons.status)
                        throw new error("http error, ",respons.status)
                    }
                    return respons.json()
                })
                .then(data=>{
                    setIsLogin(true)
                })
                .catch(err=>{
                    setError("error found" , err)
                })

                setWalletAddress(accounts[0])

            }catch(err){
                setError('user not created.')
                throw err("user account not created")
            }
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (search.trim()) {
            router.push(`/shop?search=${search}`)
            setShowDropdown(false)
        }
    }

    const handleLoginClick = async () => {
        setIsConnecting(true)
        setError('')

        try {
            if (typeof window.ethereum === 'undefined') {
                setError('MetaMask is not installed! Please install MetaMask browser extension.')
                setIsConnecting(false)
                window.open('https://metamask.io/download/', '_blank')
                return
            }

            let provider = window.ethereum

            if (window.ethereum.providers) {
                provider = window.ethereum.providers.find(p => p.isMetaMask)
                if (!provider) {
                    setError('MetaMask not found. Please make sure MetaMask is installed.')
                    setIsConnecting(false)
                    return
                }
            } else if (!window.ethereum.isMetaMask) {
                setError('Please use MetaMask wallet. Other wallets are not supported.')
                setIsConnecting(false)
                return
            }

            try {
                await provider.request({
                    method: 'wallet_revokePermissions',
                    params: [{
                        eth_accounts: {}
                    }]
                })
            } catch (revokeErr) {
            }

            const accounts = await provider.request({ 
                method: 'eth_requestAccounts' 
            })

            if (accounts && accounts.length > 0) {
                await registerUser(accounts[0])
                setWalletAddress(accounts[0])
                ('Connected MetaMask wallet:', accounts[0])
            }
        } catch (err) {
            console.error('Error connecting to MetaMask:', err)
            if (err.code === 4001) {
                setError('You rejected the connection request. Please try again and approve in MetaMask.')
            } else if (err.code === -32002) {
                setError('Connection request already pending. Please check your MetaMask extension.')
            } else {
                setError('Failed to connect to MetaMask. Please try again.')
            }
        } finally {
            setIsConnecting(false)
        }
    }

    const handleDisconnect = () => {
        setWalletAddress('')
    }

    const truncateAddress = (address) => {
        if (!address) return ''
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="relative flex items-center">
                        <Image 
                            src={img}
                            alt="DMarketplace Logo"
                            width={180}
                            height={60}
                            className="h-12 scale-150 sm:scale-300 w-auto"
                            priority
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        
                        <Link href="/" className="group relative py-1 pb-2">
                            <span>Home</span>
                            <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        
                        <Link href="/shop" className="group relative py-1 pb-2">
                            <span>Shop</span>
                            <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        
                        <Link href="/about" className="group relative py-1 pb-2">
                            <span>About</span>
                            <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        
                        <Link href="/contact_us" className="group relative py-1 pb-2">
                            <span>Contact</span>
                            <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        {/* Search with Dropdown */}
                        <div ref={searchRef} className="hidden xl:block relative">
                            <form onSubmit={handleSearch} className="flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                                {isSearching ? (
                                    <Loader2 size={18} className="text-slate-600 animate-spin" />
                                ) : (
                                    <Search size={18} className="text-slate-600" />
                                )}
                                <input 
                                    className="w-full bg-transparent outline-none placeholder-slate-600" 
                                    type="text" 
                                    placeholder="Search products" 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)}
                                    onFocus={() => search.length >= 2 && setShowDropdown(true)}
                                />
                            </form>

                            {/* Search Dropdown */}
                            {showDropdown && (
                                <div className="absolute top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 max-h-96 overflow-y-auto z-50">
                                    {searchResults.length > 0 ? (
                                        <>
                                            <div className="p-2">
                                                <div className="text-xs text-slate-500 px-3 py-2 font-medium">
                                                    Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
                                                </div>
                                                {searchResults.map((product) => (
    <button
        key={`${product.store_id}-${product.id}`}
        onClick={() => handleProductClick(product)}
        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
    >
        <img 
            src={product.thumbnail_url} 
            alt={product.name}
            className="w-12 h-12 object-cover rounded-md border border-slate-200"
            onError={(e) => {
                e.target.src = 'https://via.placeholder.com/48'
            }}
        />
        <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">
                {product.name}
            </div>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 truncate">
                    {product.merchantName}
                </span>
                {/* ADD THIS - Show category badge */}
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {product.category}
                </span>
            </div>
        </div>
    </button>
))}
                                            </div>
                                            
                                            {searchResults.length === 8 && (
                                                <div className="border-t border-slate-200 p-3">
                                                    <button
                                                        onClick={handleSearch}
                                                        className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        View all results →
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Search size={48} className="mx-auto text-slate-300 mb-3" />
                                            <p className="text-sm text-slate-600 font-medium mb-1">No matches found</p>
                                            <p className="text-xs text-slate-500">Try searching with different keywords</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600 py-1 pb-2 group/cart">
                            <ShoppingCart size={18} className="transition-transform group-hover/cart:scale-110 group-active/cart:scale-95" />
                            <span className="transition-colors group-hover/cart:text-slate-900">Cart</span>
                            <span className="absolute -top-[5px] left-3 text-[12px] text-white bg-slate-600 w-[14px] h-[14px] flex justify-center items-center rounded-full transition-transform group-hover/cart:scale-110 group-active/cart:scale-90">
                                +
                            </span>
                        </Link>

                        {!walletAddress ? (
                            <button 
                                onClick={handleLoginClick}
                                disabled={isConnecting}
                                className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 transition text-white rounded-full flex items-center gap-2"
                            >
                                {isConnecting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Connecting...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                                    <Wallet size={16} />
                                    {truncateAddress(walletAddress)}
                                </div>
                                <button 
                                    onClick={handleDisconnect}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 transition text-white rounded-full text-sm"
                                >
                                    Disconnect
                                </button>
                            </div>
                        )}

                    </div>

                    {/* Mobile User Button */}
                    <div className="sm:hidden">
                        {!walletAddress ? (
                            <button 
                                onClick={handleLoginClick}
                                disabled={isConnecting}
                                className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-sm transition text-white rounded-full"
                            >
                                {isConnecting ? 'Connecting...' : 'Login'}
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                    <Wallet size={14} />
                                    {truncateAddress(walletAddress)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
            
            {error && (
                <div className="fixed top-4 right-4 z-50 max-w-md">
                    <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-start gap-3">
                        <div className="flex-1">
                            <p className="font-medium mb-1">Connection Error</p>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                        <button 
                            onClick={() => setError('')}
                            className="text-white hover:text-gray-200"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </nav>
    ) 
}

export default Navbar