var util = require("util"),
    num = 0;

function chatUsers(room, user, id) {
    this.userSocket = {};
    this.rooms = {
        public: {
            id: 100,
            users: {}
        },
        music: {
            id: 200,
            users: {}
        },
        it: {
            id: 300,
            users: {}
        },
    }
};

var User = {
    status: "",
    timeout: ""
}


chatUsers.prototype.delete = function () {
    delete this.rooms[this.room].users[this.user];
    delete this.userSocket[this.user]
};

function runUsers(users, callback) {
    for (user in users) {
        callbcak(users[user])
    }
};

/*  ////////////////// IN CONSIDERATION //////////////////
chatUsers.prototype.userState = function (time, room, callback) {
    if (this.rooms[room].users) {
        runUsers(this.rooms[room].users, function (data) {
            if (data.status === false && data.timeout >= time) {
                callback(users.rooms[this.room].users[user]);
                delete this.rooms[this.room].users[user];
            } else {
                callback(false);
            }
        })
    }
    callback(false);
};
*/

//!!!!.test mode.!!!!\\
chatUsers.prototype.createRoom = function () {
    this.newRoom.name = this.room;
};
//!!!!!!!!!!!!!!!!!!!\\

///////////////////////////////////////////***************Handler***********///////////////////////////

exports = module.exports = function () {

    this.users = new chatUsers();

    this.rooms = function (callback) {
        callback(Object.keys(this.users.rooms));
    }

    this.message = function (room, data, callback, call) {
        if (data && room) {
            call('message', {
                msg: data,
                room: room
            });
        } else {
            callback("tem de introduzir texto");
        };
    };


    this.privateHandle = function (user, room, data, callback, call) {
        //this.userVerify(socket, room, user, callback)
        if (user in this.users.userSocket && data.length > 0) {
            call('private-msg', {
                msg: data,
                nick: user,
                room: room,
                sender: true
            });
            call('private-msg', {
                msg: data,
                room: room,
                sender: false
            });
            util.log(`user ${user} started "private" with user ${user}`);
        } else {
            if (!this.users.userSocket[user]) {
                callback(false);
                util.log("não tem user");
            } else {
                callback(false);
                util.log("não tem mensagem");
            }
        }
    }

    this.roomVerify = function (room, callback) {
        if (room in this.users.rooms) {
            console.log("novo room ", room);
            callback(true);
        } else {
            callback(false, `O room ${room} não existe...!!!`);
        }
    }
    this.registerUser = function (socket, user, room) {
        ++num;
        this.users.userSocket[user] = socket;
        this.users.rooms[room].users[user] = socket;
        util.log(`user ${num} ${socket.userlogged} logged in room ${socket.room}`);
    }

    this.userVerify = function (socket, user, room, callback) {
        if (user in this.users.rooms[room].users) {                      
            callback({
                user: false,
                msg: `o NickName ${user} já existe`
            });
        } else {          
            callback({
                room: true,
                user: true,
                msg: `bem vindo user ${user} `
            });
         }
    };

    this.disconect = function (room, user, quit, callback) {
        if (quit === "no") {
            delete this.users.rooms[room].users[user];
            callback(Object.keys(this.users.rooms[room].users))
        } else {
            // this.users.delete(room, user)            
            delete this.users.rooms[room].users[user];
            delete this.users.userSocket[user]
            callback(`${user} disconnected ${--num} users online`);
        }
        num--;
    }
}
