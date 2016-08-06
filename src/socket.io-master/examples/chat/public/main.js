$(function () {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
      '#e21400', '#91580f', '#f8a700', '#f78b00',
      '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
      '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('#usernameInput'); // Input for username
    var $password = $("#userpassword");
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box
    var $availableUsers = $('.organizationusers');
    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page
    var $chatWindow = $(".pages.chatwindow");
    // Prompt for setting a username
    var username;
    var upassword;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();
    var socket = io();
    var $isOpenWindow = false;

    function addParticipantsMessage(data) {
        var message = '';
        if (data.numUsers) {
            if (data.numUsers === 1) {
                message += "there's 1 online user";
            } else {
                message += "there are " + data.numUsers + " users";
            }
            log(message);
        }
    }

    // Sets the client's username
    function setUsername(uname, pswd) {
        if ($usernameInput.val() && $password.val()) {
            username = cleanInput($usernameInput.val().trim());
            upassword = cleanInput($password.val().trim());
        }
        else if (uname && pswd) {
            username = uname;
            upassword = pswd;
        }
        // If the username is valid
        if (username && upassword) {
            $loginPage.fadeOut();
            $chatPage.show();
            $loginPage.off('click');
            $currentInput = $inputMessage.focus();

            // Tell the server your username
            socket.emit('add user', username, upassword);
        }
    }

    // Sends a chat message
    function sendMessage() {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $inputMessage.val('');
            addChatMessage({
                username: username,
                message: message
            });
            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', message);
        }
    }

    // Log a message
    function log(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        $messages = $('.messages');
        addMessageElement($el, options);
    }

    // Adds the visual chat message to the message list
    function addChatMessage(data, options) {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var $usernameDiv = $('<span class="username"/>')
          .text(data.username)
          .css('color', getUsernameColor(data.username));
        var $messageBodyDiv = $('<span class="messageBody">')
          .text(data.message);

        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
          .data('username', data.username)
          .addClass(typingClass)
          .append($usernameDiv, $messageBodyDiv);
        $messages = $('.messages');
        addMessageElement($messageDiv, options);
    }




    // Available Users list
    function populateUsersList(data) {
        var $usernameDiv = $('<span id="userspan_' + data.id + '" class="username"/>')
          .text(data.first_name + data.last_name);
        var $messageBodyDiv = $('<span style="display:none;" class="messageBody">')
          .text(data.email);

        var typingClass = '';
        var $messageDiv = $('<li class="message"/>')
          .data('username', data.first_name + ' ' + data.last_name)
          .addClass(typingClass)
          .append($usernameDiv, $messageBodyDiv);
        if ($availableUsers.length > 0)
            $messages = $availableUsers;
        addMessageElement($messageDiv);
    }

    // Adds the visual chat typing message
    function addChatTyping(data) {
        $chatWindow.dialog();
        socket.emit('add user', data.username, "12345678");
        data.typing = true;
        data.message = 'is typing';
        addChatMessage(data);
    }

    // Removes the visual chat typing message
    function removeChatTyping(data) {
        getTypingMessages(data).fadeOut(function () {
            $(this).remove();
        });
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement(el, options) {
        var $el = $(el);
        if ($messages.length == 0) {
            return;
        }
        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // Prevents input from having injected markup
    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }

    // Updates the typing event
    function updateTyping() {
        if (connected) {
            if (!typing) {
                typing = true;
                socket.emit('typing');
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(function () {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing');
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

    // Gets the 'X is typing' messages of a user
    function getTypingMessages(data) {
        return $('.typing.message').filter(function (i) {
            return $(this).data('username') === data.username;
        });
    }

    // Gets the color of a username through our hash function
    function getUsernameColor(username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    // Keyboard events

    $window.keydown(function (event) {
        // Auto-focus the current input when a key is typed
        //if (event.keyCode == 9) {
        //    if ($currentInput.attr('id') == $(event.target).attr('id'))
        //        $currentInput = $password;
        //    else
        //        $currentInput = $usernameInput;
        //}
        //if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        //    $currentInput.focus();
        //}
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username && upassword) {
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else {
                setUsername();
            }
        }
    });

    $inputMessage.on('input', function () {
        updateTyping();
    });

    // Focus input when clicking on the message input's border
    $inputMessage.click(function () {
        $inputMessage.focus();
    });

    // Socket events

    // Whenever the server emits 'login', log the login message
    socket.on('login', function (data) {
        connected = true;
        // Display the welcome message
        var message = "X-Connect";
        log(message, {
            prepend: true
        });
        $.ajax({
            type: "POST",
            data: { username: username, password: upassword },
            dataType: "json",
            url: "http://xconnect.com:3131/api/auth",
            success: function (data) {
                if (data.success && data.token) {
                    $.ajax({
                        url: "http://xconnect.com:3131/api/users",
                        success: function (data) {
                            for (var i = 0; i < data.length; i++) {
                                populateUsersList(data[i]);
                            }
                            $("[id^='userspan_']").off("click").on("click", function () {
                                $isOpenWindow = true;
                                $chatWindow.dialog();
                                //setUsername($(this).text(), "12345678");
                                socket.emit('add user', $(this).parent().find("[id^='usernamespan_']").text(), "12345678");
                            });
                        }
                    });
                    addParticipantsMessage(data);
                }
            }
        });
    });

    $window.on('load', function () {
        //var usrs = data;

        //socket.emit('getUsersList');
        //if ($availableUsers.length > 0 && username) {
            
        //}
        //else {
        //    //addMessageElement($messageDiv);
        //    //setUsername('kaushik', '1234568');
        //}
    });




    socket.on('getUsersListClient', function (data) {
        var avlblUsers = data;
    });
    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
        addChatMessage(data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
        log(data.username + ' joined');
        addParticipantsMessage(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
        if (!$isOpenWindow) {
            log(data.username + ' left');
            addParticipantsMessage(data);
            removeChatTyping(data);
        }
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
        addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
        removeChatTyping(data);
    });
});
