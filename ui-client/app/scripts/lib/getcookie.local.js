function logResults(data) {
    console.log(data);
}

!(function getCookieForLocalhost() {
    $.ajax({
        url: API_URL + 'token?accountPKID=323128&lang=en&callback=logResults',
        //url: API_URL + 'token?accountPKID=&lang=en&callback=logResults',
        //contentType: 'application/json; charset=utf-8',
        type: 'GET',
        dataType: 'jsonp',
        xhrFields: {
            withCredentials: true
        },
        error: function (xhr, status) { },
        success: function (result) {
            console.log(result);
        }
    });
})();