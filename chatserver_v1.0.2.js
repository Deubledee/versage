var util = require("util"),
    chathandler = require("./chathandler"),
    num = 0;

var handler = new chathandler();

exports = module.exports = function (server) {
    //socket io instance created
    var io = require("socket.io")(server);
    //app chat set function
    this.set = function (what, valid) {

        if (what === "private" && valid === true) { //set private to true oe falser
            var private = true;
            util.log(`${what} chat is set to ${private}`);
        } else {
            var private = false;
            util.log(`${what} chat is set to ${private}`);
        };
   
        ////////////////////////CHATSERVER/////////////////////////
        io.on('connection', function (socket) {
            var count = 0;
            //logged users emitter
            function loggedUsers(itemRoom, user) {
                console.log("itemRoom", itemRoom, count++)
                io.to(itemRoom).emit('loggedusers',
                    Object.keys(handler.users.rooms[itemRoom].users),
                    user,
                    Object.keys(handler.users.rooms),
                    itemRoom
                );
            };

            //connect to s room and log users
            socket.on("chatRoom", function (user, room, callback) {
                handler.roomVerify(room, function (valid) {
                    if (valid) {
                        socket.room = room;
                        socket.join(room);
                        handler.userVerify(socket, user, room, function (data) {
                            if (data.user === true) {
                                socket.userlogged = user;
                                handler.registerUser(socket, user, room);
                                callback(data);
                                loggedUsers(room, socket.userlogged);
                                util.log(user, "joined", socket.room);
                                count = 0;
                            } else {
                                socket.userlogged = false;
                                socket.leave(room , function (err) {
                                    util.log("user inválid", user, "leaving room", room)
                                    if (err) {
                                        util.log(err)
                                    }
                                });
                                callback(data)
                            }
                        })
                    } else {
                        callback(data)
                    }
                })
            });

            // send chat mesages
            socket.on('send-message', function (room, data, callback) {
                handler.message(room, data, callback, function (event, data) {
                    io.sockets.in(room).emit("message", data, socket.userlogged)
                    util.log("message to", room)
                    console.log(`'${event}'`, data, room, socket.userlogged)
                })
            });

            //send private messages
            socket.on('private', function (user, room, data, callback) {
                if (private === true) {
                    if (data) {
                        util.log("private valid")
                        handler.privateHandle(user, room, data, callback, function (event, data) {
                            if (data.sender) {
                                socket.emit(event, data);
                            } else {
                                handler.users.rooms[room].users[user].emit(event, data, socket.userlogged)
                            }
                        })
                    } else {
                        callback(false);
                    }
                } else {
                    callback(false);
                }
            });
            //leave room handler
            socket.on('leaveRoom', function (room, callback) {
                if (socket.userlogged != undefined) {
                    handler.roomVerify(room, function (valid, msg) {
                        if (valid) {
                            var prevRoom = socket.room;
                            socket.leave(socket.room, function (err) {
                                if (!err) {
                                    handler.disconect(prevRoom, socket.userlogged, "no", function (str) {
                                        loggedUsers(prevRoom, socket.userlogged);
                                        console.log("prevRoom", prevRoom)
                                        callback(true);
                                    })
                                } else {
                                    callback(false, "did not leave room")
                                    util.log(err);
                                };
                            })
                        } else {
                            callback(false, msg)
                            util.log("room is", valid)
                        }
                    })
                };
            });
            //disconect listener
            socket.on('disconnect', function () {
                if (socket.userlogged != undefined) {
                    socket.leave(socket.room);
                    handler.disconect(socket.room, socket.userlogged, true, function (msg) {
                        util.log(msg)
                        loggedUsers(socket.room, socket.userlogged);
                    });
                }
            });
            util.log(`host connected`);
        });
    };
}
