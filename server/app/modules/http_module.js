var http = require('http');
var request = require('request');
// We need this to build our post string
var queryString = require('querystring');
var url = require('url');
var extend = require('extend');
var requestPromise = require('request-promise');
var _responseStatus = {
    OK: {
        code: 200,
        message: 'Ok'
    },
    ERROR: {
        code: 400,
        message: 'ERROR'
    },
    CREATED: {
        code: 201,
        message: 'Created'
    },
    BAD_REQUEST: {
        code: 400,
        message: 'Bad Request'
    },
    UNAUTHORIZED: {
        code: 401,
        message: 'Unauthorized'
    },
    NOT_FOUND: {
        code: 404,
        message: 'Not Found'
    },
    UPGRADE_REQUIRED: {
        code: 426,
        message: 'Upgrade Required'
    },
    INTERNAL_SERVER_ERROR: {
        code: 500,
        message: 'Internal Server Error'
    },
    NOT_IMPLEMENTED: {
        code: 501,
        message: 'Not Implemented'
    },
    SERVICE_UNAVAILABLE: {
        code: 503,
        message: 'Service Unavailable'
    }
};
exports.get = function (path, callback, options) {
    var defaultOptions = {
        host: url.parse(path).hostname,
        port: url.parse(path).port || 80,
        path: path,
        method: 'GET'
    };
    extend(true, defaultOptions, options);
    var req = http.request(defaultOptions, function (res) {
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        var responseString = '';
        var statusCode = res.statusCode;
        res.setEncoding('utf8');
        if (res.statusCode < 200 || res.statusCode > 299) {
            //if (!res.req.getHeader('isViewFile')) {
            // (I don't know if the 3xx responses come here, if so you'll want to handle them appropriately
            //throw new Error('Internal Service returned error code: ' + res.statusCode);
            //}
            callback(null);
        } else {
            res.on('data', function (chunk) {
                responseString += chunk;
            });
            res.on('end', function () {
                if (IsJsonString(responseString)) {
                    var jsonObject = JSON.parse(responseString);
                    callback(jsonObject);
                } else {
                    callback(responseString);
                }
            });
        }
    });
    req.on('error', function (e) {
        console.log(e);
        //throw e;
    });
    req.on('timeout', function (e) {
        console.log(e);
        //throw e;
    });

    req.end();
};
exports.post = function (path, data, callback, options) {

    var urlPath = path;
    var defaultOptions = {
        host: url.parse(path).hostname,
        port: url.parse(path).port || 80,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'charset': 'UTF-8'
        }
    };
    extend(true, defaultOptions, options);
    // Build the post string from an object
    var post_data =
        defaultOptions.headers['Content-Type'] === 'application/x-www-form-urlencoded' ?
            queryString.stringify(data) : JSON.stringify(data);
    // Set up the request
    //defaultOptions.headers['Content-Length'] = Buffer.byteLength(post_data);
    var post_req = http.request(defaultOptions, function (res) {
        var responseString = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            responseString += chunk;
        });
        res.on('end', function () {
            //temporary fix need to change replace fn
            var isJson = IsJsonString(responseString);
            var jsonObject = {};
            if (isJson) {
                jsonObject = JSON.parse(responseString);
            } else {
                console.log('request time out.');
            }
            callback(jsonObject);
        });
    });
    // post the data
    post_req.write(post_data);
    post_req.end();
};

exports.getSetCookies = function (path, data, callback, options) {

    var defaultOptions = {
        host: url.parse(path).hostname,
        port: url.parse(path).port || 80,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'charset': 'UTF-8'
        }
    };
    extend(true, defaultOptions, options);
    // Build the post string from an object
    var post_data =
        defaultOptions.headers['Content-Type'] === 'application/x-www-form-urlencoded' ?
            queryString.stringify(data) : JSON.stringify(data);
    // Set up the request
    //defaultOptions.headers['Content-Length'] = Buffer.byteLength(post_data);
    var post_req = http.request(defaultOptions, function (res) {
        var responseString = '';
        res.setEncoding('utf8');
        callback(res.headers['set-cookie']);
    });
    // post the data
    post_req.write(post_data);
    post_req.end();
};


exports.postFile = function (path, fileKey, fileStream, formData, callback, options) {
    var r = request.post(path, options, function optionalCallback(err, httpResponse, body) {
        callback(httpResponse);
    });
    var form = r.form();
    formData.forEach(function (entry) {
        form.append(entry.key, entry.value);
    });
    form.append(fileKey, fileStream);


};

exports.formatUrl = function (url, params) {
    if (url && params) {
        for (i = 0; i < params.length; i++) {
            //var exp = new RegExp("{" + i + "}", "g");
            url = url.replace('{' + i + '}', params[i]);
        }
    }
    return url;
};


exports.successResponse = function (res, responseData) {
    if (responseData === undefined) {
        responseData = {};
    }
    var responseContainer = getResponseContainer(
        _responseStatus.OK,
        1,
        responseData.title || "",
        responseData.description || "SUCCESS",
        responseData.data || {}
    );
    logResponse(res, responseContainer);
    //res.send(200, responseContainer);
    res.status(200).send(responseContainer);
};

