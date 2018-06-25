var httpModule = require('../modules/http_module');

exports.init = function (server) {

  server.on('uncaughtException', function (req, res, route, err) {
    console.log(" ");
    console.log("---------------- SERVER UNCAUGHT EXCEPTION BEGIN -------------------");
    console.log("REQ = " + req + ".");
    console.log("RES = " + res + ".");
    console.log("ROUTE = " + route + ".");
    console.log("ERR = " + err + ".");
    console.log("---------------- SERVER UNCAUGHT EXCEPTION END -------------------");
    console.log(" ");
  });


  process.on('uncaughtException', function (req, res, route, err) {
    console.log("UNCAUGHT EXCEPTION ");
    var message = '';
    var stack = '';
    if (err) {
      message = err.message;
      stack = err.stack;
    }
    console.log(" ");
    console.log("---------------- UNCAUGHT EXCEPTION BEGIN -------------------");
    console.log("REQ = " + req + ".");
    console.log("RES = " + res + ".");
    console.log("ROUTE = " + route + ".");
    console.log("ERR = " + err + ".");
    console.log("---------------- UNCAUGHT EXCEPTION END -------------------");
    console.log(" ");
  });

  process.on('unhandledRejection', (err) => {
    console.error(err)
    process.exit(1)
  })

};

function getErrorResponse(url, errorMsg, errorObj) {
  return {
    url: url,
    time: new Date(),
    errorMsg: errorMsg,
    data: errorObj
  };
}