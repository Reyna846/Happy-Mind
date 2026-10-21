import type React from 'react';
export function Icon({name, size=22}:{name:string;size?:number}) { const paths:Record<string,React.ReactNode>={
conversation:<><path d="M20 11a8 8 0 0 1-8 8H8l-4 3 1-6a8 8 0 1 1 15-5Z"/><g fill="currentColor" stroke="none"><circle cx="8" cy="11" r=".85"/><circle cx="12" cy="11" r=".85"/><circle cx="16" cy="11" r=".85"/></g></>,
cat:<><path d="m5 9-1-6 7 4h2l7-4-1 6a8 8 0 1 1-14 0Z"/><path d="m9 14 1 .5m4-.5 1 .5m-4 3 1 1 1-1M4 15l-3-1m3 4-3 1m19-4 3-1m-3 4 3 1"/></>,moon:<path d="M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15Z"/>,
leaf:<><path d="M19 4C9 2 3 8 5 14c2 7 13 6 14-10Z"/><path d="m4 21 10-11"/></>,
settings:<><circle cx="12" cy="12" r="3"/><path d="m9 3-1 3-3 1-2 3 2 2-1 4 3 1 2 4 3-1 3 1 2-4 3-1-1-4 2-2-2-3-3-1-1-3Z"/></>,
sound:<><path d="m11 4-6 5H2v6h3l6 5Z"/><path d="M15 8q5 4 0 8M18 4q9 8 0 16"/></>,mute:<><path d="m11 4-6 5H2v6h3l6 5Z"/><path d="m16 9 5 6m0-6-5 6"/></>,
mic:<><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></>,
arrow:<path d="M5 12h14m-5-5 5 5-5 5"/>,back:<path d="M19 12H5m5-5-5 5 5 5"/>,
flow:<><path d="M2 7q5-5 10 0t10 0M2 12q5-5 10 0t10 0M2 17q5-5 10 0t10 0"/></>,
chat:<path d="M20 11a8 8 0 0 1-8 8H5l-4 3 2-7a8 8 0 1 1 17-4Z"/>,
close:<path d="m6 6 12 12M6 18 18 6"/>,sun:<><circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></>,
headphones:<><path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/></>,
};return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.leaf}</svg>; }
