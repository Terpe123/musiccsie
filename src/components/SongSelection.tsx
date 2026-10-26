import React from 'react';
import { Song, getBestScore } from '../game/musicEngine.ts';
import { Music, Award, Star } from 'lucide-react';

interface SongSelectionProps {
  songs: Song[];
  selectedSongId: string;
  onSelectSong: (songId: string) => void;
}

export const SongSelection: React.FC<SongSelectionProps> = ({
  songs,
  selectedSongId,
  onSelectSong,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full" role="radiogroup" aria-label="曲目選擇">
      {songs.map(song => {
        const isSelected = song.id === selectedSongId;
        const easyBest = getBestScore(song.id, 'easy');
        const hardBest = getBestScore(song.id, 'hard');

        return (
          <button
            key={song.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelectSong(song.id)}
            data-testid={`song-card-${song.id}`}
            className={`
              relative flex flex-col justify-between p-2.5 rounded-xl text-left transition-all duration-200
              border-2 backdrop-blur-sm cursor-pointer
              ${
                isSelected
                  ? 'bg-gradient-to-br from-[#2f3266] to-[#1e2044] border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)] ring-1 ring-amber-300'
                  : 'bg-[#181a38]/80 hover:bg-[#20224a] border-slate-700/60 hover:border-slate-500'
              }
            `}
          >
            {/* Header: Title & Stars */}
            <div className="flex items-start justify-between gap-1 w-full">
              <div>
                <div className="flex items-center gap-1.5 font-serif font-bold text-base text-amber-100">
                  <Music className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="truncate">{song.name}</span>
                </div>
                <div className="text-[11px] text-amber-200/70 font-medium">
                  {song.composer}
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center text-amber-400 text-xs shrink-0 bg-black/30 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-3 h-3 ${
                      idx < song.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* High Scores */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-1.5 mt-1.5 w-full">
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-400" />
                <span>簡單: <b className="text-emerald-300 font-mono">{easyBest}</b></span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-rose-400" />
                <span>困難: <b className="text-rose-300 font-mono">{hardBest}</b></span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
