
import React from 'react';
import { Tool, Line } from '../types';
import { StationIcon, TrackIcon, PlayIcon, PauseIcon, ResetIcon, SelectIcon, DeleteIcon } from './icons';

interface ToolbarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  resetGame: () => void;
  lines: Line[];
  activeLineId: string | null;
  setActiveLineId: (id: string) => void;
  addNewLine: () => void;
  addTrainToActiveLine: () => void;
  canAddTrain: boolean;
  onDeleteLine: (lineId: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  isRunning,
  setIsRunning,
  resetGame,
  lines,
  activeLineId,
  setActiveLineId,
  addNewLine,
  addTrainToActiveLine,
  canAddTrain,
  onDeleteLine,
}) => {
  // FIX: Explicitly typed ToolButton as a React.FC to resolve a typing issue with the `children` prop.
  interface ToolButtonProps {
    tool: Tool;
    children: React.ReactNode;
  }
  const ToolButton: React.FC<ToolButtonProps> = ({ tool, children }) => (
    <button
      onClick={() => setActiveTool(tool)}
      className={`p-3 rounded-lg transition-colors duration-200 ${
        activeTool === tool ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
      } ${activeTool === tool && tool !== 'delete' ? '!bg-indigo-500' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="absolute top-4 left-4 z-10 p-2 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-xl shadow-lg flex flex-col gap-4">
      <div className="flex flex-col gap-2 p-2">
        <h3 className="font-bold text-sm text-gray-300 px-1">TOOLS</h3>
        <ToolButton tool="select"><SelectIcon /></ToolButton>
        <ToolButton tool="station"><StationIcon /></ToolButton>
        <ToolButton tool="track"><TrackIcon /></ToolButton>
        <ToolButton tool="delete"><DeleteIcon /></ToolButton>
      </div>

      <div className="w-full h-px bg-gray-600"></div>

      <div className="flex flex-col gap-2 p-2">
        <h3 className="font-bold text-sm text-gray-300 px-1">SIMULATION</h3>
        <div className="flex gap-2">
          <button onClick={() => setIsRunning(!isRunning)} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
            {isRunning ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={resetGame} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
            <ResetIcon />
          </button>
        </div>
      </div>

       <div className="w-full h-px bg-gray-600"></div>

       <div className="flex flex-col gap-2 p-2">
        <h3 className="font-bold text-sm text-gray-300 px-1">LINES</h3>
         {lines.map(line => (
          <div key={line.id} className="group flex items-center">
            <button
              onClick={() => setActiveLineId(line.id)}
              className={`flex-grow flex items-center gap-2 p-2 rounded-l-lg transition-colors duration-200 ${
                activeLineId === line.id ? 'bg-indigo-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: line.color }}></div>
              <span className="text-sm">{line.name}</span>
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onDeleteLine(line.id); }}
                className={`p-2 rounded-r-lg bg-gray-700 text-gray-400 hover:bg-red-600 hover:text-white transition-colors duration-200 ${
                  activeLineId === line.id ? 'bg-indigo-500' : ''
                }`}
                title={`Delete ${line.name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
         ))}
        <button onClick={addNewLine} className="p-2 mt-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg">
          + New Line
        </button>
        {activeLineId && (
            <button
                onClick={addTrainToActiveLine}
                disabled={!canAddTrain}
                className="p-2 mt-1 text-sm bg-teal-600 hover:bg-teal-500 rounded-lg disabled:bg-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                title={!canAddTrain ? "Line must have at least 2 stations to add a train" : "Add train to selected line"}
            >
                + Add Train
            </button>
        )}
       </div>
    </div>
  );
};
