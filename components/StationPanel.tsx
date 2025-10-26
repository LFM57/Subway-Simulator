import React, { useState, useEffect } from 'react';
import { Station, Line } from '../types';
import { WandIcon, LoadingSpinnerIcon } from './icons';
import { generateStationName } from '../services/geminiService';

interface StationPanelProps {
  station: Station | null;
  allStations: Station[];
  lines: Line[];
  onClose: () => void;
  onRename: (stationId: string, newName: string) => void;
  onDelete: (stationId: string) => void;
}

export const StationPanel: React.FC<StationPanelProps> = ({ station, allStations, lines, onClose, onRename, onDelete }) => {
  const [name, setName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (station) {
      setName(station.name);
    }
  }, [station]);

  const handleRename = () => {
    if (station && name.trim() && name.trim() !== station.name) {
      onRename(station.id, name.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRename();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
        if(station) setName(station.name);
        e.currentTarget.blur();
    }
  };

  const handleGenerateName = async () => {
    if (!station) return;
    setIsGenerating(true);
    try {
      const generatedName = await generateStationName(station, allStations, lines);
      if (generatedName) {
        setName(generatedName);
        onRename(station.id, generatedName);
      }
    } catch (error) {
      console.error("Failed to generate station name:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteClick = () => {
    if(station) {
      onDelete(station.id);
      onClose();
    }
  }

  if (!station) return null;

  const linesThroughStation = lines.filter(line => line.stationIds.includes(station.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-700 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-200">Station Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        
        <div>
            <label htmlFor="stationName" className="block text-sm font-medium text-gray-300 mb-1">
              Station Name
            </label>
            <div className="relative">
                <input
                type="text"
                id="stationName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 pr-10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                    onClick={handleGenerateName}
                    disabled={isGenerating}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-indigo-400 disabled:cursor-not-allowed disabled:text-gray-500 transition-colors"
                    title="Generate name with AI"
                    aria-label="Generate station name with AI"
                >
                    {isGenerating ? <LoadingSpinnerIcon className="h-5 w-5" /> : <WandIcon />}
                </button>
            </div>
        </div>
        
        <div>
            <p className="text-sm font-medium text-gray-300">Passengers Waiting</p>
            <p className="text-2xl font-semibold text-amber-400">{station.passengers.length}</p>
        </div>

        <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Lines Serving Station</h3>
            {linesThroughStation.length > 0 ? (
                <ul className="space-y-2 max-h-32 overflow-y-auto">
                    {linesThroughStation.map(line => (
                        <li key={line.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded-md">
                            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: line.color }}></div>
                            <span className="text-sm text-gray-200">{line.name}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-400 italic">No lines serve this station yet.</p>
            )}
        </div>
        <div className="w-full h-px bg-gray-600 my-2"></div>
         <button 
            onClick={handleDeleteClick}
            className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Delete Station
        </button>
      </div>
    </div>
  );
};
