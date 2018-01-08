var http = require("http"),
    util = require("util"),
    connect = require("connect"),
    morgan = require("morgan"),
    errorhandler = require("errorhandler"),
    handler = require("./handler"),
    app = connect(),
    port = handler.portVeryfy(process.env.PORT || 3000),
    server = http.createServer(app).listen(port),
    chatServer = require("./chatserver_v1.0.2"),
    appChat;

util.log("listening on port", port);

/*chat handler*/
appChat = new chatServer(server);
appChat.set("private", true);

app.use(function (req, res, nex) {
    handler.urlVerify(res, req.url,
        function (urlv, valid, message) {
            /*app.use chama o objecto handler com o metodo 
            urlverify que asserta a viabilidade do request*/
            if (valid) {
                handler.openUrl(res, urlv);
            } else {
                handler.statusFouro(req, res, message);
            };
        });
});
////////////////////*********logs de serviço e desenvolvimento**********\\\\\\\\\\\\\\\\\\\\\\
/*dev log*/
if (process.env.NODE_ENV === 'development') {
    // only use in development 
    app.use(errorhandler({
        log: errorNotification
    }))
};

function errorNotification(err, str, req) {
    var title = 'Error in ' + req.method + ' ' + req.url
    console.log({
        title: title,
        message: str
    })
};
/*service log*/
app.use(morgan('dev'));
