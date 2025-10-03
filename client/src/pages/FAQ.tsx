import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Mail, Phone } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'What is Kalakari?',
    answer: 'Kalakari is an e-commerce platform that connects customers with local artisans and their handcrafted products. We showcase traditional Indian craftsmanship and provide a marketplace for authentic, handmade items.',
    category: 'general'
  },
  {
    id: '2',
    question: 'How do I place an order?',
    answer: 'To place an order, browse our products, add items to your cart, and proceed to checkout. You can pay using various methods including credit/debit cards, UPI, net banking, or cash on delivery.',
    category: 'orders'
  },
  {
    id: '3',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI payments (Google Pay, PhonePe, Paytm), net banking, and cash on delivery for orders above ₹500.',
    category: 'payment'
  },
  {
    id: '4',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3-7 business days within India. Express shipping (1-2 days) is available for select locations. International shipping takes 7-14 business days.',
    category: 'shipping'
  },
  {
    id: '5',
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to most countries worldwide. International shipping charges and delivery times vary by destination. Please check the shipping calculator during checkout.',
    category: 'shipping'
  },
  {
    id: '6',
    question: 'What is your return policy?',
    answer: 'We offer a 7-day return policy for most items. Products must be in original condition with tags attached. Custom or personalized items are not eligible for returns.',
    category: 'returns'
  },
  {
    id: '7',
    question: 'How do I track my order?',
    answer: 'Once your order ships, you\'ll receive a tracking number via email and SMS. You can track your package using the tracking number on our website or the courier company\'s website.',
    category: 'orders'
  },
  {
    id: '8',
    question: 'Can I cancel my order?',
    answer: 'You can cancel your order within 24 hours of placing it, provided it hasn\'t been shipped yet. For orders that have already shipped, you can return the items once received.',
    category: 'orders'
  },
  {
    id: '9',
    question: 'Are the products authentic and handmade?',
    answer: 'Yes, all products on Kalakari are authentic and handmade by verified artisans. We work directly with artisans and cooperatives to ensure quality and authenticity.',
    category: 'products'
  },
  {
    id: '10',
    question: 'How do I become an artisan on Kalakari?',
    answer: 'To become an artisan, register on our platform and submit your artisan profile with samples of your work. Our team will review your application and get back to you within 5-7 business days.',
    category: 'artisan'
  },
  {
    id: '11',
    question: 'Do you offer wholesale prices?',
    answer: 'Yes, we offer wholesale prices for bulk orders. Please contact our sales team with your requirements, and we\'ll provide you with a customized quote.',
    category: 'wholesale'
  },
  {
    id: '12',
    question: 'How do I contact customer support?',
    answer: 'You can reach our customer support team via email at support@kalakari.com, phone at +91-9876543210, or through our contact form. We\'re available Monday-Friday, 9 AM-6 PM.',
    category: 'support'
  },
  {
    id: '13',
    question: 'What if I receive a damaged product?',
    answer: 'If you receive a damaged product, please contact us immediately with photos of the damage. We\'ll arrange for a replacement or full refund at no extra cost to you.',
    category: 'returns'
  },
  {
    id: '14',
    question: 'Do you have a mobile app?',
    answer: 'Yes, our mobile app is available for both iOS and Android devices. You can download it from the App Store or Google Play Store for a better shopping experience.',
    category: 'general'
  },
  {
    id: '15',
    question: 'How do I update my account information?',
    answer: 'You can update your account information by logging into your account and going to the Profile section. You can change your personal details, address, and preferences there.',
    category: 'account'
  }
];

const categories = [
  { id: 'all', name: 'All Questions' },
  { id: 'general', name: 'General' },
  { id: 'orders', name: 'Orders' },
  { id: 'payment', name: 'Payment' },
  { id: 'shipping', name: 'Shipping' },
  { id: 'returns', name: 'Returns' },
  { id: 'products', name: 'Products' },
  { id: 'artisan', name: 'Artisan' },
  { id: 'wholesale', name: 'Wholesale' },
  { id: 'support', name: 'Support' },
  { id: 'account', name: 'Account' }
];

const FAQ: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-primary-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our platform, products, and services.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                {openItems.includes(faq.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openItems.includes(faq.id) && (
                <div className="px-6 pb-4">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600">Try selecting a different category or contact us directly.</p>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>Contact Us</span>
            </a>
            
            <a
              href="tel:+919876543210"
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Call Support</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Order Support</h3>
            <p className="text-gray-600 text-sm mb-4">
              Need help with your order? Track, cancel, or return items.
            </p>
            <a href="/orders" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View Orders →
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Shipping Info</h3>
            <p className="text-gray-600 text-sm mb-4">
              Learn about our shipping policies and delivery times.
            </p>
            <a href="/shipping" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Shipping Details →
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Artisan Program</h3>
            <p className="text-gray-600 text-sm mb-4">
              Interested in selling your crafts? Join our artisan community.
            </p>
            <a href="/artisan/register" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Become an Artisan →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
