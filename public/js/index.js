$(function(){
    var socket = io.connect('/');

    var userValidated = false;
    var roomValidated = false;

    $('#form-sign-in').modal();

    $('input').keyup(function() {
        validate();
    });

    if (status === 'key-error') {
        $('#status').show();
        $('#status').addClass('alert alert-danger');
        $('#status').text('Keyword of the room is wrong.');
    } else if (status === 'request-error') {
        $('#status').show().delay(2000).slideUp('slow');
        $('#status').addClass('alert alert-warning');
        $('#status').text('Please set required fields.');
    }

    $("[type='radio']").click(function() {
        $('.variant').hide();
        $('#' + $(this).data('rel')).show();

        $('.variant .room').attr('name', '');
        $('#' + $(this).data('rel') + ' .room').attr('name', 'room');

        if (this.id === 'radio-join-existed-room') {
            socket.emit('get rooms');
        } else {
            socket.emit('check if room exist', $('#new-room').val());

            checkUserInRoom($('#name'), $('#new-room'));
        }
    });

    $('#existed-room').change(function() {
        checkUserInRoom($('#name'), $('#existed-room'));
    });

    $('#new-room').keyup(function() {
        if ($('#radio-create-new-room').is(':checked')) {
            socket.emit('check if room exist', $('#new-room').val());

            checkUserInRoom($('#name'), $('#new-room'));
        }
    });

    $('#name').keyup(function() {
        if ($('#radio-join-existed-room').is(':checked')) {
            checkUserInRoom($('#name'), $('#existed-room'));
        }

        if ($('#radio-create-new-room').is(':checked')) {
            checkUserInRoom($('#name'), $('#new-room'));
        }
    });

    // Validation
    function validate() {
        if ($('#name').val() && userValidated) {
            if ($('#radio-create-new-room').is(':checked')) {
                if ($('#new-room').val() && roomValidated) {
                    $('button').prop('disabled', false);
                    return;
                }
            } else if ($('#radio-join-existed-room').is(':checked')) {
                if ($('#existed-room').val()) {
                    $('button').prop('disabled', false);
                    return;
                }
            }
        }

        $('button').prop('disabled', true);
    }

    function checkUserInRoom(user, room) {
        socket.emit('check user in the room', {
            user: user.val(),
            room: room.val()
        });
    }

    socket.on('rooms', function(rooms) {
        if (rooms.length) {
            $('#rooms-exist').show();
            $('#rooms-not-exist').hide();
            $('#existed-room').html('');

            $.each(rooms, function(index, room) {
                $('#existed-room').append($('<option value="'+room+'">').text(room));
            });

            checkUserInRoom($('#name'), $('#existed-room option:first'));
        } else {
            $('#rooms-not-exist').show();
            $('#rooms-exist').hide();
            $('button').prop('disabled', true);
        }
    });

    socket.on('room exist', function(exist) {
        if (exist) {
            $('#room-exist-alert').show();

            roomValidated = false;
        } else {
            $('#room-exist-alert').hide();

            roomValidated = true;
        }

        validate();
    });

    socket.on('user in the room', function(exist) {
        if (exist) {
            $('#user-exist-alert').show();

            userValidated = false;
        } else {
            $('#user-exist-alert').hide();

            userValidated = true;
        }

        validate();
    });
});