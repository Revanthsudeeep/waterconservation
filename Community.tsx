import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Import the Supabase client
import { MessageSquare, ThumbsUp, Share2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Post {
  id: number;
  user_id: string;
  content: string;
  image_url: string | null;
  likes: string[];
  shares: number;
  created_at: string;
  tags: string[];
  comments: Comment[];
  profiles: {
    username: string;
    avatar_url: string;
    full_name: string;
  };
}

interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
    full_name: string;
  };
}

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const navigate = useNavigate();

  // Fetch current user and posts
  useEffect(() => {
    const fetchUserAndPosts = async () => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error fetching user:', userError);
        navigate('/auth');
        return;
      }
      
      setCurrentUser(user);

      // Fetch posts with user profile information and comments
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            full_name
          ),
          comments (
            id,
            content,
            created_at,
            user_id,
            profiles:user_id (
              username,
              avatar_url,
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
      } else {
        setPosts(postsData);
      }
    };

    fetchUserAndPosts();
  }, [navigate]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: currentUser.id,
          content: newPost,
          likes: [],
          shares: 0,
          tags: []
        })
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            full_name
          )
        `)
        .single();

      if (error) {
        console.error('Error creating post:', error);
        toast.error('Failed to create post');
        return;
      }

      setPosts([data as Post, ...posts]);
      setNewPost('');
      toast.success('Post created successfully!');

    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleLike = async (postId: number) => {
    try {
      // First get the current post likes
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', postId)
        .single();

      if (fetchError) throw fetchError;

      const currentLikes: string[] = post.likes || [];
      const userHasLiked = currentLikes.includes(currentUser.id);
      
      // Update the likes array
      const newLikes = userHasLiked
        ? currentLikes.filter((id: string) => id !== currentUser.id)
        : [...currentLikes, currentUser.id];

      // Update the post
      const { error: updateError } = await supabase
        .from('posts')
        .update({ likes: newLikes })
        .eq('id', postId);

      if (updateError) throw updateError;

      // Update local state
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likes: newLikes }
          : p
      ));

    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleComment = async (postId: number) => {
    if (!commentText.trim()) return;
  
    try {
      // Step 1: Check if comment is relevant using OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_OPENAI_API_KEY`, // Replace with your actual API key
        },
        body: JSON.stringify({
          model: "gpt-4", // You can use gpt-3.5-turbo if needed
          messages: [
            { role: "system", content: "You are an assistant that verifies if comments are related to a specific project." },
            { role: "user", content: `Is this comment relevant to the project? "${commentText}" Reply with just 'YES' or 'NO'.` },
          ],
          max_tokens: 5,
        }),
      });
  
      const result = await response.json();
      const aiReply = result.choices[0]?.message?.content.trim().toUpperCase();
  
      if (aiReply !== "YES") {
        toast.error("Comment must be related to the project.");
        return;
      }
  
      // Step 2: Insert the validated comment into Supabase
      const { data: newComment, error: commentError } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: commentText,
        })
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            full_name
          )
        `)
        .single();
  
      if (commentError) throw commentError;
  
      // Step 3: Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), newComment],
          };
        }
        return post;
      }));
  
      setCommentText('');
      setSelectedPost(null);
      toast.success("Comment added successfully!");
  
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment.");
    }
  };
  

  const handleShare = async (postId: number) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const newShareCount = (post.shares || 0) + 1;

      // Increment shares count
      const { error } = await supabase
        .from('posts')
        .update({ shares: newShareCount })
        .eq('id', postId);

      if (error) throw error;

      // Update local state
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, shares: newShareCount }
          : p
      ));

      // Copy post link to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
      toast.success('Post link copied to clipboard!');

    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Water Conservation Community</h1>
        <p className="text-xl text-gray-600">Share your experiences and learn from others.</p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="card flex items-center space-x-4">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-2xl font-bold">1,234</h3>
            <p className="text-gray-600">Community Members</p>
          </div>
        </div>
        <div className="card flex items-center space-x-4">
          <MessageSquare className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="text-2xl font-bold">856</h3>
            <p className="text-gray-600">Active Discussions</p>
          </div>
        </div>
        <div className="card flex items-center space-x-4">
          <Share2 className="h-8 w-8 text-purple-600" />
          <div>
            <h3 className="text-2xl font-bold">2.1M</h3>
            <p className="text-gray-600">Tips Shared</p>
          </div>
        </div>
        <div className="card flex items-center space-x-4">
          <ThumbsUp className="h-8 w-8 text-yellow-600" />
          <div>
            <h3 className="text-2xl font-bold">15.2K</h3>
            <p className="text-gray-600">Success Stories</p>
          </div>
        </div>
      </div>

      {/* Create Post */}
      {currentUser && (
        <div className="card mb-8">
          <form onSubmit={handlePostSubmit}>
            <textarea
              className="input-field min-h-[120px] mb-4"
              placeholder="Share your water conservation story..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            ></textarea>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Share Story
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-8">
        {posts.map(post => (
          <article key={post.id} className="card">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={post.profiles.avatar_url || "https://via.placeholder.com/150"}
                alt={`${post.profiles.username}'s avatar`}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{post.profiles.full_name}</h3>
                <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
              </div>
            </div>
            <p className="mb-4">{post.content}</p>
            {post.image_url && (
              <img
                src={post.image_url}
                alt="Post content"
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}
            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-1 ${
                  post.likes?.includes(currentUser.id) ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
                <span>{post.likes?.length || 0}</span>
              </button>

              <button
                onClick={() => setSelectedPost(post.id)}
                className="flex items-center space-x-1 text-gray-600"
              >
                <MessageSquare className="h-5 w-5" />
                <span>{post.comments?.length || 0}</span>
              </button>

              <button
                onClick={() => handleShare(post.id)}
                className="flex items-center space-x-1 text-gray-600"
              >
                <Share2 className="h-5 w-5" />
                <span>{post.shares || 0}</span>
              </button>
            </div>

            {selectedPost === post.id && (
              <div className="mt-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Write a comment..."
                  rows={2}
                />
                <button
                  onClick={() => handleComment(post.id)}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Post Comment
                </button>
              </div>
            )}

            {post.comments && post.comments.length > 0 && (
              <div className="mt-4 space-y-2">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-2 rounded">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <img
                          src={comment.profiles.avatar_url || "https://via.placeholder.com/32"}
                          alt={`${comment.profiles.username}'s avatar`}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="font-semibold">{comment.profiles.username}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 ml-8">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default Community;