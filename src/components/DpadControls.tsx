import React from 'react';
import { Direction, ARROWS, DIR_NAMES, DIR_COLORS } from '../game/musicEngine.ts';

interface DpadControlsProps {
  onInput: (dir: Direction) => void;
  activeDir: Direction | null;
  disabled?: boolean;
}

export const DpadControls: React.FC<DpadControlsProps> = ({
  onInput,
  activeDir,
  disabled = false,
}) => {
  const getButtonStyles = (dir: Direction) => {
    const isActive = activeDir === dir;
    const color = DIR_COLORS[dir];

    return `
      relative flex flex-col items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-2xl
      font-bold text-white transition-all duration-100 select-none shadow-lg
      focus:outline-none focus:ring-2 focus:ring-amber-400
      ${
        isActive
          ? 'scale-95 brightness-125 ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.6)]'
          : 'hover:brightness-110 active:scale-95'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 my-2">
      {/* Up Button */}
      <div className="flex justify-center">
        <button
          type="button"
          aria-label={`指揮朝上 (${DIR_NAMES.up})`}
          data-dir="up"
          data-testid="dpad-up"
          disabled={disabled}
          onClick={() => onInput('up')}
          className={getButtonStyles('up')}
          style={{
            backgroundColor: activeDir === 'up' ? DIR_COLORS.up : '#1e293b',
            border: `2px solid ${activeDir === 'up' ? '#ffffff' : DIR_COLORS.up}`,
          }}
        >
          <span className="text-2xl leading-none" style={{ color: activeDir === 'up' ? '#ffffff' : DIR_COLORS.up }}>
            {ARROWS.up}
          </span>
          <span className="text-[10px] text-slate-300 font-mono mt-0.5">W / ↑</span>
        </button>
      </div>

      {/* Left, Down, Right Row */}
      <div className="flex items-center justify-center gap-2">
        {/* Left */}
        <button
          type="button"
          aria-label={`指揮朝左 (${DIR_NAMES.left})`}
          data-dir="left"
          data-testid="dpad-left"
          disabled={disabled}
          onClick={() => onInput('left')}
          className={getButtonStyles('left')}
          style={{
            backgroundColor: activeDir === 'left' ? DIR_COLORS.left : '#1e293b',
            border: `2px solid ${activeDir === 'left' ? '#ffffff' : DIR_COLORS.left}`,
          }}
        >
          <span className="text-2xl leading-none" style={{ color: activeDir === 'left' ? '#ffffff' : DIR_COLORS.left }}>
            {ARROWS.left}
          </span>
          <span className="text-[10px] text-slate-300 font-mono mt-0.5">A / ←</span>
        </button>

        {/* Down */}
        <button
          type="button"
          aria-label={`指揮朝下 (${DIR_NAMES.down})`}
          data-dir="down"
          data-testid="dpad-down"
          disabled={disabled}
          onClick={() => onInput('down')}
          className={getButtonStyles('down')}
          style={{
            backgroundColor: activeDir === 'down' ? DIR_COLORS.down : '#1e293b',
            border: `2px solid ${activeDir === 'down' ? '#ffffff' : DIR_COLORS.down}`,
          }}
        >
          <span className="text-2xl leading-none" style={{ color: activeDir === 'down' ? '#ffffff' : DIR_COLORS.down }}>
            {ARROWS.down}
          </span>
          <span className="text-[10px] text-slate-300 font-mono mt-0.5">S / ↓</span>
        </button>

        {/* Right */}
        <button
          type="button"
          aria-label={`指揮朝右 (${DIR_NAMES.right})`}
          data-dir="right"
          data-testid="dpad-right"
          disabled={disabled}
          onClick={() => onInput('right')}
          className={getButtonStyles('right')}
          style={{
            backgroundColor: activeDir === 'right' ? DIR_COLORS.right : '#1e293b',
            border: `2px solid ${activeDir === 'right' ? '#ffffff' : DIR_COLORS.right}`,
          }}
        >
          <span className="text-2xl leading-none" style={{ color: activeDir === 'right' ? '#ffffff' : DIR_COLORS.right }}>
            {ARROWS.right}
          </span>
          <span className="text-[10px] text-slate-300 font-mono mt-0.5">D / →</span>
        </button>
      </div>
    </div>
  );
};
