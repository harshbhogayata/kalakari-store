import React, { useState, useEffect } from 'react';

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  currentMin: number;
  currentMax: number;
  onRangeChange: (min: number, max: number) => void;
  className?: string;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  minPrice,
  maxPrice,
  currentMin,
  currentMax,
  onRangeChange,
  className = ''
}) => {
  const [minValue, setMinValue] = useState(currentMin);
  const [maxValue, setMaxValue] = useState(currentMax);

  useEffect(() => {
    setMinValue(currentMin);
    setMaxValue(currentMax);
  }, [currentMin, currentMax]);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, maxValue - 100);
    setMinValue(newMin);
    onRangeChange(newMin, maxValue);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, minValue + 100);
    setMaxValue(newMax);
    onRangeChange(minValue, newMax);
  };

  const percentage = {
    min: ((minValue - minPrice) / (maxPrice - minPrice)) * 100,
    max: ((maxValue - minPrice) / (maxPrice - minPrice)) * 100
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between text-sm text-gray-600">
        <span>₹{minValue.toLocaleString()}</span>
        <span>₹{maxValue.toLocaleString()}</span>
      </div>
      
      <div className="relative">
        <div className="relative h-2 bg-gray-200 rounded-lg">
          <div
            className="absolute h-2 bg-primary-500 rounded-lg"
            style={{
              left: `${percentage.min}%`,
              width: `${percentage.max - percentage.min}%`
            }}
          />
        </div>
        
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={minValue}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          style={{ zIndex: 2 }}
        />
        
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={maxValue}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          style={{ zIndex: 2 }}
        />
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .slider-thumb::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .slider-thumb::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `
      }} />
    </div>
  );
};

export default PriceRangeSlider;
