var rooms = {};

// Export a function, so that we can pass
// the app and io instances from the app.js file:
module.exports = function(app,io){

    app.get('/', function(req, res){
        var status = (typeof req.query.status !== 'undefined') ? req.query.status : false;
        res.render('index', {status: status});
    });

    app.get('/chat', function(req, res){
        res.redirect('/?status=request-error');
    });

    app.post('/chat', function(req, res){
        var newUser = req.body;

        if (newUser['is-new-room'] === 'false') {
            if (typeof rooms[newUser.room] !== 'undefined' &&
                rooms[newUser.room].keyword !== '' &&
                rooms[newUser.room].keyword !== newUser.keyword)
            {
                res.redirect('/?status=key-error');
            }
        }

        res.render('chat', {newUser: req.body});
    });

    io.of('/').on('connection', function (socket){
        socket.on('get rooms', function(){
            var roomNames = [];

            for (var roomName in rooms) {
                roomNames.push(roomName);
            }

            io.of('/').emit('rooms', roomNames);
        });

        socket.on('check if room exist', function(room){
            var exist = typeof rooms[room] !== 'undefined';

            io.of('/').emit('room exist', exist);
        });

        socket.on('check user in the room', function(data){
            var exist = false;

            if (typeof rooms[data.room] !== 'undefined') {
                for (var index in rooms[data.room].users) {
                    if (rooms[data.room].users[index] === data.user) {
                        exist = true;
                        break;
                    }
                }
            }

            io.of('/').emit('user in the room', exist);
        });
    });

    io.of('/chat').on('connection', function(socket){
        var room = {};
        var user = {};

        // New user joined the room
        socket.on('new user', function(form){
            console.dir(form);

            user.name = form.name;
            room.name = form.room;

            if (form['is-new-room'] === 'true') {
                rooms[room.name] = {
                    keyword: form['new-keyword'],
                    users: []
                };
            }

            socket.join(room.name);

            rooms[room.name].users.push(user.name);

            io.of('/chat').in(room.name).emit('users', rooms[room.name].users);

            socket.broadcast.to(room.name).emit('message', {
                user: user.name,
                type: 'connect'
            });
        });

        // Somebody sent a message
        socket.on('message', function(msg){
            var message = {
                user: user.name,
                text: msg.text,
                type: 'message',
                time: msg.time
            };

            socket.broadcast.to(room.name).emit('message', message);
            socket.emit('own message', message);
        });

        // User in the room is typing a message
        socket.on('user is typing', function(){
            socket.broadcast.to(room.name).emit('user is typing', user.name);
        });

        // Somebody left the chat
        socket.on('disconnect', function(){
            if (!Object.keys(rooms).length) return false;

            for(var index in rooms[room.name].users){
                if (rooms[room.name].users[index] === user.name) {
                    rooms[room.name].users.splice(index, 1);
                }
            }

            // If there are users in the room
            if (rooms[room.name].users.length) {
                io.of('/chat').in(room.name).emit('users', rooms[room.name].users);
                io.of('/chat').in(room.name).emit('message', {
                    user: user.name,
                    type: 'disconnect'
                });

            // If there are no users in the room
            } else {
                // Remove the room
                delete rooms[room.name];
            }
        });
    });
};