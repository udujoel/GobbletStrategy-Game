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

  return (
    <div 
      className={`
        flex flex-col items-center p-4 rounded-2xl transition-all duration-500
        ${isActive ? 'bg-white/90 shadow-xl scale-105 border-2 ' + colorStyle.border : 'bg-white/40 opacity-70 scale-95'}
      `}
    >
      <h3 className={`font-bold text-lg mb-4 ${colorStyle.text}`}>
        {player === PlayerColor.ORANGE ? 'Orange' : 'Blue'}
        {isActive && <span className="ml-2 text-xs uppercase tracking-wider bg-black/10 px-2 py-1 rounded">Turn</span>}
      </h3>

      <div className="flex gap-4 items-end justify-center min-h-[100px]">
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
