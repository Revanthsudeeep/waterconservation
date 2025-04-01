import React, { useState } from 'react';
import { Droplets, CloudRain, Ruler, Calculator as CalcIcon } from 'lucide-react';
import type { WaterCalculation } from '../types';

const Calculator = () => {
  const [calculation, setCalculation] = useState<WaterCalculation>({
    area: 0,
    rainfall: 0,
    runoffCoefficient: 0.8,
    harvestableWater: 0
  });

  const calculateHarvestableWater = () => {
    const { area, rainfall, runoffCoefficient } = calculation;
    const harvestableWater = area * rainfall * runoffCoefficient;
    setCalculation(prev => ({ ...prev, harvestableWater }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Water Conservation Calculator</h1>
        <p className="text-xl text-gray-600">Calculate potential water savings and conservation metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calculator Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6">Rainwater Harvesting Calculator</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catchment Area (square feet)
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    className="input-field pl-10"
                    value={calculation.area}
                    onChange={(e) => setCalculation(prev => ({
                      ...prev,
                      area: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Rainfall (inches)
                </label>
                <div className="relative">
                  <CloudRain className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    className="input-field pl-10"
                    value={calculation.rainfall}
                    onChange={(e) => setCalculation(prev => ({
                      ...prev,
                      rainfall: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Runoff Coefficient
                </label>
                <select
                  className="input-field"
                  value={calculation.runoffCoefficient}
                  onChange={(e) => setCalculation(prev => ({
                    ...prev,
                    runoffCoefficient: parseFloat(e.target.value)
                  }))}
                >
                  <option value="0.8">Pitched Roof (0.8)</option>
                  <option value="0.6">Flat Roof (0.6)</option>
                  <option value="0.4">Unpaved Area (0.4)</option>
                </select>
              </div>

              <button
                className="btn-primary w-full"
                onClick={calculateHarvestableWater}
              >
                Calculate
              </button>
            </div>

            {calculation.harvestableWater > 0 && (
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-blue-700">Harvestable Water</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {Math.round(calculation.harvestableWater)} gallons
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Potential Annual Savings</p>
                    <p className="text-3xl font-bold text-blue-900">
                      ${Math.round(calculation.harvestableWater * 0.01)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips and Information */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Droplets className="h-5 w-5 text-blue-600 mt-1" />
                <span>Larger catchment areas collect more rainwater</span>
              </li>
              <li className="flex items-start space-x-3">
                <CloudRain className="h-5 w-5 text-blue-600 mt-1" />
                <span>Consider seasonal rainfall patterns</span>
              </li>
              <li className="flex items-start space-x-3">
                <CalcIcon className="h-5 w-5 text-blue-600 mt-1" />
                <span>Higher runoff coefficients mean better collection efficiency</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Did You Know?</h3>
            <p className="text-gray-600 mb-4">
              A 1,000 square foot roof can collect approximately 600 gallons of water
              from 1 inch of rainfall.
            </p>
            <p className="text-gray-600">
              Harvested rainwater can be used for irrigation, toilet flushing, and
              other non-potable purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;