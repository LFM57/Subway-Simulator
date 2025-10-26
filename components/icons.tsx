import React from 'react';

export const StationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {/* FIX: Corrected SVG attributes to camelCase */}
    <path strokeLineCap="round" strokeLineJoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const TrackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {/* FIX: Corrected SVG attributes to camelCase */}
    <path strokeLineCap="round" strokeLineJoin="round" strokeWidth={2} d="M4 4v16m16-16v16M4 16h16M4 8h16" />
  </svg>
);

export const SelectIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLineJoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.832.168l-1.618 1.618M21.75 12h-2.25m-1.332 5.832l-1.618-1.618M12 21.75v-2.25M6.168 18.332l-1.618 1.618M2.25 12h2.25M6.168 7.332L4.55 5.714" />
    </svg>
);

export const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);


export const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* FIX: Corrected SVG attributes to camelCase */}
        <path strokeLineCap="round" strokeLineJoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        {/* FIX: Corrected SVG attributes to camelCase */}
        <path strokeLineCap="round" strokeLineJoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* FIX: Corrected SVG attributes to camelCase */}
        <path strokeLineCap="round" strokeLineJoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* FIX: Corrected SVG attributes to camelCase */}
        <path strokeLineCap="round" strokeLineJoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
    </svg>
);

export const BrainCircuitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {/* FIX: Corrected SVG attributes to camelCase */}
    <path strokeLineCap="round" strokeLineJoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export const TrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.243 8.758A13.437 13.437 0 0112 5.25c2.94 0 5.69.932 8.01 2.518M4.5 12.75a13.437 13.437 0 0015 0M3.243 15.242a13.437 13.437 0 008.01 2.518c2.94 0 5.69-.932 8.01-2.518M12 21a8.25 8.25 0 00-8.25-8.25H3a.75.75 0 000 1.5h.75A8.25 8.25 0 0012 21zm0 0a8.25 8.25 0 018.25-8.25H21a.75.75 0 010 1.5h-.75A8.25 8.25 0 0112 21z" />
    </svg>
);

export const WandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a2.25 2.25 0 01-1.451-1.451L12 18.75l1.938-.648a2.25 2.25 0 011.451-1.451L17.25 15l.648 1.938a2.25 2.25 0 011.451 1.451L21 18.75l-1.938.648a2.25 2.25 0 01-1.451 1.451z" />
    </svg>
);

export const LoadingSpinnerIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
