import React from 'react';
import { Droplets, Plane as Plant, CloudRain } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-400 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Smart Water Conservation for a Sustainable Future
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Leverage AI-powered insights and community knowledge to make every drop count
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-lg rounded-lg">
              <Droplets className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold">Smart Irrigation</h3>
              <p className="mt-2">AI-driven recommendations</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-lg rounded-lg">
              <Plant className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold">Soil Analysis</h3>
              <p className="mt-2">Optimize water usage</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-lg rounded-lg">
              <CloudRain className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold">Rainwater Harvesting</h3>
              <p className="mt-2">Sustainable solutions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;