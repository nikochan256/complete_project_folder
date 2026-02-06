'use client'
import { assets } from '../assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    return (
        <div className='mx-6'>
            {/* Main Bento Grid Container */}
            <div className='max-w-7xl mx-auto my-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
                
                {/* 1. HERO SECTION: Full Width (Spans 2 columns) */}
                {/* Changed to a wide, cinematic aspect ratio */}
                <div className='md:col-span-2 relative flex flex-col md:flex-row bg-green-200 rounded-3xl overflow-hidden min-h-[400px] md:h-[450px] group'>
                    
                    {/* Text Content */}
                    <div className='flex-1 p-8 md:p-14 flex flex-col justify-center z-10'>
                        <div className='inline-flex self-start items-center gap-3 bg-green-300 text-green-600 pr-4 p-1 rounded-full text-xs font-medium'>
                            <span className='bg-green-600 px-3 py-1 rounded-full text-white text-xs'>NEWS</span> 
                            <span>Live BTC updated prices</span> 
                        </div>
                        
                        <h2 className='text-4xl md:text-6xl font-bold leading-tight my-6 bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent'>
                            Gadgets you'll love.<br/>
                            <span className='text-slate-800'>Prices you'll trust.</span>
                        </h2>
                        
                        <div className='flex items-center gap-6 mt-2'>
                            <button className='bg-slate-800 text-white text-sm py-3 px-8 rounded-full hover:bg-slate-900 transition shadow-lg'>
                                Shop Collection
                            </button>
                            <div className='text-slate-800 font-medium'>
                                <p className='text-xs uppercase tracking-wide opacity-70'>Starting at</p>
                                <p className='text-2xl font-bold'>{currency}4.90</p>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image - Positioned on the Right for Desktop, Bottom for Mobile */}
                    <div className='relative w-full md:w-1/2 h-64 md:h-full flex items-end justify-center md:justify-end'>
                        <Image 
                            className='object-contain object-bottom h-full w-auto md:pr-10 pb-0' 
                            src={assets.hero_model_img} 
                            alt="Hero Model" 
                        />
                    </div>
                </div>

                {/* 2. PROMO CARD 1 (Bottom Left) */}
                <div className='bg-orange-200 rounded-3xl p-8 min-h-[280px] flex flex-col justify-between group relative overflow-hidden transition-transform hover:scale-[1.01]'>
                    <div className='z-10'>
                        <p className='text-3xl font-semibold text-slate-800'>Best Products</p>
                        <p className='text-orange-800/80 mt-2 text-sm font-medium'>Top rated by customers</p>
                        <button className='flex items-center gap-2 mt-6 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-lg text-slate-800 text-sm font-semibold hover:bg-white/60 transition'>
                            View list <ArrowRightIcon size={16} />
                        </button>
                    </div>
                    {/* Image positioned absolutely for a 'bleed' effect */}
                    <Image 
                        className='absolute bottom-4 right-4 w-40 md:w-48 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500' 
                        src={assets.hero_product_img1} 
                        alt="Best products" 
                    />
                </div>

                {/* 3. PROMO CARD 2 (Bottom Right) */}
                <div className='bg-blue-200 rounded-3xl p-8 min-h-[280px] flex flex-col justify-between group relative overflow-hidden transition-transform hover:scale-[1.01]'>
                    <div className='z-10'>
                        <p className='text-3xl font-semibold text-slate-800'>20% Discount</p>
                        <p className='text-blue-800/80 mt-2 text-sm font-medium'>On selected headphones</p>
                        <button className='flex items-center gap-2 mt-6 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-lg text-slate-800 text-sm font-semibold hover:bg-white/60 transition'>
                            Grab Deal <ArrowRightIcon size={16} />
                        </button>
                    </div>
                    {/* Image positioned absolutely for a 'bleed' effect */}
                    <Image 
                        className='absolute bottom-4 right-4 w-40 md:w-48 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500' 
                        src={assets.hero_product_img2} 
                        alt="Discounted products" 
                    />
                </div>

            </div>
            
            <CategoriesMarquee />
        </div>
    )
}

export default Hero