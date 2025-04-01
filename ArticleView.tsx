import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Article } from '../types';
import { ArrowLeft, Clock, User, Calendar, Share2 } from 'lucide-react';

const ArticleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchArticle();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const handleScroll = () => {
    if (!articleRef.current) return;
    
    const element = articleRef.current;
    const totalHeight = element.clientHeight - window.innerHeight;
    const windowScrollTop = window.scrollY;
    if (windowScrollTop === 0) {
      setReadingProgress(0);
      return;
    }
    if (windowScrollTop > totalHeight) {
      setReadingProgress(100);
      return;
    }
    setReadingProgress((windowScrollTop / totalHeight) * 100);
  };

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-pulse space-y-8 w-full">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Article not found</h2>
        <p className="mt-2 text-gray-600">The article you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/education')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Return to Articles
        </button>
      </div>
    );
  }

  return (
    <div ref={articleRef} className="min-h-screen bg-white">
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50"
      >
        <div 
          className="h-full bg-blue-600 transition-all duration-200"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Articles
        </button>

        <article className="prose lg:prose-xl max-w-none">
        <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-[500px] object-cover rounded-xl shadow-lg mb-8"
          />
          
          <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-600">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
              {article.category}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {article.date}
            </span>
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {article.author}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {Math.ceil(article.content.split(' ').length / 200)} min read
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-8 text-gray-900">{article.title}</h1>
          
          <div className="article-content prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600">
            {article.content.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-6 leading-relaxed text-lg">
                  {paragraph}
                </p>
              )
            ))}
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Share this article</h3>
              <div className="flex space-x-4">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                {/* Add more social share buttons as needed */}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleView; 


