'use client'
import Link from 'next/link'
import Image from 'next/image'

const CategoryShowcase = () => {
    const partners = [
        {
            name: 'Polygon',
            logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
            description: 'Layer 2 Scaling Solution',
            color: 'from-purple-500 to-purple-600'
        },
        {
            name: 'Chainlink',
            logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
            description: 'Decentralized Oracle Network',
            color: 'from-blue-500 to-blue-600'
        },
        {
            name: 'Ethereum',
            logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
            description: 'Smart Contract Platform',
            color: 'from-indigo-500 to-indigo-600'
        },
        {
            name: 'Solana',
            logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',
            description: 'High Performance Blockchain',
            color: 'from-violet-500 to-violet-600'
        },
        {
            name: 'Gnosis',
            logo: 'https://cryptologos.cc/logos/gnosis-gno-gno-logo.png',
            description: 'Infrastructure for Ethereum',
            color: 'from-teal-500 to-teal-600'
        },
        {
            name: 'Aave',
            logo: 'https://cryptologos.cc/logos/aave-aave-logo.png',
            description: 'DeFi Lending Protocol',
            color: 'from-pink-500 to-pink-600'
        },
        {
            name: 'Arbitrum',
            logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
            description: 'Optimistic Rollup Solution',
            color: 'from-blue-400 to-blue-500'
        },
        {
            name: 'Optimism',
            logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
            description: 'Ethereum Layer 2',
            color: 'from-red-500 to-red-600'
        }
    ]

    return (
        <div className='px-6 my-20 max-w-6xl mx-auto'>
            <div className='relative inline-block mb-4'>
                <h2 className='text-3xl font-bold text-slate-800'>Featured Web3 Partners</h2>
            </div>
            
            <div className='flex items-center gap-4 mb-12'>
                <div className='h-[2px] w-16 bg-gradient-to-r from-[#00C950] to-transparent'></div>
                <span className='text-xs text-gray-400 uppercase tracking-wider'>Powered by Blockchain</span>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {partners.map((partner, index) => (
                    <Link 
                        href={`/partner/${partner.name.toLowerCase()}`} 
                        key={index}
                        className='group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-[#00C950]'
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${partner.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                        
                        <div className='relative p-6 flex flex-col items-center text-center'>
                            {/* Logo */}
                            <div className='w-20 h-20 mb-4 relative group-hover:scale-110 transition-transform'>
                                <Image 
                                    src={partner.logo}
                                    alt={partner.name}
                                    fill
                                    className='object-contain'
                                />
                            </div>
                            
                            {/* Name */}
                            <h3 className='text-xl font-bold text-slate-800 mb-2'>
                                {partner.name}
                            </h3>
                            
                            {/* Description */}
                            <p className='text-sm text-gray-500 mb-4'>
                                {partner.description}
                            </p>
                            
                            {/* Learn More Button */}
                            <div className='mt-auto opacity-0 group-hover:opacity-100 transition-opacity'>
                                <span className='text-xs border border-[#00C950] text-[#00C950] px-4 py-1 rounded-full'>
                                    Learn More →
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className='mt-16 flex items-center justify-center'>
                <div className='h-[1px] w-full max-w-md bg-gradient-to-r from-transparent via-gray-200 to-transparent'></div>
            </div>

            <style jsx>{`
                h2:hover::after {
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
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    )
}

export default CategoryShowcase