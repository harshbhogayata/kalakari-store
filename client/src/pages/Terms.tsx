import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-base py-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-brand-ink mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Kalakari.shop ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">2. Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of Kalakari.shop for personal, non-commercial transitory viewing only.
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>This is the grant of a license, not a transfer of title</li>
              <li>You may not modify or copy the materials</li>
              <li>You may not use the materials for any commercial purpose</li>
              <li>You may not attempt to reverse engineer any software contained within</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">3. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times.
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>You are responsible for safeguarding the password</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You agree not to share your account credentials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">4. Products and Orders</h2>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>All products are handcrafted and unique</li>
              <li>Product images may vary slightly from actual items</li>
              <li>Orders are processed within 2-3 business days</li>
              <li>Custom orders may take longer</li>
              <li>Shipping times vary by location</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">5. Payment and Pricing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Payment is processed securely through our payment gateway partners. All prices are in Indian Rupees (INR) unless otherwise stated.
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>Prices may change without notice</li>
              <li>Taxes are calculated based on your location</li>
              <li>We accept major credit/debit cards and UPI</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">6. Returns and Refunds</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We offer a 15-day return policy for most items. Items must be in original condition.
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>Returns must be initiated within 15 days of delivery</li>
              <li>Custom orders are generally non-returnable</li>
              <li>Refunds are processed within 7-10 business days</li>
              <li>Shipping charges are non-refundable for returns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">7. Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed">
              The materials on Kalakari.shop are provided on an 'as is' basis. Kalakari.shop makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">8. Contact & Support</h2>
            <p className="text-gray-700 leading-relaxed">
              For any questions regarding these Terms and Conditions, please contact us at:
            </p>
            <div className="bg-brand-stone/50 p-4 rounded-lg mt-4">
              <p className="text-gray-700"><strong>Email:</strong> support@kalakari.shop</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91 98765 43210</p>
              <p className="text-gray-700"><strong>Address:</strong> 123 Artisan Street, Mumbai - 400001</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
