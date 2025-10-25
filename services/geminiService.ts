
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
