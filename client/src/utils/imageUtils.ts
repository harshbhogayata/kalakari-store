/**
 * Image utility functions for handling fallbacks and placeholders
 */

import config from '../config/env';

/**
 * Get image URL with fallback
 * @param imageUrl - Primary image URL
 * @param fallback - Fallback image type
 * @returns Image URL with fallback
 */
export const getImageUrl = (
  imageUrl?: string, 
  fallback: keyof typeof config.images = 'placeholder'
): string => {
  return imageUrl || config.images[fallback];
};

/**
 * Get product image with fallback
 * @param images - Array of product images
 * @param index - Image index (default: 0)
 * @returns Product image URL with fallback
 */
export const getProductImage = (images?: Array<{ url: string; alt?: string }>, index = 0): string => {
  return images?.[index]?.url || config.images.productPlaceholder;
};

/**
 * Get avatar image with fallback
 * @param avatarUrl - Avatar URL
 * @returns Avatar URL with fallback
 */
export const getAvatarImage = (avatarUrl?: string): string => {
  return avatarUrl || config.images.avatarPlaceholder;
};

/**
 * Get journal image with fallback
 * @param imageUrl - Journal image URL
 * @returns Journal image URL with fallback
 */
export const getJournalImage = (imageUrl?: string): string => {
  return imageUrl || config.images.journalPlaceholder;
};

/**
 * Get artisan image with fallback
 * @param imageUrl - Artisan image URL
 * @returns Artisan image URL with fallback
 */
export const getArtisanImage = (imageUrl?: string): string => {
  return imageUrl || config.images.artisanPlaceholder;
};

/**
 * Generate Unsplash image URL for mock data
 * @param seed - Seed for consistent images
 * @param width - Image width
 * @param height - Image height
 * @returns Unsplash image URL
 */
export const getUnsplashImage = (seed: number, width = 300, height = 200): string => {
  return `https://images.unsplash.com/photo-${seed}?w=${width}&h=${height}&auto=format&fit=crop`;
};

/**
 * Handle image load error by setting fallback
 * @param event - Image load error event
 * @param fallback - Fallback image type
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: keyof typeof config.images = 'placeholder'
): void => {
  const target = event.target as HTMLImageElement;
  target.src = config.images[fallback];
};
