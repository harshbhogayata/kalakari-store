import React from 'react';
import { Truck, Clock, Shield, Gift } from 'lucide-react';

const Shipping: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-base py-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-brand-ink mb-8 text-center">Shipping Information</h1>
        
        <div className="prose prose-lg max-w-none">
          {/* Main Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-brand-clay/10 p-3 rounded-lg mr-4">
                  <Truck className="w-6 h-6 text-brand-clay" />
                </div>
                <h2 className="text-xl font-serif text-brand-ink">Fast Delivery</h2>
              </div>
              <p className="text-gray-700">We ship across India within 5-10 business days. Express delivery available in major cities.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-brand-clay/10 p-3 rounded-lg mr-4">
                  <Shield className="w-6 h-6 text-brand-clay" />
                </div>
                <h2 className="text-xl font-serif text-brand-ink">Secure Packaging</h2>
              </div>
              <p className="text-gray-700">All fragile items are carefully packaged with protective materials to ensure safe delivery.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-brand-clay/10 p-3 rounded-lg mr-4">
                  <Clock className="w-6 h-6 text-brand-clay" />
                </div>
                <h2 className="text-xl font-serif text-brand-ink">Free Shipping</h2>
              </div>
              <p className="text-gray-700">Enjoy free shipping on orders above ₹1,500. No hidden charges or surprises.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-brand-clay/10 p-3 rounded-lg mr-4">
                  <Gift className="w-6 h-6 text-brand-clay" />
                </div>
                <h2 className="text-xl font-serif text-brand-ink">Gift Wrapping</h2>
              </div>
              <p className="text-gray-700">Special gift wrapping available for memorable occasions. Perfect for festivals and celebrations.</p>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">Shipping Zones & Delivery Timeframes</h2>
            
            <div className="overflow-hidden rounded-lg shadow-lg mb-6">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-brand-stone/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cities</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Express</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Metro Cities</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune</td>
                    <td className="px-6 py-4 text-sm text-gray-500">3-5 days</td>
                    <td className="px-6 py-4 text-sm text-gray-500">1-2 days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tier 1 Cities</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Ahmedabad, Kolkata, Jaipur, Kochi, Chandigarh</td>
                    <td className="px-6 py-4 text-sm text-gray-500">5-7 days</td>
                    <td className="px-6 py-4 text-sm text-gray-500">2-3 days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Other Cities</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Rest of India</td>
                    <td className="px-6 py-4 text-sm text-gray-500">7-10 days</td>
                    <td className="px-6 py-4 text-sm text-gray-500">3-5 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">Shipping Charges</h2>
            
            <div className="bg-brand-stone/50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-brand-ink mb-3">Free Shipping Eligibility</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Orders above ₹1,500 - <span className="font-semibold">FREE</span></li>
                <li>Orders above ₹500 - Flat ₹99 shipping</li>
                <li>Orders below ₹500 - ₹149 shipping</li>
                <li>Express delivery - Additional ₹200 (available for metro cities only)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">Special Handling</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-brand-clay pl-4">
                <h3 className="font-semibold text-brand-ink">Fragile Items</h3>
                <p className="text-gray-700">Pottery, ceramics, and glass items are wrapped with extra protective material.</p>
              </div>
              
              <div className="border-l-4 border-brand-gold pl-4">
                <h3 className="font-semibold text-brand-ink">Textile Items</h3>
                <p className="text-gray-700">Silk sarees and delicate fabrics are shipped in premium packaging to prevent damage.</p>
              </div>
              
              <div className="border-l-4 border-brand-clay-dark pl-4">
                <h3 className="font-semibold text-brand-ink">Heavy Items</h3>
                <p className="text-gray-700">Furniture and heavy stone items need special shipping arrangements.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">Order Processing</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="bg-brand-clay text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-brand-ink">Order Confirmation</h3>
                  <p className="text-gray-700">You'll receive an email confirmation within 24 hours.</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div className="bg-brand-clay text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-brand-ink">Processing</h3>
                  <p className="text-gray-700">Your order is prepared with care (1-2 business days).</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div className="bg-brand-clay text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-brand-ink">Handover</h3>
                  <p className="text-gray-700">Items are handed over to our shipping partners.</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div className="bg-brand-clay text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-brand-ink">Delivery</h3>
                  <p className="text-gray-700">You'll receive SMS updates and tracking information.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">Return Shipping</h2>
            <p className="text-gray-700 leading-relaxed">
              If you need to return an item, we'll arrange a pick-up service for your convenience. 
              Customers are responsible for return shipping charges for non-defective items. 
              We provide free return shipping for defective or damaged items.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">International Shipping</h2>
            <p className="text-gray-700 leading-relaxed">
              We currently ship within India only. International shipping will be available soon. 
              Subscribe to our newsletter to be notified when international shipping launches.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">Contact for Shipping Questions</h2>
            <div className="bg-brand-stone/50 p-6 rounded-lg">
              <p className="text-gray-700 mb-3">For any shipping-related queries, reach out to us:</p>
              <p className="text-gray-700"><strong>Email:</strong> shipping@kalakari.shop</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91 98765 43210</p>
              <p className="text-gray-700"><strong>Hours:</strong> Mon-Fri, 9 AM - 6 PM IST</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
