self.addEventListener('push', function (e) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        //notifications aren't supported or permission not granted!
        return;
    }

    if (e.data) {
        var msg = e.data.json();
        console.log(msg)
        var options = {
            body: msg.body,
            icon: msg.icon
        };
        if (msg.actions && msg.actions.length > 0) {
            options.actions = msg.actions;
        }
        e.waitUntil(self.registration.showNotification(msg.title, options));
    }
});


self.addEventListener('notificationclick', function (e) {
    if (e.action.length > 0) {
        self.clients.openWindow(e.action);
    }
});
