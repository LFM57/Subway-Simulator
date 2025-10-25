
import React from 'react';
import { GameEvent } from '../types';
import { BrainCircuitIcon } from './icons';


interface InfoPanelProps {
  gameTime: number;
  totalPassengers: number;
  passengersServed: number;
  avgWaitTime: number;
  activeEvent: (GameEvent & { remaining: number }) | null;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  gameTime,
  totalPassengers,
  passengersServed,
  avgWaitTime,
  activeEvent
}) => {
  const formatTime = (time: number) => {
    const totalSeconds = Math.floor(time / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `Day ${days}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const formatWaitTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0s';
    return `${(time / 1000).toFixed(1)}s`;
  }

  return (
    <div className="absolute top-4 right-4 z-10 p-4 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-xl shadow-lg w-72 flex flex-col gap-4 text-sm">
        <div>
            <h3 className="font-bold text-lg text-gray-200">System Status</h3>
            <p className="text-indigo-400 font-mono">{formatTime(gameTime)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div>
                <p className="text-gray-400">Passengers Waiting</p>
                <p className="text-xl font-semibold">{totalPassengers}</p>
            </div>
            <div>
                <p className="text-gray-400">Passengers Served</p>
                <p className="text-xl font-semibold">{passengersServed}</p>
            </div>
            <div>
                <p className="text-gray-400">Avg. Wait Time</p>
                <p className="text-xl font-semibold">{formatWaitTime(avgWaitTime)}</p>
            </div>
        </div>
        
        {activeEvent && (
            <div className="mt-2 p-3 bg-indigo-900/50 rounded-lg border border-indigo-500">
                <div className="flex items-center font-bold text-indigo-300">
                    <BrainCircuitIcon />
                    <p>AI Event: {activeEvent.title}</p>
                </div>
                <p className="text-xs text-gray-300 mt-1">{activeEvent.description}</p>
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                    <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${(activeEvent.remaining / activeEvent.duration) * 100}%` }}></div>
                </div>
            </div>
        )}
    </div>
  );
};
