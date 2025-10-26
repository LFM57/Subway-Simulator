import React, { useCallback, useEffect, useRef } from 'react';

type GameLoopCallback = (deltaTime: number) => void;

export const useGameLoop = (callback: GameLoopCallback, isRunning: boolean) => {
  // FIX: Corrected useRef typing to allow for undefined, which is the initial state and also used when the loop is stopped.
  const requestRef = useRef<number | undefined>();
  const previousTimeRef = useRef<number | undefined>();

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if(requestRef.current){
         cancelAnimationFrame(requestRef.current);
      }
      previousTimeRef.current = undefined;
    }
    return () => {
        if(requestRef.current){
            cancelAnimationFrame(requestRef.current);
        }
    };
  }, [isRunning, animate]);
};