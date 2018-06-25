const NodeCache = require("node-cache");
const localCache = new NodeCache({ stdTTL: 100, checkperiod: 0 });

function CacheHandler() {

    var that = this;

    that.setCache = function (key, value, expiryInSeconds) {
        var expiry = expiryInSeconds || 600;
        var isSuccess = localCache.set(key, value, expiry);
        return isSuccess;
    };

    that.getCache = function (key) {
        var value = localCache.get(key);
        // var result = {
        //     data: null,
        //     isSuccess: false
        // };
        // if (value !== undefined) {
        //     result.data = value;
        //     result.isSuccess = true;
        // }
        return value;
    };

    that.getCacheKeyValue = function (key) {
        var value = localCache.get(key);
        var result = {
            data: null,
            isSuccess: false
        };
        if (value !== undefined) {
            result.data = value;
            result.isSuccess = true;
        }
        return result;
    };

    that.deleteCache = function (key) {
        localCache.del(key);
    };

}

module.exports = new CacheHandler();