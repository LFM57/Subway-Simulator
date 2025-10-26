import React from 'react';
import { Line, Train } from '../types';
import { ChartBarIcon } from './icons';

interface LineStatsPanelProps {
  lines: Line[];
  trains: Train[];
  lineStats: Record<string, { passengersServed: number }>;
}

export const LineStatsPanel: React.FC<LineStatsPanelProps> = ({ lines, trains, lineStats }) => {
  const stats = lines.map(line => {
    const trainCount = trains.filter(t => t.lineId === line.id).length;
    const served = lineStats[line.id]?.passengersServed || 0;
    return { ...line, trainCount, served };
  }).sort((a, b) => b.served - a.served);

  return (
    <div className="p-4 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-xl shadow-lg flex flex-col gap-3 text-sm">
        <div>
            <h3 className="font-bold text-lg text-gray-200 flex items-center gap-2">
                <ChartBarIcon />
                Line Performance
            </h3>
        </div>
        <div className="flex flex-col gap-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
            {stats.length === 0 && <p className="text-gray-400 italic">No lines built yet.</p>}
            {stats.map(line => (
                <div key={line.id} className="bg-gray-900/50 p-2 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2 truncate">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: line.color }}></div>
                            <span className="font-semibold truncate" title={line.name}>{line.name}</span>
                        </div>
                        <span className="text-gray-400 text-xs whitespace-nowrap">{line.trainCount} train(s)</span>
                    </div>
                    <div className="text-right">
                        <span className="font-bold text-lg text-indigo-400">{line.served.toLocaleString()}</span>
                        <span className="text-gray-400 text-xs"> served</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
