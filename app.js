const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Users on the chatroom
var numUsers = 0;

// io.origins(['https://blixter.me:443'])

io.on('connection', function (socket) {
    var addedUser = false;

    // User posted a new message - broadcast to everyone else.
    socket.on('new message', (message, callback) => {
        socket.broadcast.emit('new message', {
            username: socket.username,
            time: message.time,
            message: message.message
        })
        callback();
    });

    // Add user to the current session
    socket.on("add user", (username) => {
        if (addedUser) return;
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });

        //Echo to everyone that the user has connected.
        socket.emit('new message', {
            username: 'admin',
            time: "now",
            message: `${username} has join the chat.`
        });
    });

    // When the user disconnects
    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;

            // Echo to everyone that the user left.
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});

server.listen(8300);
