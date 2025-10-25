
import React from 'react';
import { Station, Line, Train, Tool } from '../types';
import { TILE_SIZE, STATION_RADIUS } from '../constants';

interface MapProps {
  stations: Station[];
  lines: Line[];
  trains: Train[];
  onMapClick: (x: number, y: number) => void;
  onStationClick: (stationId: string) => void;
  onTrainClick: (trainId: string) => void;
  tool: Tool;
  tempLineStart: string | null;
  selectedTrainId: string | null;
}

export const Map: React.FC<MapProps> = ({
  stations,
  lines,
  trains,
  onMapClick,
  onStationClick,
  onTrainClick,
  tool,
  tempLineStart,
  selectedTrainId,
}) => {
  // FIX: Use `window.Map` to avoid naming collision with the `Map` component itself.
  const stationMap = new window.Map<string, Station>(stations.map(s => [s.id, s]));

  const getTrainPositionAndAngle = (train: Train) => {
    const line = lines.find(l => l.id === train.lineId);
    if (!line || line.stationIds.length < 2) return null;

    let fromIndex = train.currentStationIndex;
    let toIndex = fromIndex + train.direction;

    // This can happen when a train is at the terminal and about to turn around
    if (toIndex < 0 || toIndex >= line.stationIds.length) {
        // To prevent crash, let's keep it at the station until next game tick corrects direction
        toIndex = fromIndex;
    }

    const fromStation = stationMap.get(line.stationIds[fromIndex]);
    const toStation = stationMap.get(line.stationIds[toIndex]);

    if (!fromStation || !toStation) return null;

    const x = fromStation.x + (toStation.x - fromStation.x) * train.progress;
    const y = fromStation.y + (toStation.y - fromStation.y) * train.progress;
    
    let angle = 0;
    if (toStation.x !== fromStation.x || toStation.y !== fromStation.y) {
       angle = Math.atan2(toStation.y - fromStation.y, toStation.x - fromStation.x) * (180 / Math.PI);
    }
    
    return { x, y, angle };
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const { x, y } = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    onMapClick(x, y);
  };
  
  const handleStationClick = (e: React.MouseEvent<SVGGElement>, stationId: string) => {
    e.stopPropagation();
    onStationClick(stationId);
  }

  const handleTrainClick = (e: React.MouseEvent<SVGGElement>, trainId: string) => {
    e.stopPropagation();
    onTrainClick(trainId);
  }

  const getCursorClass = () => {
    switch(tool) {
      case 'station':
      case 'track':
        return 'cursor-crosshair';
      case 'select':
      case 'delete':
        return 'cursor-default';
      default:
        return 'cursor-default';
    }
  }
  
  const getStationCursor = () => {
     switch(tool) {
      case 'select':
      case 'track':
        return "cursor-pointer";
      case 'delete':
        return "cursor-pointer"; // Could be custom later
      default:
        return "";
    }
  }
  
    const getTrainCursor = () => {
     switch(tool) {
      case 'select':
      case 'delete':
        return "cursor-pointer";
      default:
        return "";
    }
  }


  return (
    <div className={`w-full h-full bg-gray-800 ${getCursorClass()} overflow-hidden`}>
      <svg width="100%" height="100%" onClick={handleClick}>
        <defs>
          <pattern id="grid" width={TILE_SIZE} height={TILE_SIZE} patternUnits="userSpaceOnUse">
            <path d={`M ${TILE_SIZE} 0 L 0 0 0 ${TILE_SIZE}`} fill="none" stroke="rgba(107, 114, 128, 0.2)" strokeWidth="1"/>
          </pattern>
           <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        <filter id="delete-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feComponentTransfer in="coloredBlur" result="hotterBlur">
                <feFuncA type="linear" slope="2"></feFuncA>
            </feComponentTransfer>
            <feMerge>
                <feMergeNode in="hotterBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Draw lines */}
        {lines.map(line => (
          <g key={line.id}>
            {line.stationIds.slice(0, -1).map((stationId, index) => {
              const startStation = stationMap.get(stationId);
              const endStation = stationMap.get(line.stationIds[index + 1]);
              if (!startStation || !endStation) return null;
              return (
                <line
                  key={`${line.id}-${index}`}
                  x1={startStation.x}
                  y1={startStation.y}
                  x2={endStation.x}
                  y2={endStation.y}
                  stroke={line.color}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        ))}

        {/* Draw stations */}
        {stations.map(station => {
            const linesThroughStation = lines.filter(line => line.stationIds.includes(station.id)).length;
            const isBigStation = linesThroughStation >= 2;
            const radius = isBigStation ? STATION_RADIUS * 1.4 : STATION_RADIUS;
            const strokeWidth = isBigStation ? 4 : 3;
            
            return (
              <g key={station.id} onClick={(e) => handleStationClick(e, station.id)} className={`${getStationCursor()} group`}>
                {/* Hitbox */}
                <circle
                  cx={station.x}
                  cy={station.y}
                  r={radius * 1.5}
                  fill="transparent"
                />
                {/* Visible station */}
                <circle
                  cx={station.x}
                  cy={station.y}
                  r={radius}
                  fill="#E5E7EB"
                  stroke={isBigStation ? '#a855f7' : '#1F2937'}
                  strokeWidth={strokeWidth}
                  className={tool === 'delete' ? 'group-hover:stroke-red-500' : ''}
                  style={{ filter: tool === 'delete' ? 'url(#delete-glow)' : 'none' }}
                />
                 <text x={station.x} y={station.y + radius + 12} fontSize="10" fill="#CBD5E1" textAnchor="middle">{station.name}</text>
                 <text x={station.x} y={station.y - radius - 5} fontSize="12" fill="#FBBF24" textAnchor="middle" fontWeight="bold">
                    {station.passengers.length}
                </text>
              </g>
            );
        })}
        
        {/* Draw trains */}
        {trains.map(train => {
            const pos = getTrainPositionAndAngle(train);
            if (!pos) return null;
            const line = lines.find(l => l.id === train.lineId);
            const isSelected = train.id === selectedTrainId;
            return (
                <g 
                    key={train.id}
                    transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.angle})`}
                    onClick={(e) => handleTrainClick(e, train.id)}
                    className={`${getTrainCursor()} group`}
                    style={{ filter: isSelected ? 'url(#glow)' : 'none' }}
                >
                    <polygon
                        points="-10,-5 8,-5 12,0 8,5 -10,5"
                        fill={line?.color || '#FFFFFF'}
                        stroke={isSelected ? '#FFFFFF' : '#111827'}
                        strokeWidth="2"
                        className={tool === 'delete' ? 'group-hover:stroke-red-500' : ''}
                        style={{ filter: tool === 'delete' ? 'url(#delete-glow)' : 'none' }}
                    />
                    <text x="0" y="3.5" fontSize="8" fill={isSelected ? '#FFFFFF' : '#111827'} textAnchor="middle" fontWeight="bold" transform={`rotate(${-pos.angle})`}>
                        {train.passengers.length}
                    </text>
                </g>
            )
        })}
      </svg>
    </div>
  );
};
