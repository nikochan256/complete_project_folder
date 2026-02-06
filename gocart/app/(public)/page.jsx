'use client'
// import BestSelling from "@/components/BestSelling";
import Hero from "../../components/Hero";
import Newsletter from "../../components/Newsletter";
import OurSpecs from "../../components/OurSpec";
import LatestProducts from "../../components/LatestProducts" 
import CategoryShowcase from "../../components/CategoryShowcase";
import FeaturedBanner from "../../components/FeaturedBanner";
import CustomerReviews from "../../components/CustomerReviews";

export default function Home() {
    return (
        <div>
            <Hero />
            <LatestProducts />
            <CategoryShowcase />
            <FeaturedBanner />
            <CustomerReviews />
            <OurSpecs />
            <Newsletter />
        </div>
    );
}