exports.errorResponse = function (res, responseData) {
    if (responseData === undefined) {
        responseData = {};
    }
    var responseContainer = getResponseContainer(
        _responseStatus.ERROR,
        0,
        responseData.title || "",
        responseData.description || "ERROR",
        responseData.data || null
    );
    //res.log.error("RESPONSE ERROR: \r\n" + responseContainer.data_msg_title + "\r\n" + responseContainer.data_msg_desc);
    logResponse(res, responseContainer);
    //res.send(200, responseContainer);
    res.status(200).send(responseContainer);
};

exports.warningResponse = function (res, responseData) {
    if (responseData === undefined) {
        responseData = {};
    }
    var responseContainer = getResponseContainer(
        _responseStatus.OK,
        2,
        responseData.title || "",
        responseData.description || "WARNING",
        responseData.data || null
    );
    //res.log.error("RESPONSE Warning: \r\n" + responseContainer.data_msg_title + "\r\n" + responseContainer.data_msg_desc);
    logResponse(res, responseContainer);
    //res.send(200, responseContainer);
    res.status(200).send(responseContainer);
};

exports.processErrorResponse = function (res, responseData) {
    if (responseData === undefined) {
        responseData = {};
    }
    var responseContainer = getResponseContainer(
        responseData.status || _responseStatus.OK,
        responseData.code || 0,
        responseData.title || null,
        responseData.description || null,
        responseData.data || null
    );
    console.log(responseContainer);
    if (res) {
        logResponse(res, responseContainer);
    }
    //res.send(200, responseContainer);
    //res.status(200).send(responseContainer);
};

exports.response = function (res, responseData) {
    if (responseData === undefined) {
        responseData = {};
    }
    var responseContainer = getResponseContainer(
        responseData.status || _responseStatus.OK,
        responseData.code || 0,
        responseData.title || null,
        responseData.description || null,
        responseData.data || null
    );
    logResponse(res, responseContainer);
    //res.send(200, responseContainer);
    res.status(200).send(responseContainer);
};
exports.STATUS = _responseStatus;

exports.getFormattedDate = function (requestDate) {
    return new Date(requestDate.substring(0, 4) + "/" + requestDate.substring(4, 6) + "/" + requestDate.substring(6, 8) + " " + requestDate.substring(8, 10) + ":" + requestDate.substring(10, 12) + ":" + requestDate.substring(12, 14));
};

function getResponseContainer(status, code, title, description, data) {
    return {
        status_code: status.code,
        status_message: status.message,
        timestamp: new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14), //new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
        data_code: code,
        data_msg_title: title,
        data_msg_desc: description,
        data: data
    };
}

exports.getAsync = async function (path, options) {
    try {
        let host = url.parse(path).hostname,
            port = url.parse(path).port || 80,
            proxy = 'http://' + host + ':' + port,
            defaultOptions = {
                uri: path,
                proxy: proxy
            };
        extend(true, defaultOptions, options);
        let responseString = await requestPromise.get(defaultOptions);
        if (IsJsonString(responseString)) {
            return JSON.parse(responseString);
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};


exports.getPromise = function (path, options) {
    return new Promise((resolve, reject) => {
        var defaultOptions = {
            host: url.parse(path).hostname,
            port: url.parse(path).port || 80,
            path: path,
            method: 'GET'
        };
        extend(true, defaultOptions, options);
        var req = http.request(defaultOptions, function (res) {
            var responseString = '';
            var statusCode = res.statusCode;
            res.setEncoding('utf8');
            if (res.statusCode < 200 || res.statusCode > 299) {
                resolve(null);
            } else {
                res.on('data', function (chunk) {
                    responseString += chunk;
                });
                res.on('end', function () {
                    if (IsJsonString(responseString)) {
                        var jsonObject = JSON.parse(responseString);
                        resolve(jsonObject);
                    } else {
                        resolve(responseString);
                    }
                });
            }
        });
        req.on('error', function (errore) {
            console.log(errore);
            reject(error);
        });
        req.on('timeout', function (errore) {
            console.log(error);
            reject(error);
        });
        req.end();
    });
}

exports.postPromise = function (path, data, options) {
    return new Promise((resolve, reject) => {
        var urlPath = path;
        var defaultOptions = {
            host: url.parse(path).hostname,
            port: url.parse(path).port || 80,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'charset': 'UTF-8'
            }
        };
        extend(true, defaultOptions, options);
        // Build the post string from an object
        var post_data =
            defaultOptions.headers['Content-Type'] === 'application/x-www-form-urlencoded' ?
                queryString.stringify(data) : JSON.stringify(data);
        // Set up the request
        //defaultOptions.headers['Content-Length'] = Buffer.byteLength(post_data);
        var post_req = http.request(defaultOptions, function (res) {
            var responseString = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                responseString += chunk;
            });
            res.on('end', function () {
                //temporary fix need to change replace fn
                var jsonObject = jsonStringifyCheck(urlPath, responseString);
                resolve(jsonObject);
            });
        });
        // post the data
        post_req.write(post_data);
        post_req.end();
    });
}

function logResponse(res, responseContainer) {
    try {
        if (res.req.log) {
            res.req.log.debug({
                url: res.req.url,
                time: new Date(),
                data: responseContainer,
            }, 'MYPOBOX_RESPONSE');
        }
    } catch (ex) { }
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}