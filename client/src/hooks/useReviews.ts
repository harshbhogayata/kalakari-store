import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../utils/api';
import { Review, ReviewStats } from '../types';
import toast from 'react-hot-toast';

interface UseReviewsProps {
  productId: string;
  page?: number;
  limit?: number;
  rating?: number;
  sort?: string;
}

export const useReviews = ({ productId, page = 1, limit = 10, rating, sort = 'createdAt' }: UseReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    average: 0,
    total: 0,
    breakdown: []
  });
  const [hasMore, setHasMore] = useState(true);

  const queryKey = ['reviews', productId, page, limit, rating, sort];

  const { isLoading, error, refetch } = useQuery(
    queryKey,
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort
      });
      
      if (rating) {
        params.append('rating', rating.toString());
      }

      const response = await api.get(`/reviews/product/${productId}?${params.toString()}`);
      return response.data.data;
    },
    {
      enabled: !!productId,
      onSuccess: (data) => {
        if (page === 1) {
          setReviews(data.reviews);
        } else {
          setReviews(prev => [...prev, ...data.reviews]);
        }
        setStats(data.ratingStats);
        setHasMore(data.pagination.current < data.pagination.pages);
      }
    }
  );

  const loadMore = () => {
    if (hasMore && !isLoading) {
      refetch();
    }
  };

  return {
    reviews,
    stats,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch
  };
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (reviewData: Partial<Review>) => {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    },
    {
      onSuccess: (data, variables) => {
        toast.success('Review submitted successfully!');
        queryClient.invalidateQueries(['reviews', variables.productId]);
        queryClient.invalidateQueries(['product', variables.productId]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to submit review');
      }
    }
  );
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ reviewId, reviewData }: { reviewId: string; reviewData: Partial<Review> }) => {
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    },
    {
      onSuccess: (data, variables) => {
        toast.success('Review updated successfully!');
        queryClient.invalidateQueries(['reviews']);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update review');
      }
    }
  );
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (reviewId: string) => {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Review deleted successfully!');
        queryClient.invalidateQueries(['reviews']);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete review');
      }
    }
  );
};

export const useMarkHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (reviewId: string) => {
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews']);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to mark as helpful');
      }
    }
  );
};

export const useRespondToReview = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ reviewId, responseText }: { reviewId: string; responseText: string }) => {
      const response = await api.post(`/reviews/${reviewId}/respond`, { text: responseText });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Response added successfully!');
        queryClient.invalidateQueries(['reviews']);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add response');
      }
    }
  );
};
