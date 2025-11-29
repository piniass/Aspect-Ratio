import React from 'react';
import { AspectRatio } from '../types';

interface RatioButtonProps {
  ratio: AspectRatio;
  selected: boolean;
  onClick: (ratio: AspectRatio) => void;
  disabled: boolean;
}

const RatioButton: React.FC<RatioButtonProps> = ({ ratio, selected, onClick, disabled }) => {
  return (
    <button
      onClick={() => onClick(ratio)}
      disabled={disabled}
      className={`
        relative overflow-hidden group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
        ${selected 
          ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/50 text-white' 
          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-750'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
        {/* Simple visual representation of ratio */}
        <div 
          className={`border-2 rounded-sm ${selected ? 'border-white' : 'border-current'}`}
          style={{
            width: '24px',
            height: ratio === '1:1' ? '24px' 
                  : ratio === '9:16' ? '42px' 
                  : ratio === '16:9' ? '13.5px'
                  : ratio === '3:4' ? '32px'
                  : '18px' // 4:3
          }} 
        />
      </div>
      <span className="text-xs font-semibold tracking-wider">{ratio}</span>
    </button>
  );
};

export default RatioButton;