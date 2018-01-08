var path = require("path"),
    util = require("util"),
    fs = require("fs");
exports = module.exports = new function () {
    this.portVeryfy = function (num) {
            var port = parseInt(num);
            if (!isNaN(port)) {
                return port
            }
            if (isNaN(num)) {
                util.warn("\n\nport", num, "is NAN please insert a number > 0 ")
            }
            return false
        }
        ///*** abrir url ***\\\
    this.openUrl = function (res, urlpath) {

            util.log("urlpath", urlpath)


            var Stream = fs.createReadStream(path.join(__dirname, urlpath))
            if (urlpath.match(/.css$/)) {
                res.writeHead(200, {
                    "Content-Type": "text/css"
                });
            } else if (urlpath.match(/.js$/)) {
                res.writeHead(200, {
                    "Content-Type": "text/javascript"
                });
            } else if (urlpath.match(/.jpg$/)) {
                res.writeHead(200, {
                    "Content-Type": "image/jpeg"
                });
            }
            Stream.pipe(res)
        }
        ///*** verificar url ***\\\
    function pathVerify(url, res, calback) {
        var urlpath = path.join(__dirname, url);
        fs.exists(urlpath, function (exists) {
            if (exists) {
                setTimeout(function () {
                    util.log(urlpath + " 2");
                }, 2000)

                if (urlpath.match(/.ico$/)) {
                    util.error("");
                } else if (fs.lstatSync(urlpath).isFile()) {
                    calback(true);
                } else {
                    calback(false, "É um DIR")
                    util.log(urlpath + " 4")
                }
            } else {
                util.log(urlpath + " 3")
                calback(false, "Não existe")
            }
        });
    }

    function toPublic(res, url, calback) {
        var public = path.join("public", url)
        pathVerify(public, res, function (valid, message) {
            if (valid) {
                calback(public, true);
            } else {
                calback(url, false, message);
            }
        });
    };
    ///*** url local validation ***\\\
    this.urlVerify = function (res, url, calback) {
        var urlv;
        if (url.match(/\?/)) {
            url = url.slice(0, url.indexOf("?"))
        }
        if (url.match(/\/$/)) {
            urlv = path.join(url, "index.html")
        }
        if (url.match(/\/index.html$/)) {
            urlv = url
        }
        if (urlv) {
            var adpath = urlv || url
            var tover = adpath.toString();

            util.log("tover", tover)

            pathVerify(urlv, res, function (valid, message) {
                if (valid) {
                    calback(urlv, true);
                } else {
                    calback(urlv, false, message);
                }
            });
        } else {
            toPublic(res, url, calback)
        };
    };

    var count = 0;

    this.log = function (req, msg) {
        ++count
        if (msg != "BAD") {
            if (msg === "out") {
                util.log(`
                host -- > ${count} ${req.headers["host"]}\n
                referer -- > ${count} ${req.headers["referer"]}\n\n\
                `, req.headers, msg);
            } else {
                console.log(msg)
                count = 0;
            }
        } else {
            console.error(req.headers, msg)
        }
    }

    ///*** status 404***\\\
    this.statusFouro = function (req, res, message) {
        res.writeHead(404, {
            "Content-Type": "text/html"
        });
        res.end(`
<!DOCTYPE html>
<html>
<head>
    <title> ${res.statusCode} </title>
    <meta charset="utf-8">
    <style>
        body {
            font-family: arial;
            font-style: oblique;
            font-size: 30px;
            background-color: chocolate;
        }
    </style>
</head>
<body>
    <center>
        <h1> E R R O R </h1>
        <p> ${req.method} </p>
        <p> ${req.url} </p>
        <p>${message} </p>
        </h3>
        <h1>
        <p> STATUS  </p>
        </h1>
        <h2>
        <p>${res.statusCode}</p>
        </h2> </center>
</body>
</html>
	`);
    };
}
