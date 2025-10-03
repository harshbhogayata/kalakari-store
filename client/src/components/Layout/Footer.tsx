import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import config from '../../config/env';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-serif">Kalakari</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
                <div className="flex space-x-4">
                  <a href={config.social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href={config.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors duration-200">
{t('footer.allProducts')}
                </Link>
              </li>
              <li>
                <Link to="/artisans" className="text-gray-300 hover:text-white transition-colors duration-200">
{t('navigation.artisans')}
                </Link>
              </li>
              <li>
                <Link to="/journal" className="text-gray-300 hover:text-white transition-colors duration-200">
{t('navigation.journal')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=Pottery" className="text-gray-300 hover:text-white transition-colors duration-200">
{t('categories.pottery')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=Textiles" className="text-gray-300 hover:text-white transition-colors duration-200">
{t('categories.textiles')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.customerService')}</h3>
            <ul className="space-y-2">
                  <li>
                    <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
{t('footer.help')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/shipping" className="text-gray-300 hover:text-white transition-colors duration-200">
{t('footer.shipping')}
                    </Link>
                  </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-white transition-colors duration-200">
{t('footer.returns')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
{t('footer.contactUs')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors duration-200">
{t('footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.contactInfo')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300 text-sm">support@kalakari.shop</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300 text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  123 Artisan Street<br />
                  Mumbai, Maharashtra 400001<br />
                  India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
{t('footer.copyright')} © 2024 Kalakari.shop. {t('footer.allRightsReserved')}
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
{t('footer.terms')}
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
{t('footer.privacy')}
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors duration-200">
{t('footer.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
