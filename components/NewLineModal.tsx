import React, { useState, useEffect } from 'react';
import { LINE_COLORS } from '../constants';

interface NewLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
  defaultName: string;
}

export const NewLineModal: React.FC<NewLineModalProps> = ({ isOpen, onClose, onCreate, defaultName }) => {
  const [name, setName] = useState(defaultName);
  const [color, setColor] = useState(LINE_COLORS[0]);

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setColor(LINE_COLORS[(defaultName.split(' ').length > 1 ? parseInt(defaultName.split(' ')[1], 10) - 1 : 0) % LINE_COLORS.length]);
    }
  }, [isOpen, defaultName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name, color);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Create New Line</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="lineName" className="block text-sm font-medium text-gray-300 mb-1">
              Line Name
            </label>
            <input
              type="text"
              id="lineName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Line Color
            </label>
            <div className="flex flex-wrap gap-3">
              {LINE_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full transition-transform duration-150 ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-medium transition-colors"
            >
              Create Line
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
