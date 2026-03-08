'use client';

import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('Ready');

  const launchFullscreen = async () => {
    try {
      setStatus('Registering Service Worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/scramjet/',
      });
      console.log('SW registered:', registration);

      setStatus('Setting up Bare-Mux...');
      const { BareMuxConnection } = await import('@mercuryworkshop/bare-mux');
      const connection = new BareMuxConnection('/bare-mux/worker.js');
      
      setStatus('Configuring Transport...');
      // Use epoxy transport with wisp
      await connection.setTransport('/epoxy/index.mjs', [{ wisp: `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/wisp/` }]);

      setStatus('Opening nowgg.fun...');
      
      const url = 'https://nowgg.fun';
      const encodedUrl = encodeURIComponent(url);
      const proxyUrl = `/scramjet/${encodedUrl}`;
      
      // Open in fullscreen iframe or new window
      const win = window.open('about:blank', '_blank');
      if (win) {
        win.document.body.style.margin = '0';
        win.document.body.style.height = '100vh';
        const iframe = win.document.createElement('iframe');
        iframe.style.border = 'none';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.margin = '0';
        iframe.src = proxyUrl;
        win.document.body.appendChild(iframe);
      } else {
        setStatus('Popup blocked! Please allow popups.');
      }
      
    } catch (err) {
      console.error(err);
      setStatus('Error: ' + (err as Error).message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-950 text-zinc-50">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold tracking-tight">NowGG Proxy Launcher</h1>
        <p className="text-zinc-400">Status: {status}</p>
        <button
          onClick={launchFullscreen}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg"
        >
          Launch in Fullscreen
        </button>
      </div>
    </main>
  );
}
