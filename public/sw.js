importScripts('/bare-mux/worker.js');
importScripts('/scramjet/scramjet.codecs.js');
importScripts('/scramjet/scramjet.config.js');
importScripts('/scramjet/scramjet.bundle.js');
importScripts('/scramjet/scramjet.worker.js');

const scramjet = new ScramjetServiceWorker();

self.addEventListener('fetch', (event) => {
    event.respondWith(
        (async () => {
            if (scramjet.route(event)) {
                return await scramjet.fetch(event);
            }
            return await fetch(event.request);
        })()
    );
});
