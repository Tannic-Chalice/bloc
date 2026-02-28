const { Server } = require('socket.io');

let io;

module.exports = {
    /**
     * Initialize Socket.IO with the HTTP server.
     * Call this once from server.js after creating the http server.
     */
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });

        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });

            socket.on('message', (data) => {
                console.log('Received message:', data);
                socket.broadcast.emit('message', data);
            });
        });

        return io;
    },

    /**
     * Get the current Socket.IO instance.
     * Throws if called before init().
     */
    getIO: () => {
        if (!io) {
            throw new Error('Socket.IO has not been initialized. Call init() first.');
        }
        return io;
    },
};
