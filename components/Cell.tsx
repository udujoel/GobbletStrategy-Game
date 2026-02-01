import React from 'react';
import { CellStack } from '../types';
import GobbletPiece from './GobbletPiece';
import { getTopPiece } from '../services/gameLogic';

interface CellProps {
  row: number;
  col: number;
  stack: CellStack;
  onClick: () => void;
  isValidTarget: boolean;
  disabled: boolean;
}

const Cell: React.FC<CellProps> = ({ stack, onClick, isValidTarget, disabled }) => {
  const topPiece = getTopPiece(stack);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center
        w-24 h-24 md:w-32 md:h-32
        bg-amber-100/50 backdrop-blur-sm
        border-4 border-amber-900/10 rounded-xl
        shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)]
        transition-all duration-200
        ${isValidTarget ? 'bg-green-100/60 ring-4 ring-green-400/50 scale-[1.02]' : ''}
        ${disabled && !topPiece ? 'cursor-default' : 'cursor-pointer hover:bg-amber-100/80'}
      `}
    >
        {/* Concentric Circles Background (Placement Markers) */}
        {!topPiece && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
             <div className="w-[70%] h-[70%] rounded-full border-2 border-amber-800"></div>
             <div className="absolute w-[40%] h-[40%] rounded-full border-2 border-amber-800"></div>
          </div>
        )}

        {/* Render only top piece physically */}
        {topPiece && (
            <div className="z-10 animate-in zoom-in duration-300">
                <GobbletPiece 
                    color={topPiece.color} 
                    size={topPiece.size} 
                />
            </div>
        )}
    </button>
  );
};

export default Cell;
