import React from 'react';
import { PieceSize, PlayerColor, PlayerSupply as IPlayerSupply } from '../types';
import { COLORS } from '../constants';
import GobbletPiece from './GobbletPiece';

interface PlayerSupplyProps {
  player: PlayerColor;
  supply: IPlayerSupply;
  isActive: boolean;
  onSelectPiece: (size: PieceSize) => void;
  selectedSize: PieceSize | null;
  isHuman: boolean; // If false (AI), disable interaction
}

const PlayerSupply: React.FC<PlayerSupplyProps> = ({ 
  player, 
  supply, 
  isActive, 
  onSelectPiece, 
  selectedSize,
  isHuman 
}) => {
  const colorStyle = COLORS[player];
  const isOrange = player === PlayerColor.ORANGE;

  // Defines the glow color based on player
  const glowClass = isOrange 
    ? 'shadow-[0_0_20px_rgba(249,115,22,0.6)] border-orange-400' 
    : 'shadow-[0_0_20px_rgba(59,130,246,0.6)] border-blue-400';

  return (
    <div 
      className={`
        flex flex-col items-center p-4 rounded-2xl transition-all duration-500 relative
        ${isActive 
          ? `bg-white/90 scale-105 border-2 ${glowClass} ring-1 ring-white/50 animate-[pulse_3s_ease-in-out_infinite]` 
          : 'bg-white/40 opacity-70 scale-95 border-2 border-transparent'}
      `}
    >
      <h3 className={`font-bold text-lg mb-4 ${colorStyle.text} flex items-center gap-2`}>
        {isOrange ? 'Orange' : 'Blue'}
        {isActive && !isHuman && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">Thinking...</span>}
        {isActive && isHuman && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded animate-bounce">Your Turn</span>}
      </h3>

      <div className="flex gap-4 items-end justify-center min-h-[80px]">
        {([PieceSize.SMALL, PieceSize.MEDIUM, PieceSize.LARGE] as PieceSize[]).map((size) => {
          const count = supply[size];
          const isSelected = selectedSize === size;
          
          return (
            <button
              key={size}
              onClick={() => isHuman && isActive && count > 0 && onSelectPiece(size)}
              disabled={!isActive || !isHuman || count === 0}
              className={`
                relative group flex flex-col items-center
                transition-transform duration-200
                ${isSelected ? '-translate-y-4' : ''}
                ${count === 0 ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}
              `}
            >
              <GobbletPiece 
                color={player} 
                size={size} 
                className={`${isSelected ? 'ring-4 ring-offset-2 ' + colorStyle.ring : ''}`}
              />
              
              {/* Badge for Count */}
              <div className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md z-20">
                x{count}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerSupply;
