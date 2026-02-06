
'use client'
import Link from 'next/link'
import Image from 'next/image'

const FeaturedBanner = () => {
    return (
        <div className='px-6  my-10 max-w-6xl mx-auto'>
            <div className='relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 sm:p-12 lg:p-16'>
                <div className='relative z-10 max-w-2xl'>
                    <div className='inline-block mb-4'>
                        <span className='bg-[#00C950] text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider'>
                            Limited Offer
                        </span>
                    </div>
                    
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight'>
                        Summer Sale
                        <br />
                        Up to 50% Off
                    </h2>
                    
                    <p className='text-gray-300 text-base sm:text-lg mb-8 max-w-xl'>
                        Get amazing deals on selected items. Limited time offer on premium products.
                    </p>
                    
                    <Link 
                        href='/shop' 
                        className='inline-flex items-center gap-2 bg-[#00C950] hover:bg-[#00B045] text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg'
                    >
                        Shop Now
                        <span>→</span>
                    </Link>
                </div>
                
                <div className='absolute right-0 top-0 bottom-0 w-1/2 opacity-10'>
                    <div className='absolute inset-0 bg-gradient-to-l from-transparent to-slate-900'></div>
                </div>
            </div>
        </div>
    )
}

export default FeaturedBanner

