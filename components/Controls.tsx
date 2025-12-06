import React from 'react';
import { SceneState, ShapeType } from '../types';

interface ControlsProps {
  config: SceneState;
  onChange: (newConfig: Partial<SceneState>) => void;
}

const Controls: React.FC<ControlsProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-4 text-white">
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wider">Shape</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(ShapeType).map((shape) => (
            <button
              key={shape}
              onClick={() => onChange({ shape })}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                config.shape === shape
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {shape.charAt(0).toUpperCase() + shape.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wider">
          Color
        </label>
        <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg">
          <input
            type="color"
            value={config.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
          />
          <span className="text-sm font-mono text-gray-300">{config.color}</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wider">
          Speed ({config.speed.toFixed(1)}x)
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={config.speed}
          onChange={(e) => onChange({ speed: parseFloat(e.target.value) })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wider">
            Roughness
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.roughness}
            onChange={(e) => onChange({ roughness: parseFloat(e.target.value) })}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
         <div>
           <label className="block text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wider">
            Metalness
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.metalness}
            onChange={(e) => onChange({ metalness: parseFloat(e.target.value) })}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
         <span className="text-sm text-gray-300">Wireframe Mode</span>
         <button 
            onClick={() => onChange({ wireframe: !config.wireframe })}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${config.wireframe ? 'bg-green-500' : 'bg-gray-700'}`}
         >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${config.wireframe ? 'translate-x-6' : 'translate-x-0'}`} />
         </button>
      </div>
    </div>
  );
};

export default Controls;