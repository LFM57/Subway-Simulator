import { GoogleGenAI, Type } from "@google/genai";
import { Station, Line, GameEvent } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development and should not happen in the production environment
  console.warn("API_KEY is not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generateEventPrompt = (stations: Station[], lines: Line[]): string => {
  const stationNames = stations.map(s => s.name).join(', ') || 'No stations yet';
  const lineNames = lines.map(l => l.name).join(', ') || 'No lines yet';

  return `
    You are a creative event generator for a subway simulator game.
    Generate a random event that could happen in a subway system.
    The event should have a title, a brief description, a duration in game ticks (between 300 and 1000), and a specific effect on the game.

    Available stations: ${stationNames}
    Available lines: ${lineNames}

    Possible event effects are:
    1. 'PASSENGER_SURGE': A sudden increase of passengers at a specific station.
       - 'payload' should contain 'stationId' (pick one from the list) and 'multiplier' (a number between 2 and 5).
    2. 'SPEED_CHANGE': Trains on a specific line speed up or slow down.
       - 'payload' should contain 'lineId' (pick one from the list) and 'multiplier' (a number between 0.5 for slower and 1.5 for faster).
    3. 'STATION_CLOSURE': A specific station is temporarily closed.
       - 'payload' should contain 'stationId' (pick one from the list).

    Constraints:
    - Only generate events for existing stations and lines. If there are no stations or lines, you can return a simple event like a weather announcement that has no mechanical effect (e.g., type 'PASSENGER_SURGE' with multiplier 1).
    - Ensure the JSON is well-formed.
    - Be creative with the titles and descriptions!
  `;
};

export const generateGameEvent = async (stations: Station[], lines: Line[]): Promise<GameEvent | null> => {
  if (!API_KEY) return null;
  if (stations.length === 0 || lines.length === 0) return null;

  const validStations = stations.map(s => ({ id: s.id, name: s.name }));
  const validLines = lines.map(l => ({ id: l.id, name: l.name }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: generateEventPrompt(stations, lines),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            duration: { type: Type.INTEGER },
            effect: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['PASSENGER_SURGE', 'SPEED_CHANGE', 'STATION_CLOSURE'] },
                payload: {
                  type: Type.OBJECT,
                  properties: {
                    // FIX: Removed `nullable: true` as it's not a standard part of the schema definition provided in the guidelines.
                    // Properties are optional by default if not listed in a `required` array.
                    stationId: { type: Type.STRING },
                    lineId: { type: Type.STRING },
                    multiplier: { type: Type.NUMBER },
                  },
                },
              },
            },
          },
        },
      },
    });

    const jsonString = response.text;
    const eventData = JSON.parse(jsonString);

    // Validate that the returned IDs are valid
    if (eventData.effect.payload.stationId && !validStations.find(s => s.id === eventData.effect.payload.stationId)) {
      eventData.effect.payload.stationId = validStations[Math.floor(Math.random() * validStations.length)]?.id;
    }
     if (eventData.effect.payload.lineId && !validLines.find(l => l.id === eventData.effect.payload.lineId)) {
      eventData.effect.payload.lineId = validLines[Math.floor(Math.random() * validLines.length)]?.id;
    }

    return eventData as GameEvent;

  } catch (error) {
    console.error("Error generating game event with Gemini:", error);
    return null;
  }
};


export const generateStationName = async (
  targetStation: Station,
  allStations: Station[],
  lines: Line[]
): Promise<string | null> => {
  if (!API_KEY) return null;

  const existingNames = allStations.filter(s => s.id !== targetStation.id).map(s => s.name).join(', ') || 'None';
  const linesThroughStation = lines.filter(line => line.stationIds.includes(targetStation.id));
  const lineCount = linesThroughStation.length;

  let isCentral = false;
  if (allStations.length > 2) {
    const sumX = allStations.reduce((acc, s) => acc + s.x, 0);
    const sumY = allStations.reduce((acc, s) => acc + s.y, 0);
    const centerX = sumX / allStations.length;
    const centerY = sumY / allStations.length;

    const distances = allStations.map(s => Math.sqrt(Math.pow(s.x - centerX, 2) + Math.pow(s.y - centerY, 2)));
    const maxDistance = Math.max(...distances);
    
    const targetDistance = Math.sqrt(Math.pow(targetStation.x - centerX, 2) + Math.pow(targetStation.y - centerY, 2));

    // If it's in the most central 30% of stations
    if (maxDistance > 0 && targetDistance < maxDistance * 0.3) {
      isCentral = true;
    }
  }

  const prompt = `
    You are a creative name generator for stations in a subway simulator game.
    Your task is to generate a single, appropriate name for a specific station based on its characteristics.

    Existing station names that you should try to avoid duplicating: ${existingNames}

    The station to be named has these characteristics:
    - Connectivity: It is served by ${lineCount} line(s).
    - Location: It is located ${isCentral ? 'near the city center' : 'in an outer area'}.

    Naming guidelines:
    - If the station is a major hub (2 or more lines) AND is centrally located, suggest a name for a major landmark, square, or central transit hub. Examples: "Grand Central", "Union Square", "Market Street", "City Hall".
    - If the station has only one line and is not central, suggest a plausible street name. Examples: "Oak Street", "Maple Avenue", "42nd Street".
    - If it's a mix (e.g., central with one line, or a hub in an outer area), be creative. It could be a park, a specific district, or a smaller landmark. Examples: "Riverside Park", "University Heights", "East Market".
    - AVOID generating a name for a major landmark (like "City Hall" or "Grand Central") if a similar name already exists in the list of existing station names. Be creative and find an alternative.

    The name should be concise and sound like a real subway station.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The generated station name." },
          },
          required: ['name'],
        },
      },
    });

    const jsonString = response.text;
    const data = JSON.parse(jsonString);
    return data.name;

  } catch (error) {
    console.error("Error generating station name with Gemini:", error);
    return null;
  }
};
