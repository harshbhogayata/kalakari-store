import React from 'react';
import { Star, Zap, Tag, Crown, Award } from 'lucide-react';

interface ProductBadgeProps {
  type: 'featured' | 'new' | 'sale' | 'bestseller' | 'limited';
  className?: string;
}

const ProductBadge: React.FC<ProductBadgeProps> = ({ type, className = '' }) => {
  const badgeConfig = {
    featured: {
      icon: Star,
      text: 'Featured',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    new: {
      icon: Zap,
      text: 'New',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    sale: {
      icon: Tag,
      text: 'Sale',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    bestseller: {
      icon: Award,
      text: 'Bestseller',
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    limited: {
      icon: Crown,
      text: 'Limited',
      bgColor: 'bg-purple-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    }
  };

  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      <Icon className={`w-3 h-3 mr-1 ${config.iconColor}`} />
      {config.text}
    </div>
  );
};

export default ProductBadge;
