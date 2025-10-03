import React, { useState } from 'react';
import { Star, MessageSquare, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import toast from 'react-hot-toast';

interface ReviewsSectionProps {
  productId: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Fetch reviews
  const { data: reviewsData, isLoading, refetch } = useQuery(
    ['reviews', productId, page, sortBy, filterRating],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort: sortBy
      });
      
      if (filterRating) {
        params.append('rating', filterRating.toString());
      }

      // Use mock endpoint in development mode
      const endpoint = process.env.NODE_ENV === 'development' 
        ? `/api/dev/products/${productId}/reviews` 
        : `/products/${productId}/reviews`;
      
      const response = await api.get(`${endpoint}?${params}`);
      return response.data.data;
    },
    {
      keepPreviousData: true
    }
  );

  // Submit review mutation
  const submitReviewMutation = useMutation(
    async (reviewData: any) => {
      // Use mock endpoint in development mode
      const endpoint = process.env.NODE_ENV === 'development' 
        ? `/api/dev/products/${productId}/reviews` 
        : `/products/${productId}/reviews`;

      if (process.env.NODE_ENV === 'development') {
        // For development, send as JSON
        const response = await api.post(endpoint, {
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment
        });
        return response.data;
      } else {
        // For production, use FormData for file uploads
        const formData = new FormData();
        formData.append('rating', reviewData.rating.toString());
        formData.append('title', reviewData.title);
        formData.append('comment', reviewData.comment);
        
        reviewData.images.forEach((image: File, index: number) => {
          formData.append(`images`, image);
        });

        const response = await api.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      }
    },
    {
      onSuccess: async () => {
        queryClient.invalidateQueries(['reviews', productId]);
        // Reset to page 1 to show the new review
        setPage(1);
        setShowReviewForm(false);
        // Force refetch the reviews
        await refetch();
        toast.success('Review submitted successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to submit review');
      }
    }
  );

  // Helpful review mutation
  const helpfulMutation = useMutation(
    async (reviewId: string) => {
      // Use mock endpoint in development mode
      const endpoint = process.env.NODE_ENV === 'development' 
        ? `/api/dev/reviews/${reviewId}/helpful` 
        : `/reviews/${reviewId}/helpful`;
      
      const response = await api.post(endpoint);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', productId]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to mark as helpful');
      }
    }
  );

  // Respond to review mutation
  const respondMutation = useMutation(
    async ({ reviewId, response }: { reviewId: string; response: string }) => {
      // Use mock endpoint in development mode
      const endpoint = process.env.NODE_ENV === 'development' 
        ? `/api/dev/reviews/${reviewId}/respond` 
        : `/reviews/${reviewId}/respond`;
      
      const apiResponse = await api.post(endpoint, { response });
      return apiResponse.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', productId]);
        toast.success('Response submitted successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to submit response');
      }
    }
  );

  const handleSubmitReview = async (reviewData: any) => {
    await submitReviewMutation.mutateAsync(reviewData);
  };

  const handleHelpful = (reviewId: string) => {
    if (!user) {
      toast.error('Please login to mark reviews as helpful');
      return;
    }
    helpfulMutation.mutate(reviewId);
  };

  const handleRespond = (reviewId: string, response: string) => {
    respondMutation.mutate({ reviewId, response });
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const renderRatingStars = (rating: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">{rating} star{rating !== 1 ? 's' : ''}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
          <div
            className="bg-yellow-400 h-2 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-500">{count}</span>
      </div>
    );
  };

  if (isLoading && !reviewsData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];
  const stats = reviewsData?.stats || {
    average: 0,
    total: 0,
    breakdown: []
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <MessageSquare className="w-6 h-6" />
          <span>Customer Reviews</span>
        </h2>
        
        {user && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Write Review</span>
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8">
          <ReviewForm
            productId={productId}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
            isSubmitting={submitReviewMutation.isLoading}
          />
        </div>
      )}

      {/* Review Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats.average.toFixed(1)}
            </div>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats.average)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600">Based on {stats.total} review{stats.total !== 1 ? 's' : ''}</p>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 mb-3">Rating Breakdown</h3>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.breakdown.find((b: any) => b._id === rating)?.count || 0;
              return renderRatingStars(rating, count, stats.total);
            })}
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter by rating:</label>
            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="createdAt">Newest first</option>
            <option value="-createdAt">Oldest first</option>
            <option value="rating">Highest rating</option>
            <option value="-rating">Lowest rating</option>
            <option value="helpful.count">Most helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <ReviewList
          productId={productId}
          reviews={reviews}
          stats={stats}
          onLoadMore={handleLoadMore}
          hasMore={reviewsData?.hasMore || false}
          isLoading={isLoading}
          onHelpful={handleHelpful}
          onRespond={handleRespond}
        />
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-4">
            Be the first to share your thoughts about this product!
          </p>
          {user && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-primary"
            >
              Write the first review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
