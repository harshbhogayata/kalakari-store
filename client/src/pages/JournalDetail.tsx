import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Share2, Heart, BookOpen } from 'lucide-react';
import { useQuery } from 'react-query';
import DOMPurify from 'dompurify';
import api from '../utils/api';

interface JournalPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  featuredImage: string;
  readTime: string;
}

const JournalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch real journal post from API
  const { data: post, isLoading, error } = useQuery(
    ['journal-post', id],
    async () => {
      try {
        const response = await api.get(`/api/journal/${id}`);
        return response.data.data?.post;
      } catch (error) {
        console.error('Failed to fetch journal post:', error);
        throw error;
      }
    },
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h2>
          <p className="text-gray-600 mb-6">The journal article you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/journal')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Journal
          </button>
        </div>
      </div>
    );
  }

  const journalPost: JournalPost = post;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/journal')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Journal
        </button>

        {/* Article Header */}
        <article className="prose prose-lg max-w-none">
          <header className="mb-12">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                <Tag className="w-4 h-4 mr-1" />
                {journalPost.category}
              </span>
              {journalPost.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {journalPost.title}
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {journalPost.excerpt}
            </p>

            <div className="flex items-center justify-between border-t border-b border-gray-200 py-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-500">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{new Date(journalPost.publishedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <BookOpen className="w-5 h-5 mr-2" />
                  <span>{journalPost.readTime}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="flex items-center text-gray-500 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5 mr-2" />
                  <span>Like</span>
                </button>
                <button className="flex items-center text-gray-500 hover:text-blue-500 transition-colors">
                  <Share2 className="w-5 h-5 mr-2" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {journalPost.featuredImage && (
            <div className="mb-12">
              <img
                src={journalPost.featuredImage}
                alt={journalPost.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(journalPost.content) }}
            />
          </div>

          {/* Author Info */}
          <div className="border-t border-gray-200 pt-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  {journalPost.author.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{journalPost.author}</h3>
                <p className="text-gray-600">Contributing Writer</p>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* This would be populated with related articles from API */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">More articles coming soon...</h3>
              <p className="text-gray-600">We're working on adding more journal content.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalDetail;