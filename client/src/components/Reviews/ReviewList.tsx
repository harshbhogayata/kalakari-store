import React, { useState } from 'react';
import { Star, ThumbsUp, MessageCircle, CheckCircle, Flag } from 'lucide-react';
import { Review, ReviewStats } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ReviewListProps {
  productId: string;
  reviews: Review[];
  stats: ReviewStats;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  onHelpful: (reviewId: string) => void;
  onRespond: (reviewId: string, response: string) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({
  productId,
  reviews,
  stats,
  onLoadMore,
  hasMore,
  isLoading,
  onHelpful,
  onRespond
}) => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showReportForm, setShowReportForm] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingText = (rating: number) => {
    const ratings = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratings[rating as keyof typeof ratings] || '';
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {stats.average.toFixed(1)}
              </span>
              <div>
                {renderStars(Math.round(stats.average), 'lg')}
                <p className="text-sm text-gray-600">
                  Based on {stats.total} review{stats.total !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.breakdown.find(b => b._id === rating)?.count || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-8">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field text-sm"
          >
            <option value="createdAt">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>

          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            className="input-field text-sm"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex items-start space-x-4">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {typeof review.customerId === 'object' 
                      ? review.customerId.name.charAt(0).toUpperCase()
                      : 'U'
                    }
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">
                      {typeof review.customerId === 'object' 
                        ? review.customerId.name 
                        : 'Anonymous'
                      }
                    </h4>
                    {review.isVerified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-600">
                    {getRatingText(review.rating)}
                  </span>
                </div>

                {/* Title */}
                <h5 className="font-medium text-gray-900 mb-2">
                  {review.title}
                </h5>

                {/* Comment */}
                <p className="text-gray-700 mb-3">
                  {review.comment}
                </p>

                {/* Images */}
                {review.images && review.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button
                      onClick={() => onHelpful(review._id)}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful ({review.helpful.count})</span>
                    </button>
                  </div>
                  
                  {/* Report Button */}
                  {user && user._id !== (typeof review.customerId === 'object' ? review.customerId._id : review.customerId) && (
                    <button
                      onClick={() => setShowReportForm(review._id)}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Report</span>
                    </button>
                  )}
                </div>

                {/* Report Form */}
                {showReportForm === review._id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Report this review</h4>
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Please explain why you're reporting this review..."
                      className="w-full p-2 border border-red-300 rounded text-sm"
                      rows={3}
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => {
                          if (reportReason.trim()) {
                            toast.success('Review reported successfully');
                            setShowReportForm(null);
                            setReportReason('');
                          } else {
                            toast.error('Please provide a reason for reporting');
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Submit Report
                      </button>
                      <button
                        onClick={() => {
                          setShowReportForm(null);
                          setReportReason('');
                        }}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Response */}
                {review.response && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {typeof review.response.respondedBy === 'object' 
                          ? review.response.respondedBy.name 
                          : 'Artisan'
                        }
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.response.respondedAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.response.text}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="btn-outline"
          >
            {isLoading ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}

      {/* No Reviews */}
      {reviews.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
