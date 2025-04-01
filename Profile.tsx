import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Profile } from '../services/profileService';
import { profileService } from '../services/profileService';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Droplet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Simple Water Drop using basic shapes
function WaterDrop() {
  return (
    <Sphere args={[1, 32, 32]}>
      <meshStandardMaterial
        color="#60A5FA"
        transparent
        opacity={0.6}
        roughness={0.1}
        metalness={0.1}
      />
    </Sphere>
  );
}

// Add this new component for the edit form
function EditProfileForm({ 
  profile, 
  onSave, 
  onCancel 
}: { 
  profile: Profile; 
  onSave: (updates: Partial<Profile>) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    username: profile.username || '',
    full_name: profile.full_name || '',
    bio: profile.bio || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-6 rounded-lg shadow-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        // If viewing own profile, use the profile from auth context
        if (user?.id === id && authProfile) {
          setProfile(authProfile);
          setLoading(false);
          return;
        }

        // Otherwise fetch the profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadProfile();
    }
  }, [id, user?.id, authProfile, authLoading, navigate]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      const url = await profileService.uploadAvatar(user.id, file);
      setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload avatar');
    }
  };

  const handleProfileUpdate = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        toast.error('You must be logged in to update your profile');
        return;
      }

      const updatedProfile = await profileService.updateProfile(user.id, updates);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 mb-4">Profile not found</div>
        <button
          onClick={() => navigate('/')}
          className="text-blue-500 hover:text-blue-700"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Hero Section with 3D Model */}
        <div className="h-48 relative overflow-hidden bg-blue-600">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Suspense fallback={null}>
              <WaterDrop />
            </Suspense>
            <OrbitControls enableZoom={false} autoRotate />
          </Canvas>
        </div>

        {/* Profile Content */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6"
        >
          {isEditing ? (
            <EditProfileForm
              profile={profile}
              onSave={handleProfileUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="flex flex-col items-center">
              <img
                src={profile.avatar_url || '/default-avatar.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover ring-4 ring-white mb-4"
              />
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              <p className="text-lg text-gray-600">@{profile.username}</p>
              <p className="text-gray-600 mt-2">{profile.bio || 'No bio yet'}</p>
              <div className="flex items-center space-x-4 mt-4">
                <Droplet className="w-5 h-5 text-blue-500" />
                <span className="text-gray-600">Level {profile.level}</span>
                <span className="text-gray-600">{profile.followers_count} Followers</span>
                <span className="text-gray-600">{profile.following_count} Following</span>
              </div>
              {user?.id === profile.id && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 