import React from 'react';
import { PieceSize, PlayerColor } from '../types';
import { COLORS, SIZE_CLASSES } from '../constants';

interface GobbletPieceProps {
  color: PlayerColor;
  size: PieceSize;
  className?: string;
  isGhost?: boolean; // For drag/hover previews if implemented, or inactive state
}

const GobbletPiece: React.FC<GobbletPieceProps> = ({ color, size, className = '', isGhost = false }) => {
  const colorStyles = COLORS[color];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div
      className={`
        relative rounded-full flex items-center justify-center transition-all duration-300
        ${sizeClass}
        ${className}
        ${isGhost ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {/* 3D Body */}
      <div 
        className={`
          absolute inset-0 rounded-full 
          bg-gradient-to-br ${colorStyles.gradient}
          shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_-4px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.4)]
          border border-opacity-20 border-white
        `}
      />
      
      {/* Inner Cap Detail (gives it the "gobbler" hollow look) */}
      <div 
        className={`
          absolute top-[15%] w-[60%] h-[60%] rounded-full 
          bg-gradient-to-b from-white/20 to-transparent
          opacity-50 blur-[1px]
        `} 
      />
      
      {/* Decorative Ring/Detail */}
      <div 
        className={`
          absolute w-[40%] h-[40%] rounded-full 
          border-2 border-white/20 shadow-inner
        `} 
      />
    </div>
  );
};

export default GobbletPiece;
