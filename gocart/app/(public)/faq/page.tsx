"use client"

import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      question: "What is a Web3 Crypto Commerce Platform?",
      answer: "A Web3 Crypto Commerce Platform enables users to purchase physical and digital goods using cryptocurrencies and blockchain-based payment systems. Unlike traditional e-commerce, transactions are executed on-chain, offering increased transparency, faster settlement, and reduced reliance on intermediaries such as banks or centralized payment processors."
    },
    {
      question: "How does Web3 Commerce differ from traditional E-Commerce?",
      answer: "Traditional e-commerce relies on fiat currencies, centralized payment gateways, and banking infrastructure. Web3 commerce allows crypto-native payments, decentralized settlement, token-based incentives, and global access without banking limitations. It also enables programmable incentives such as cashback, staking, and buyback mechanisms via smart contracts."
    },
    {
      question: "Where do you ship from and which regions are supported?",
      answer: "Logistics are currently supported across the following regions: United States, European Union, United Arab Emirates, and China. Shipping is handled through a combination of in-house logistics and regional fulfillment partners."
    },
    {
      question: "What are the delivery times?",
      answer: "Delivery times vary by product category and destination:\n\nWeb3 Merchandise: Approx. 3-5 business days\n\nBranded Products (e.g. Apple, Prada):\n• Europe: Within 48 hours\n• United States: Approx. 3 business days\n• UAE & China: Approx. 1-2 weeks\n\nAll deliveries are currently managed in-house to ensure quality and reliability."
    },
    {
      question: "What products are available on the platform?",
      answer: "The product portfolio marketplace includes:\n\n• Web3 Merchandise (Apparel, accessories, collectibles)\n• Branded Products (e.g. Apple iPhones, and other premium brands)\n• Digital Gift Cards\n\nNOTE: The portfolio is continuously expanding based on demand and partnerships."
    },
    {
      question: "Why are prices displayed in $BTC?",
      answer: "All product prices are displayed in $BTC (Bitcoin Standard) to provide a consistent and globally recognized crypto reference. BTC exchange rates are updated every minute. The displayed price is secured for 30 minutes during checkout to protect users from short-term volatility."
    },
    {
      question: "What are the benefits of using $DMP as a payment method?",
      answer: "Using $DMP provides multiple advantages:\n\n• 2% cashback on purchases\n• Access to exclusive limited products and drops\n• Access to discounts and newsletters\n• Buyback program funded through platform revenue\n\nUpcoming feature: Token staking and additional utility integrations through smart contract."
    },
    {
      question: "How do merchants receive payments?",
      answer: "Merchants receive fiat settlements via Stripe, ensuring compliance and ease of accounting. Stripe handles standard dispute management. A decentralized solution with a smart fraud engine is currently under development to further enhance transparency and efficiency."
    },
    {
      question: "How are refunds handled?",
      answer: "If a product refund is approved, the original product price (calculated in USD) will be refunded in USDT. Refunds are sent directly to the wallet address provided by the customer within 2-5 business days. This approach ensures fast and borderless reimbursement."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600">
            Everything you need to know about our Web3 Crypto Commerce Platform
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="space-y-2">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900 pr-8">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 border-t border-gray-100">
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed pt-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No questions found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="border border-gray-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you with any inquiries.
          </p>
          <p className="px-6 py-3 bg-gray-900 w-fit mx-auto hover:bg-gray-800 text-white font-medium rounded-lg transition-colors">
            Mail at DMarketplace@mail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;