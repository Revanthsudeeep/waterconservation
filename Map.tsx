import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, DivIcon } from 'leaflet';
import { supabase } from '../lib/supabase';

interface WaterZone {
  id: number;
  location: string;
  sub_city: string;
  state: string;
  position: [number, number];
  severity: 'high' | 'medium' | 'low';
  water_level: number;
  rainfall_data: number;
  groundwater_level: number;
  last_updated: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

const INDIAN_CITIES: { [key: string]: string[] } = {
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Thane', 'Navi Mumbai'
  ],
  'Delhi': [
    'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'
  ],
  'Karnataka': [
    'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Dharwad'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tiruppur', 'Vellore'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar'
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Meerut', 'Noida', 'Ghaziabad'
  ],
  // Add more states and their cities as needed
};

const createCustomIcon = (severity: string) => {
  const color = severity === 'high' ? '#ef4444' : 
                severity === 'medium' ? '#f59e0b' : '#10b981';
                
  return new DivIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        transform: rotate(-45deg);
      ">
        <div style="
          position: absolute;
          width: 24px;
          height: 24px;
          background-color: ${color};
          border-radius: 50% 50% 50% 0;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        "></div>
        <div style="
          position: absolute;
          width: 12px;
          height: 12px;
          background-color: white;
          border-radius: 50%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const Map = () => {
  const [waterZones, setWaterZones] = useState<WaterZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [timeRange, setTimeRange] = useState('7days');
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (selectedState !== 'all') {
      const stateCities = INDIAN_CITIES[selectedState] || [];
      setCities(stateCities);
      // Reset selected city when state changes
      setSelectedCity('all');
    } else {
      setCities([]);
      setSelectedCity('all');
    }
  }, [selectedState]);

  useEffect(() => {
    fetchWaterZones();
  }, [selectedState, selectedCity, timeRange]);

  const fetchWaterZones = async () => {
    try {
      setLoading(true);
      console.log('Fetching with filters:', { selectedState, selectedCity, timeRange });
      
      let query = supabase
        .from('water_zones')
        .select('*');

      // Apply filters
      if (selectedState !== 'all') {
        query = query.eq('state', selectedState);
      }
      
      if (selectedCity !== 'all') {
        query = query.eq('location', selectedCity);
      }

      if (timeRange !== 'all') {
        const days = parseInt(timeRange);
        const date = new Date();
        date.setDate(date.getDate() - days);
        query = query.gte('last_updated', date.toISOString());
      }

      const { data, error } = await query;
      console.log("Generated Query:", query);

      if (error) throw error;

      if (data) {
        console.log('Raw data from Supabase:', data);

        const transformedData = data.map(zone => {
          try {
            let position;
            
            // Handle different position formats
            if (typeof zone.position === 'string') {
              // If position is a string, parse it
              position = JSON.parse(zone.position);
            } else if (Array.isArray(zone.position)) {
              // If position is already an array, use it directly
              position = zone.position;
            } else if (typeof zone.position === 'object') {
              // If position is an object (from JSONB), convert it to array
              position = [zone.position[0], zone.position[1]];
            }

            // Validate position format
            if (!Array.isArray(position) || position.length !== 2 ||
                typeof position[0] !== 'number' || typeof position[1] !== 'number') {
              console.error('Invalid position format for zone:', zone);
              return null;
            }

            console.log('Transformed position for zone:', {
              id: zone.id,
              location: zone.location,
              position: position
            });

            return {
              ...zone,
              position: position as [number, number]
            };
          } catch (e) {
            console.error('Error transforming zone:', zone, e);
            return null;
          }
        }).filter(Boolean); // Remove any null values

        console.log('Final transformed data:', transformedData);
        setWaterZones(transformedData);
      }
    } catch (error) {
      console.error('Error fetching water zones:', error);
      setError('Failed to fetch water zones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Water Resources Map</h1>
        <p className="text-xl text-gray-600">Monitor water resources across India</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select 
                  className="input-field"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="all">All States</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <select 
                  className="input-field"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={selectedState === 'all'}
                >
                  <option value="all">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Period
                </label>
                <select 
                  className="input-field"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 bg-red-500 rounded-tl-full rounded-tr-full rounded-bl-none rounded-br-full rotate-45"></div>
                  <div className="absolute inset-[25%] bg-white rounded-full"></div>
                </div>
                <span>High Water Scarcity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 bg-yellow-500 rounded-tl-full rounded-tr-full rounded-bl-none rounded-br-full rotate-45"></div>
                  <div className="absolute inset-[25%] bg-white rounded-full"></div>
                </div>
                <span>Medium Water Scarcity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 bg-green-500 rounded-tl-full rounded-tr-full rounded-bl-none rounded-br-full rotate-45"></div>
                  <div className="absolute inset-[25%] bg-white rounded-full"></div>
                </div>
                <span>Low Water Scarcity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3 card" style={{ height: '700px' }}>
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            {waterZones.map(zone => {
              // Validate position before rendering
              if (!zone.position || !Array.isArray(zone.position) || zone.position.length !== 2) {
                console.error('Invalid position for zone:', zone);
                return null;
              }

              return (
                <Marker
                  key={zone.id}
                  position={zone.position}
                  icon={createCustomIcon(zone.severity)}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{zone.location}</h3>
                      <p className="text-sm">State: {zone.state}</p>
                      <p className="text-sm">City: {zone.sub_city}</p>
                      <p className="text-sm">Water Level: {zone.water_level}m</p>
                      <p className="text-sm">Rainfall: {zone.rainfall_data}mm</p>
                      <p className="text-sm">Groundwater: {zone.groundwater_level}m</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Last updated: {new Date(zone.last_updated).toLocaleString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Map;