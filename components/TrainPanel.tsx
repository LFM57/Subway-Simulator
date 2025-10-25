
import React from 'react';
import { Station, Line, Train } from '../types';
import { TrainIcon } from './icons';
import { TRAIN_CAPACITY } from '../constants';

interface TrainPanelProps {
  train: Train | null;
  line: Line | null;
  nextStation: Station | null;
  finalStation: Station | null;
  onClose: () => void;
  onDelete: (trainId: string) => void;
}

export const TrainPanel: React.FC<TrainPanelProps> = ({ train, line, nextStation, finalStation, onClose, onDelete }) => {
  if (!train || !line) return null;

  const handleDeleteClick = () => {
    if(train) {
      onDelete(train.id);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-700 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2">
              <TrainIcon />
              Train Details
            </h2>
            <p className="text-xs text-gray-400 font-mono">{train.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="space-y-4 text-sm flex-grow">
          <div className="p-3 bg-gray-900/50 rounded-md">
            <p className="text-gray-400">Line</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: line.color }}></div>
              <p className="font-semibold text-base text-gray-100">{line.name}</p>
            </div>
          </div>

          <div className="p-3 bg-gray-900/50 rounded-md">
            <p className="text-gray-400">Next Station</p>
            <p className="font-semibold text-base text-gray-100">{nextStation?.name || 'N/A'}</p>
          </div>
          
          <div className="p-3 bg-gray-900/50 rounded-md">
            <p className="text-gray-400">Final Destination</p>
            <p className="font-semibold text-base text-gray-100">{finalStation?.name || 'N/A'}</p>
          </div>

          <div className="p-3 bg-gray-900/50 rounded-md">
            <p className="text-gray-400">Passengers</p>
            <div className="flex items-center gap-2">
                <p className="font-semibold text-base text-amber-400">{train.passengers.length} / {TRAIN_CAPACITY}</p>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                    <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${(train.passengers.length / TRAIN_CAPACITY) * 100}%` }}></div>
                </div>
            </div>
          </div>
        </div>
        <div className="w-full h-px bg-gray-600 my-4"></div>
        <button 
            onClick={handleDeleteClick}
            className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Delete Train
        </button>
      </div>
    </div>
  );
};
