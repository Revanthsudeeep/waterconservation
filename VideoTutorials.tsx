import { useState, useEffect } from 'react';
import { Video, Search, PlayCircle, Clock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const getEmbedUrl = (url: string) => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url; // Use direct link for non-YouTube videos
};


interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: string;
  duration: string;
  instructor: string;
  date: string;
  views: number;
}

const VideoTutorials = () => {
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('video_tutorials')
        .select('*');

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Video Tutorials</h1>
        <p className="text-xl text-gray-600">Learn about water conservation through our comprehensive video library.</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos..."
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
          <option value="tutorials">Tutorials</option>
          <option value="demonstrations">Demonstrations</option>
          <option value="lectures">Lectures</option>
        </select>
      </div>

      {/* Video Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card flex items-center space-x-4">
          <Video className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-semibold">Step-by-Step Tutorials</h3>
            <p className="text-sm text-gray-600">Detailed guidance</p>
          </div>
        </div>
        <div className="card flex items-center space-x-4">
          <PlayCircle className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-semibold">Live Demonstrations</h3>
            <p className="text-sm text-gray-600">Real-world examples</p>
          </div>
        </div>
        <div className="card flex items-center space-x-4">
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-semibold">Expert Lectures</h3>
            <p className="text-sm text-gray-600">In-depth knowledge</p>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <p>Loading videos...</p>
        ) : filteredVideos.length === 0 ? (
          <p>No videos found.</p>
        ) : (
          filteredVideos.map(video => (
            <div 
              key={video.id} 
              className="card hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/video/${video.id}`)}
            >
              {/* Thumbnail Container */}
              <div className="relative">
                <img
                  src={video.thumbnailUrl || '/video-placeholder.jpg'}
                  alt={video.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/video-placeholder.jpg';
                  }}
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                  <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {video.category}
                  </span>
                  <span className="text-sm text-gray-500">{video.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{video.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">By {video.instructor}</span>
                  <span className="text-sm text-gray-500">{video.views} views</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VideoTutorials; 