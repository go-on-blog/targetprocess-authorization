/*jslint
    es6
*/
(function () {
    "use strict";

    function adapter(args) {
        args = args || {};

        const when = require("when");

        return when.reject("Not implemented yet");
    }

    module.exports = adapter;
}());
