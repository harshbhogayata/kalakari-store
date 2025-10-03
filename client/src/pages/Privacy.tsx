import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-base py-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-brand-ink mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">1. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-brand-ink mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>Name, email address, phone number</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information (processed securely through our payment partners)</li>
              <li>Account preferences and settings</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-brand-ink mb-2 mt-4">Usage Information</h3>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>Pages visited and time spent on our site</li>
              <li>Products viewed and interactions</li>
              <li>Device information and browser type</li>
              <li>IP address and location data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y:@">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your purchases</li>
              <li>Provide customer support</li>
              <li>Send promotional emails and updates (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or share your personal information with third parties, except:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>Service providers who assist in our operations</li>
              <li>Payment processors for secure transaction handling</li>
              <li>Shipping companies for order fulfillment</li>
              <li>Legal requirements or court orders</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">4. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your browsing experience:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>Essential cookies for site functionality</li>
              <li>Analytics cookies to understand usage patterns</li>
              <li>Marketing cookies for personalized content</li>
              <li>Preference cookies to remember your settings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>SSL encryption for data transmission</li>
              <li>Secure payment processing</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">6. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">7. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">9. Changes to Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif text-brand-ink mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-brand-stone/50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@kalakari.shop</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91 98765 43210</p>
              <p className="text-gray-700"><strong>Address:</strong> 123 Artisan Street, Mumbai - 400001</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
