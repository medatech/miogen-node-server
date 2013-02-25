var Class = require('../class/class'),
    HttpException;
    
HttpException = Class.extend({

    code: 0,

    init: function (code) {
        this.code = code;
    },

    getCode: function () {
        return this.code;
    }

});

module.exports = HttpException;