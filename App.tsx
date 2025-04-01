import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import Education from './pages/Education';
import Map from './pages/Map';
import Community from './pages/Community';
import Calculator from './pages/Calculator';
import ArticleView from './pages/ArticleView';
import ProfilePage from './pages/Profile';
import Auth from './components/Auth';
import AuthCallback from './components/AuthCallback';
import VideoTutorials from './pages/VideoTutorials';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Navigation />
          <Routes>
            <Route path="/" element={
              <>
                <HeroSection />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  {/* Main content */}
                </main>
              </>
            } />
            <Route path="/education" element={<Education />} />
            <Route path="/map" element={<Map />} />
            <Route path="/community" element={<Community />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/article/:id" element={<ArticleView />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/videos" element={<VideoTutorials />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;