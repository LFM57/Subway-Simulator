
import React, { useState, useCallback, useEffect } from 'react';
import { Map } from './components/Map';
import { Toolbar } from './components/Toolbar';
import { InfoPanel } from './components/InfoPanel';
import { NewLineModal } from './components/NewLineModal';
import { StationPanel } from './components/StationPanel';
import { TrainPanel } from './components/TrainPanel';
import { Station, Line, Train, Passenger, Tool, GameEvent } from './types';
import { useGameLoop } from './hooks/useGameLoop';
import { TILE_SIZE, TRAIN_SPEED, PASSENGER_SPAWN_RATE, BASE_STATION_CAPACITY, TRAIN_CAPACITY, EVENT_CHECK_INTERVAL } from './constants';
import { generateGameEvent } from './services/geminiService';

const App: React.FC = () => {
    const [stations, setStations] = useState<Station[]>([]);
    const [lines, setLines] =useState<Line[]>([]);
    const [trains, setTrains] = useState<Train[]>([]);
    const [activeTool, setActiveTool] = useState<Tool>('station');
    const [isRunning, setIsRunning] = useState(false);
    const [gameTime, setGameTime] = useState(0);
    const [tempLineStart, setTempLineStart] = useState<string | null>(null);
    const [activeLineId, setActiveLineId] = useState<string | null>(null);
    const [passengersServed, setPassengersServed] = useState(0);
    const [totalWaitTime, setTotalWaitTime] = useState(0);
    const [activeEvent, setActiveEvent] = useState<(GameEvent & { remaining: number }) | null>(null);
    const [isNewLineModalOpen, setIsNewLineModalOpen] = useState(false);
    const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
    const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);


    // FIX: Use `window.Map` to avoid naming collision with the imported `Map` component.
    const stationMap = new window.Map<string, Station>(stations.map(s => [s.id, s]));

    const resetGame = useCallback(() => {
        setIsRunning(false);
        setStations([]);
        setLines([]);
        setTrains([]);
        setGameTime(0);
        setActiveTool('station');
        setTempLineStart(null);
        setActiveLineId(null);
        setPassengersServed(0);
        setTotalWaitTime(0);
        setActiveEvent(null);
        setSelectedStationId(null);
        setSelectedTrainId(null);
        // Show new line modal on reset
        setIsNewLineModalOpen(true);
    }, []);

    const handleAddNewLineClick = useCallback(() => {
        setIsNewLineModalOpen(true);
    }, []);

    const handleCreateLine = useCallback((name: string, color: string) => {
        const newLine: Line = {
            id: `line-${Date.now()}`,
            name,
            color,
            stationIds: [],
        };
        setLines(prev => [...prev, newLine]);
        setActiveLineId(newLine.id);
        setActiveTool('track');
        setIsNewLineModalOpen(false);
    }, []);
    
    const addTrainToActiveLine = useCallback(() => {
        if (!activeLineId) return;
        const line = lines.find(l => l.id === activeLineId);
        if (!line || line.stationIds.length < 2) return;

        setTrains(prev => [...prev, {
            id: `tr-${Date.now()}`,
            lineId: activeLineId,
            currentStationIndex: 0,
            progress: 0,
            passengers: [],
            direction: 1,
        }]);
    }, [activeLineId, lines]);

    useEffect(() => {
        // On initial load, if there are no lines, open the modal to prompt the user to create one.
        if (lines.length === 0) {
            setIsNewLineModalOpen(true);
        }
    }, []);

    const handleDeleteLine = (lineId: string) => {
        setLines(prev => prev.filter(l => l.id !== lineId));
        setTrains(prev => prev.filter(t => t.lineId !== lineId));
        if (activeLineId === lineId) {
            setActiveLineId(lines.length > 1 ? lines.find(l => l.id !== lineId)!.id : null);
        }
    };

    const handleDeleteStation = (stationId: string) => {
        if (selectedStationId === stationId) {
            setSelectedStationId(null);
        }

        const linesToDelete = new Set<string>();
        const updatedLines = lines.map(line => {
            if (!line.stationIds.includes(stationId)) {
                return line;
            }
            const newStationIds = line.stationIds.filter(id => id !== stationId);
            if (newStationIds.length < 2) {
                linesToDelete.add(line.id);
                return null;
            }
            return { ...line, stationIds: newStationIds };
        }).filter((line): line is Line => line !== null);

        setLines(updatedLines);

        if (linesToDelete.size > 0) {
            setTrains(prev => prev.filter(train => !linesToDelete.has(train.lineId)));
        }

        setStations(prev => prev.filter(s => s.id !== stationId));

        // Clean up passengers in remaining stations/trains who were destined for the deleted station
        setStations(prev => prev.map(station => ({
            ...station,
            passengers: station.passengers.filter(p => p.destinationId !== stationId)
        })));
        setTrains(prev => prev.map(train => ({
            ...train,
            passengers: train.passengers.filter(p => p.destinationId !== stationId)
        })));
    };

    const handleDeleteTrain = (trainId: string) => {
        if (selectedTrainId === trainId) {
            setSelectedTrainId(null);
        }
        setTrains(prev => prev.filter(t => t.id !== trainId));
    };

    const handleMapClick = (x: number, y: number) => {
        if (activeTool === 'station') {
            const snappedX = Math.round(x / TILE_SIZE) * TILE_SIZE;
            const snappedY = Math.round(y / TILE_SIZE) * TILE_SIZE;
            const name = `Station ${stations.length + 1}`;
            const newStation: Station = { id: `st-${Date.now()}`, name, x: snappedX, y: snappedY, passengers: [] };
            setStations(prev => [...prev, newStation]);
        } else if (activeTool === 'select') {
            setSelectedStationId(null);
            setSelectedTrainId(null);
        }
    };
    
    const handleStationClick = (stationId: string) => {
        if (activeTool === 'delete') {
            handleDeleteStation(stationId);
            return;
        }

        if (activeTool === 'select') {
            setSelectedStationId(stationId);
            setSelectedTrainId(null);
            return;
        }

        if (activeTool === 'track' && activeLineId) {
            const lineIndex = lines.findIndex(l => l.id === activeLineId);
            if (lineIndex === -1) return;
            const line = lines[lineIndex];

            // Avoid adding same station twice in a row
            if (line.stationIds.length > 0 && line.stationIds[line.stationIds.length - 1] === stationId) {
                setTempLineStart(null); // Cancel temp line if clicking the same station
                return;
            }

            // Extend the line
            line.stationIds.push(stationId);

            setLines([...lines]);
            setTempLineStart(null);
        }
    };

    const handleTrainClick = (trainId: string) => {
        if (activeTool === 'delete') {
            handleDeleteTrain(trainId);
            return;
        }

        if (activeTool === 'select') {
            setSelectedTrainId(trainId);
            setSelectedStationId(null);
        }
    };

    const handleRenameStation = (stationId: string, newName: string) => {
        setStations(prevStations =>
            prevStations.map(station =>
                station.id === stationId ? { ...station, name: newName } : station
            )
        );
    };

    const updateGame = useCallback((deltaTime: number) => {
        setGameTime(prev => prev + deltaTime);

        let eventEffectMultiplier = 1;
        if(activeEvent?.effect.type === 'PASSENGER_SURGE') {
             eventEffectMultiplier = activeEvent.effect.payload.multiplier || 1;
        }

        // 1. Spawn passengers
        if (stations.length > 1) {
            const stationCount = stations.length;
            const sumX = stations.reduce((acc, s) => acc + s.x, 0);
            const sumY = stations.reduce((acc, s) => acc + s.y, 0);
            const centerX = sumX / stationCount;
            const centerY = sumY / stationCount;

            const distances = stations.map(s => Math.sqrt(Math.pow(s.x - centerX, 2) + Math.pow(s.y - centerY, 2)));
            const maxDistance = Math.max(...distances, 1); // Avoid division by zero

            let hasChanges = false;
            const newPassengersByStation: Record<string, Passenger[]> = {};

            stations.forEach(station => {
                const linesThrough = lines.filter(l => l.stationIds.includes(station.id)).length;
                const capacity = linesThrough >= 2 ? BASE_STATION_CAPACITY * 2 : BASE_STATION_CAPACITY;

                if (station.passengers.length < capacity) {
                    const distFromCenter = Math.sqrt(Math.pow(station.x - centerX, 2) + Math.pow(station.y - centerY, 2));
                    // Centralization boosts spawn rate for stations closer to the geographic center of the system.
                    // Factor ranges from 0.5 (farthest) to 1.5 (closest).
                    const centralizationFactor = 1.5 - (distFromCenter / maxDistance);
                    
                    // Connectivity boosts spawn rate for stations with more lines.
                    const connectivityFactor = 1 + (linesThrough * 0.5);

                    // Check for active passenger surge event
                    let eventSpawnMultiplier = 1;
                    if(activeEvent?.effect.type === 'PASSENGER_SURGE' && activeEvent.effect.payload.stationId === station.id) {
                        eventSpawnMultiplier = eventEffectMultiplier;
                    }

                    const spawnChance = PASSENGER_SPAWN_RATE * centralizationFactor * connectivityFactor * eventSpawnMultiplier;

                    if (Math.random() < spawnChance) {
                        let destinationIndex = Math.floor(Math.random() * stations.length);
                        let originIndex = stations.findIndex(s => s.id === station.id);
                        while (originIndex === destinationIndex) {
                            destinationIndex = Math.floor(Math.random() * stations.length);
                        }
                        const destination = stations[destinationIndex];
                        
                        const newPassenger: Passenger = {
                            id: `ps-${Date.now()}-${Math.random()}`,
                            originId: station.id,
                            destinationId: destination.id,
                            spawnTime: gameTime,
                        };
                        
                        if (!newPassengersByStation[station.id]) {
                            newPassengersByStation[station.id] = [];
                        }
                        newPassengersByStation[station.id].push(newPassenger);
                        hasChanges = true;
                    }
                }
            });
            
            if (hasChanges) {
                setStations(currentStations => currentStations.map(s => {
                    if (newPassengersByStation[s.id]) {
                        return { ...s, passengers: [...s.passengers, ...newPassengersByStation[s.id]] };
                    }
                    return s;
                }));
            }
        }
        
        // 2. Update trains
        setTrains(currentTrains => currentTrains.map(train => {
            const line = lines.find(l => l.id === train.lineId);
            if (!line || line.stationIds.length < 2) return train;

            let speedMultiplier = 1;
             if(activeEvent?.effect.type === 'SPEED_CHANGE' && activeEvent.effect.payload.lineId === line.id) {
                speedMultiplier = activeEvent.effect.payload.multiplier || 1;
            }

            const newProgress = train.progress + TRAIN_SPEED * speedMultiplier;

            if (newProgress >= 1) {
                // Arrived at station
                const nextStationIndex = train.currentStationIndex + train.direction;
                const arrivedStation = stationMap.get(line.stationIds[nextStationIndex]);
                if (!arrivedStation) return train;

                // a. Alight passengers
                const remainingPassengers = train.passengers.filter(p => {
                    if (p.destinationId !== arrivedStation.id) {
                        return true;
                    }
                    setPassengersServed(s => s + 1);
                    setTotalWaitTime(t => t + (gameTime - p.spawnTime));
                    return false;
                });

                // b. Determine new direction before boarding
                let newDirection = train.direction;
                if (train.direction === 1 && nextStationIndex >= line.stationIds.length - 1) {
                    newDirection = -1; // Reached end of line
                } else if (train.direction === -1 && nextStationIndex <= 0) {
                    newDirection = 1; // Reached start of line
                }
                
                // c. Board passengers based on the new direction
                setStations(currentStations => {
                    const stationIndex = currentStations.findIndex(s => s.id === arrivedStation.id);
                    if (stationIndex === -1) return currentStations;

                    const station = currentStations[stationIndex];
                    const passengersToBoard: Passenger[] = [];
                    
                    const passengersStaying = station.passengers.filter(p => {
                        const destinationIndexOnLine = line.stationIds.indexOf(p.destinationId);

                        if (destinationIndexOnLine === -1) return true; // Destination not on this line

                        const isGoingWithTrain = newDirection === 1
                            ? destinationIndexOnLine > nextStationIndex
                            : destinationIndexOnLine < nextStationIndex;

                        const canBoard = (remainingPassengers.length + passengersToBoard.length < TRAIN_CAPACITY) && isGoingWithTrain;
                        
                        if (canBoard) {
                            passengersToBoard.push(p);
                            return false;
                        }
                        return true;
                    });
                    
                    if (passengersToBoard.length > 0) {
                        const newStations = [...currentStations];
                        newStations[stationIndex] = { ...station, passengers: passengersStaying };
                        
                        const trainIndex = trains.findIndex(t => t.id === train.id);
                        if (trainIndex !== -1) {
                             const newTrain = {
                                ...train,
                                currentStationIndex: nextStationIndex,
                                progress: 0,
                                passengers: [...remainingPassengers, ...passengersToBoard],
                                direction: newDirection,
                            };
                            setTrains(prevTrains => {
                                const newTrains = [...prevTrains];
                                newTrains[trainIndex] = newTrain;
                                return newTrains;
                            })
                        }
                        return newStations;
                    }
                    return currentStations;
                });

                return {
                    ...train,
                    currentStationIndex: nextStationIndex,
                    progress: 0,
                    passengers: [...remainingPassengers],
                    direction: newDirection,
                };

            } else {
                return { ...train, progress: newProgress };
            }
        }).filter(Boolean) as Train[]);
        
        // 3. Update active event
        if (activeEvent) {
            const remaining = activeEvent.remaining - deltaTime;
            if (remaining <= 0) {
                setActiveEvent(null);
            } else {
                setActiveEvent({ ...activeEvent, remaining });
            }
        }

    }, [gameTime, stations, lines, activeEvent, stationMap, addTrainToActiveLine, trains]);

    useGameLoop(updateGame, isRunning);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(async () => {
            if (!activeEvent) {
                const event = await generateGameEvent(stations, lines);
                if (event) {
                    setActiveEvent({ ...event, remaining: event.duration });
                }
            }
        }, EVENT_CHECK_INTERVAL);

        return () => clearInterval(interval);
    }, [isRunning, activeEvent, stations, lines]);
    
    const totalPassengers = stations.reduce((sum, s) => sum + s.passengers.length, 0) + trains.reduce((sum, t) => sum + t.passengers.length, 0);
    const avgWaitTime = passengersServed > 0 ? totalWaitTime / passengersServed : 0;

    const activeLine = lines.find(l => l.id === activeLineId);
    const canAddTrain = !!activeLine && activeLine.stationIds.length >= 2;
    const selectedStation = stations.find(s => s.id === selectedStationId) || null;
    const selectedTrain = trains.find(t => t.id === selectedTrainId) || null;
    
    // Data for Train Panel
    const selectedTrainLine = selectedTrain ? lines.find(l => l.id === selectedTrain.lineId) : null;
    let nextStation: Station | null = null;
    let finalStation: Station | null = null;
    if (selectedTrain && selectedTrainLine) {
        const nextStationIndex = selectedTrain.currentStationIndex + selectedTrain.direction;
        if(nextStationIndex >= 0 && nextStationIndex < selectedTrainLine.stationIds.length) {
            nextStation = stationMap.get(selectedTrainLine.stationIds[nextStationIndex]) || null;
        }

        const finalStationIndex = selectedTrain.direction === 1 ? selectedTrainLine.stationIds.length - 1 : 0;
        finalStation = stationMap.get(selectedTrainLine.stationIds[finalStationIndex]) || null;
    }
    
    return (
        <div className="w-screen h-screen relative font-sans">
            <Toolbar
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                isRunning={isRunning}
                setIsRunning={setIsRunning}
                resetGame={resetGame}
                lines={lines}
                activeLineId={activeLineId}
                setActiveLineId={setActiveLineId}
                addNewLine={handleAddNewLineClick}
                addTrainToActiveLine={addTrainToActiveLine}
                canAddTrain={canAddTrain}
                onDeleteLine={handleDeleteLine}
            />
            <InfoPanel 
                gameTime={gameTime}
                totalPassengers={totalPassengers}
                passengersServed={passengersServed}
                avgWaitTime={avgWaitTime}
                activeEvent={activeEvent}
            />
            <Map 
                stations={stations} 
                lines={lines} 
                trains={trains}
                onMapClick={handleMapClick}
                onStationClick={handleStationClick}
                onTrainClick={handleTrainClick}
                tool={activeTool}
                tempLineStart={tempLineStart}
                selectedTrainId={selectedTrainId}
            />
            <NewLineModal
                isOpen={isNewLineModalOpen}
                onClose={() => setIsNewLineModalOpen(false)}
                onCreate={handleCreateLine}
                defaultName={`Line ${lines.length + 1}`}
            />
            <StationPanel
                station={selectedStation}
                lines={lines}
                onClose={() => setSelectedStationId(null)}
                onRename={handleRenameStation}
                onDelete={handleDeleteStation}
            />
            <TrainPanel
                train={selectedTrain}
                line={selectedTrainLine}
                nextStation={nextStation}
                finalStation={finalStation}
                onClose={() => setSelectedTrainId(null)}
                onDelete={handleDeleteTrain}
            />
        </div>
    );
};

export default App;
