self.addEventListener('fetch', event => {
    event.respondWith(
      fetch(event.request.url + '.br', { headers: { 'Accept-Encoding': 'br' } })
      .then(response => {
        const reader = response.body.getReader();
        return new ReadableStream({
          start(controller) {
            return pump();
            function pump() {
              return reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(new Uint8Array(value));
                return pump();
              });
            }
          }
        })
      })
      .then(stream => {
        return new Response(stream, {
          headers: { 'Content-Encoding': 'gzip' } // Pretend it's gzip
        });
      })
      .catch(e => fetch(event.request)) // Fallback to the uncompressed version
    );
  });
  