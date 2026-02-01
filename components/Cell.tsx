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
        {/* Render only top piece physically, but maybe show hint of stack count? */}
        {topPiece && (
            <div className="z-10 animate-in zoom-in duration-300">
                <GobbletPiece 
                    color={topPiece.color} 
                    size={topPiece.size} 
                />
            </div>
        )}

        {/* Shadow/Depth placeholder if empty */}
        {!topPiece && (
            <div className="w-4 h-4 rounded-full bg-amber-900/10 shadow-inner" />
        )}
    </button>
  );
};

export default Cell;
