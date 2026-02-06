'use client'
import { StarIcon } from 'lucide-react'

const CustomerReviews = () => {
    const reviews = [
        {
            name: 'Sarah Johnson',
            rating: 5,
            comment: 'Absolutely love the quality! Fast shipping and excellent customer service.',
            product: 'Wireless Headphones',
            date: '2 days ago'
        },
        {
            name: 'Mike Chen',
            rating: 5,
            comment: 'Best purchase I made this year. Highly recommend to everyone!',
            product: 'Smart Watch',
            date: '1 week ago'
        },
        {
            name: 'Emily Davis',
            rating: 4,
            comment: 'Great product overall. Exactly what I was looking for.',
            product: 'Leather Backpack',
            date: '2 weeks ago'
        }
    ]

    return (
        <div className='px-6 pt-20 my-10 max-w-6xl mx-auto'>
            <div className='relative inline-block mb-4'>
                <h2 className='text-3xl font-bold text-slate-800'>Customer Reviews</h2>
            </div>
            
            <div className='flex items-center gap-4 mb-12'>
                <div className='h-[2px] w-16 bg-gradient-to-r from-[#00C950] to-transparent'></div>
                <span className='text-xs text-gray-400 uppercase tracking-wider'>What Our Customers Say</span>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {reviews.map((review, index) => (
                    <div 
                        key={index}
                        className='bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1'
                    >
                        <div className='flex gap-1 mb-3'>
                            {Array(5).fill('').map((_, i) => (
                                <StarIcon 
                                    key={i} 
                                    size={16} 
                                    className='text-transparent' 
                                    fill={review.rating >= i + 1 ? "#FBBF24" : "#E5E7EB"} 
                                />
                            ))}
                        </div>
                        
                        <p className='text-gray-700 text-sm mb-4 leading-relaxed'>
                            "{review.comment}"
                        </p>
                        
                        <div className='pt-4 border-t border-gray-100'>
                            <p className='font-semibold text-slate-800 text-sm'>{review.name}</p>
                            <p className='text-xs text-gray-500 mt-1'>
                                {review.product} • {review.date}
                            </p>
                        </div>
                    </div>
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

export default CustomerReviews
