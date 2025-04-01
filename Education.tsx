import { useState, useEffect } from 'react';
import { BookOpen, Video, Calculator, Search } from 'lucide-react';
import type { Article } from '../types';
import { supabase } from '../lib/supabase'; // Make sure this path is correct
import { useNavigate } from 'react-router-dom';

const Education = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*');

      console.log('Fetched data:', data);
      console.log('Error if any:', error);

      if (error) {
        throw error;
      }

      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Water Conservation Education Hub</h1>
        <p className="text-xl text-gray-600">Discover resources, articles, and tutorials about water conservation.</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input-field sm:w-48"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="conservation">Conservation</option>
          <option value="technology">Technology</option>
          <option value="research">Research</option>
        </select>
      </div>

      {/* Resource Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card flex items-center space-x-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-semibold">Articles</h3>
            <p className="text-sm text-gray-600">In-depth knowledge</p>
          </div>
        </div>
        <div 
          className="card flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => navigate('/videos')}
        >
          <Video className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-semibold">Video Tutorials</h3>
            <p className="text-sm text-gray-600">Visual learning</p>
          </div>
        </div>
        <div className="card flex items-center space-x-4">
          <Calculator className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-semibold">Interactive Tools</h3>
            <p className="text-sm text-gray-600">Practical applications</p>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <p>Loading articles...</p>
        ) : filteredArticles.length === 0 ? (
          <p>No articles found.</p>
        ) : (
          filteredArticles.map(article => (
            <article 
              key={article.id} 
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/article/${article.id}`)}
            >
              <img
                src={article.imageUrl || '/placeholder-image.jpg'}
                alt={article.title}
                className="w-full h-48 object-cover rounded-t-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {article.category}
                  </span>
                  <span className="text-sm text-gray-500">{article.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.content.substring(0, 100)}...</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">By {article.author}</span>
                  <span className="text-blue-600 hover:text-blue-800">Read more →</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Education;