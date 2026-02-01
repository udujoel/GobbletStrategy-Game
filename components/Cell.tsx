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
        relative grid place-items-center
        w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-28 lg:h-28
        bg-amber-100/50 backdrop-blur-sm
        border-4 border-amber-900/10 rounded-xl
        shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)]
        transition-all duration-200
        ${isValidTarget ? 'bg-green-100/60 ring-4 ring-green-400/50 scale-[1.02]' : ''}
        ${disabled && !topPiece ? 'cursor-default' : 'cursor-pointer hover:bg-amber-100/80'}
      `}
    >
        {/* Concentric Circles Background (Placement Markers) */}
        {stack.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
             <div className="w-[70%] h-[70%] rounded-full border-2 border-amber-800"></div>
             <div className="absolute w-[40%] h-[40%] rounded-full border-2 border-amber-800"></div>
          </div>
        )}

        {/* Render stack of pieces to allow smooth 'gobble' transitions */}
        {stack.map((piece, index) => {
            const isTop = index === stack.length - 1;
            return (
                <div 
                    key={piece.id} 
                    className={`col-start-1 row-start-1 ${isTop ? 'animate-zoom-in' : ''}`}
                    style={{ zIndex: index + 1 }}
                >
                    <GobbletPiece 
                        color={piece.color} 
                        size={piece.size} 
                    />
                </div>
            );
        })}
    </button>
  );
};

export default Cell;