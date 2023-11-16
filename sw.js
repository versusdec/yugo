self.addEventListener('install', (event) => {

});

self.addEventListener('activate', (event) => {

});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'POST') {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                        // Cache hit - return response
                        if (response) {
                            return response;
                        }
                        return fetch(event.request);
                    }
                )
        );
    }
});

self.addEventListener('push', (event) => {


    // TODO
    // var title = 'Yay a message.';
    // var body = 'We have received a push message.';
    // var icon = '/images/icon-192x192.png';
    // var tag = 'simple-push-demo-notification-tag';

    // event.waitUntil(
    //   self.registration.showNotification(title, {
    //     body: body,
    //     icon: icon,
    //     tag: tag
    //   })
    // );
});

self.addEventListener('notificationclick', (event) => {


    // TODO
    // Android doesn't close the notification when you click on it
    // See: http://crbug.com/463146
    // event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    // event.waitUntil(
    //   clients.matchAll({
    //     type: "window"
    //   })
    //   .then(function(clientList) {
    //     for (var i = 0; i < clientList.length; i++) {
    //       var client = clientList[i];
    //       if (client.url == '/' && 'focus' in client)
    //         return client.focus();
    //     }
    //     if (clients.openWindow) {
    //       return clients.openWindow('/');
    //     }
    //   })
    // );
});