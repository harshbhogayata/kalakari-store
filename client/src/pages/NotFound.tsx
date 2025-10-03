import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('errors.pageNotFound')}</h2>
          <p className="text-gray-600 mb-8">
            {t('errors.pageNotFoundDescription')}
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center w-full"
          >
            <Home className="w-5 h-5 mr-2" />
{t('errors.goHome')}
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-outline inline-flex items-center justify-center w-full"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
{t('common.back')}
          </button>
        </div>
        
        <div className="mt-8">
          <p className="text-sm text-gray-500">
{t('errors.needHelp')}{' '}
            <Link to="/contact" className="text-primary-600 hover:text-primary-500">
              {t('errors.contactSupport')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
