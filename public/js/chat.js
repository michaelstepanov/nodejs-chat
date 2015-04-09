$(function(){
    // connect to the socket
    var socket = io.connect('/chat');

    $(document).ready(function () {
        socket.emit('new user', newUser);
    });

    $('#form-messages').submit(function(){
        if ($('#message').val() !== '') {
            socket.emit('message', {text: $('#message').val(), time: getTime()});
            $('#message').val('');
        }

        return false;
    });

    $('#message').keypress(function(){
        socket.emit('user is typing');
    });

    socket.on('message', function(msg){
        sendMessage(msg, false);
    });

    socket.on('own message', function(msg){
        sendMessage(msg, true);
    });

    // A user is typing
    socket.on('user is typing', function(user){
        $('#typing > div').show();

        scrollTop();

        var text = '<strong>' + user + '</strong> is typing';

        $('#typing > div').html(text + '...');
        setTimeout(function() { $('#typing > div').html(text + '..'); }, 1000);
        setTimeout(function() { $('#typing > div').html(text + '.'); }, 2000);
        setTimeout(function() {
            $('#typing > div').hide();
        }, 3000);
    });

    // Sets a list of users in the room
    socket.on('users', function(users){
        $('#users > ul').html('');

        $('#users-count span').text(users.length);

        $.each(users, function(index, user) {
            $('#users > ul').append($('<li>').html('<strong>' + user + '</strong>'));
        });
    });

    function getTime() {
        var datetime = new Date();

        var hours = datetime.getHours();
        if (hours < 10) hours = '0' + String(hours);

        var minutes = datetime.getMinutes();
        if (minutes < 10) minutes = '0' + String(minutes);

        var seconds = datetime.getSeconds();
        if (seconds < 10) seconds = '0' + String(seconds);

        return hours + ':' + minutes + ':' + seconds;
    }

    function sendMessage(msg, own) {
        if (msg.type && msg.type === 'disconnect') {
            $('#messages').append($('<div class="row message disconnect bg-danger">').html(
                '<div class="col-xs-10">User <strong>' + msg.user + '</strong> is disconnected</div>' +
                '<div class="col-xs-2 time note-time">' + getTime() + '</div>'
            ));
        } else if (msg.type && msg.type === 'connect') {
            $('#messages').append($('<div class="row message connect bg-success">').html(
                '<div class="col-xs-10">User <strong>' + msg.user + '</strong> is connected</div>' +
                '<div class="col-xs-2 time note-time">' + getTime() + '</div>'
            ));
        } else if (msg.type && msg.type === 'message') {
            var append = own ? '<blockquote class="blockquote-reverse">' : '<blockquote>' ;

            $('#messages').append($('<div class="row">').html(
                '<div class="col-xs-10 message">' +
                append +
                '<h6><small>' + msg.user + '</small></h6>' +
                '<p>' + msg.text + '</p>' +
                '</blockquote>' +
                '</div>' +
                '<div class="col-xs-2 time">' + msg.time + '</div>'
            ));
        }

        scrollTop();
    }

    function scrollTop() {
        $('html, body').scrollTop($('html, body')[0].scrollHeight);
    }
});