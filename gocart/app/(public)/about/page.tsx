"use client"
import React from 'react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">
            About Us
          </h1>
          <p className="text-gray-600">
            Building the future of commerce with blockchain technology
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-12">
          {/* What We Do */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What We Do
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We're a Web3 Crypto Commerce Platform that enables users to purchase physical and digital goods using cryptocurrencies and blockchain-based payment systems.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Unlike traditional e-commerce, our transactions are executed on-chain, offering increased transparency, faster settlement, and reduced reliance on intermediaries such as banks or centralized payment processors.
            </p>
          </section>

          {/* Our Approach */}
          <section className="border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Our Approach
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Traditional e-commerce relies on fiat currencies, centralized payment gateways, and banking infrastructure. We've built a platform that allows crypto-native payments, decentralized settlement, and global access without banking limitations.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our platform enables programmable incentives such as cashback, staking, and buyback mechanisms via smart contracts, creating a new paradigm for digital commerce.
            </p>
          </section>

          {/* Global Reach */}
          <section className="border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Global Reach
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We currently support logistics across the following regions:
            </p>
            <ul className="space-y-2">
              <li className="text-gray-600 pl-4 border-l-2 border-gray-200">United States</li>
              <li className="text-gray-600 pl-4 border-l-2 border-gray-200">European Union</li>
              <li className="text-gray-600 pl-4 border-l-2 border-gray-200">United Arab Emirates</li>
              <li className="text-gray-600 pl-4 border-l-2 border-gray-200">China</li>
            </ul>
          </section>

          {/* Product Portfolio */}
          <section className="border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Product Portfolio
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Our marketplace includes a diverse range of products:
            </p>
            <ul className="space-y-2">
              <li className="text-gray-600 pl-4 border-l-2 border-gray-200">Web3 Merchandise (Apparel, accessories, collectibles)</li>
              <li className="text-gray-600 pl-4 border-l-2 border-gray-200">Branded Products (Apple iPhones and other premium brands)</li>
              <li className="text-gray-600 pl-4 border-l-2 border-gray-200">Digital Gift Cards</li>
            </ul>
            <p className="text-gray-500 text-sm mt-4">
              Our portfolio is continuously expanding based on demand and partnerships.
            </p>
          </section>
        </div>
      </div>

      {/* Footer CTA */}
     
    </div>
  );
};

export default AboutPage;