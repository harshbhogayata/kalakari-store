import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Share2, Heart, BookOpen } from 'lucide-react';
// import { useTranslation } from 'react-i18next'; // TODO: Implement translations

const JournalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const { t } = useTranslation(); // TODO: Implement translations

  // Mock journal post data - in a real app, this would come from an API
  const journalPosts = [
    {
      id: '1',
      title: 'The Ancient Art of Block Printing',
      excerpt: 'Explore the history and intricate process behind one of India\'s most beloved textile traditions.',
      content: `Block printing is one of India's oldest and most beloved textile traditions, dating back over 2,000 years. This intricate art form combines creativity, craftsmanship, and cultural heritage in a way that continues to captivate artisans and admirers alike.

## The Origins of Block Printing

The art of block printing in India can be traced back to the Indus Valley Civilization, where evidence of textile printing has been found. However, it was during the Mughal period that block printing truly flourished, with royal patronage helping to refine and perfect the techniques that are still used today.

## The Process

The block printing process is both an art and a science, requiring precision, patience, and a deep understanding of natural dyes and fabrics.

### 1. Wood Block Creation
Artisans carve intricate designs into wooden blocks, typically made from teak or sheesham wood. Each block is carefully crafted to create specific patterns, and a single design may require multiple blocks for different colors.

### 2. Fabric Preparation
The fabric, usually cotton or silk, is washed and treated to remove any impurities. It's then stretched on printing tables and secured with pins to ensure it remains taut during the printing process.

### 3. Dye Application
Natural dyes are prepared using traditional recipes passed down through generations. Common colors include indigo (blue), madder (red), turmeric (yellow), and pomegranate (black).

### 4. Printing Process
The artisan dips the wooden block into the dye and presses it onto the fabric with precision. This process is repeated across the entire length of fabric, creating seamless patterns.

## Regional Variations

Different regions of India have developed their own distinctive styles of block printing:

- **Rajasthan**: Known for bold, geometric patterns and vibrant colors
- **Gujarat**: Famous for intricate floral motifs and fine detailing
- **West Bengal**: Renowned for its delicate patterns and pastel colors
- **Andhra Pradesh**: Celebrated for its traditional Kalamkari techniques

## The Artisan's Story

Meet Rajesh Kumar, a third-generation block printer from Bagru, Rajasthan. His family has been practicing this art for over 60 years, and he continues to preserve the traditional techniques while adapting to modern demands.

"Block printing is not just a craft," says Rajesh, "it's a way of life. Every piece tells a story, and every pattern carries the wisdom of our ancestors."

## Preserving the Tradition

Today, organizations and cooperatives are working to preserve this ancient art form by:
- Supporting artisan communities
- Providing training in traditional techniques
- Creating market access for handmade products
- Promoting sustainable and eco-friendly practices

## Modern Applications

While block printing remains deeply rooted in tradition, contemporary designers are finding new ways to incorporate these techniques into modern fashion and home décor, ensuring that this beautiful art form continues to evolve and thrive.

The ancient art of block printing represents more than just a textile technique—it's a living testament to India's rich cultural heritage and the enduring power of human creativity.`,
      image: 'https://images.unsplash.com/photo-1600661633315-7389108b31a1?q=80&w=1887&auto=format&fit=crop',
      category: 'TEXTILES',
      date: '2024-01-15',
      readTime: '5 min read',
      author: 'Priya Sharma',
      tags: ['Block Printing', 'Textiles', 'Traditional Crafts', 'Rajasthan'],
      likes: 127,
      shares: 23
    },
    {
      id: '2',
      title: 'A Day with the Meenakari Masters',
      excerpt: 'We sit down with a family that has been practicing the art of enamel jewelry for five generations.',
      content: `Meenakari, the ancient art of enameling metal with intricate designs, is one of India's most exquisite jewelry traditions. This painstaking craft requires exceptional skill and patience, with master artisans dedicating decades to perfecting their techniques.

## The Meenakari Legacy

The art of Meenakari was introduced to India by Persian craftsmen during the Mughal era. The word "meenakari" comes from "mina," meaning enamel in Persian. This technique involves fusing colored glass to metal surfaces, creating vibrant, durable designs that can last for centuries.

## The Process

Creating Meenakari jewelry is a complex, multi-step process that can take weeks or even months to complete.

### 1. Metal Preparation
The base metal (usually gold or silver) is shaped and polished to create the foundation for the enamel work.

### 2. Design Creation
Intricate patterns are drawn or etched onto the metal surface. Traditional designs often feature floral motifs, geometric patterns, or scenes from Indian mythology.

### 3. Enamel Application
Colored enamel powders are carefully applied to different sections of the design. Each color requires a separate firing process, making this an incredibly time-consuming technique.

### 4. Firing Process
The piece is fired in a kiln at high temperatures, causing the enamel to melt and fuse with the metal. This process may be repeated multiple times for different colors.

## The Artisan Family

The Sharma family of Jaipur has been practicing Meenakari for five generations. Led by master craftsman Vikram Sharma, the family continues to create stunning pieces using traditional techniques passed down through the ages.

"We don't just make jewelry," explains Vikram, "we preserve a legacy. Every piece we create carries the spirit of our ancestors and the promise of our future."

## Contemporary Relevance

While Meenakari remains rooted in tradition, modern artisans are finding innovative ways to adapt these techniques for contemporary tastes, creating pieces that honor the past while embracing the future.`,
      image: 'https://images.unsplash.com/photo-1599408226244-5d0718ac8e99?q=80&w=1887&auto=format&fit=crop',
      category: 'BEHIND THE CRAFT',
      date: '2024-01-10',
      readTime: '7 min read',
      author: 'Amit Patel',
      tags: ['Meenakari', 'Jewelry', 'Enameling', 'Jaipur'],
      likes: 89,
      shares: 15
    }
  ];

  const post = journalPosts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The journal article you're looking for doesn't exist.</p>
          <Link to="/journal" className="btn-primary">
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/journal')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Journal</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="w-4 h-4 text-brand-clay" />
              <span className="text-sm text-brand-clay font-semibold">{post.category}</span>
            </div>
            
            <h1 className="text-4xl font-serif text-brand-ink mb-4">{post.title}</h1>
            
            <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </div>
                <span>By {post.author}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>{post.shares}</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Featured Image */}
          <div className="mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/800x400/EAE5DE/3A2E24?text=Journal+Article';
              }}
            />
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-bold text-brand-ink mt-8 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-xl font-semibold text-brand-ink mt-6 mb-3">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={index} className="list-disc list-inside mb-4 space-y-2">
                    {paragraph.split('\n').filter(item => item.startsWith('- ')).map((item, i) => (
                      <li key={i} className="text-gray-700">{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="text-gray-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h3 className="text-lg font-semibold text-brand-ink mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-brand-clay hover:text-white transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-lg font-semibold text-brand-ink mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journalPosts.filter(p => p.id !== id).slice(0, 2).map((relatedPost) => (
              <Link
                key={relatedPost.id}
                to={`/journal/${relatedPost.id}`}
                className="group block hover:shadow-md transition-shadow duration-200"
              >
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/400x200/EAE5DE/3A2E24?text=Related+Article';
                    }}
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-brand-ink group-hover:text-brand-clay transition-colors mb-2">
                      {relatedPost.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{relatedPost.excerpt}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalDetail;
