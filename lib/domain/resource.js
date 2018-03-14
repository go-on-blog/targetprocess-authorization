/*jslint
    es6
*/
(function () {
    "use strict";

    function resources(domain, token) {
        const api = {
            resource: undefined
        };

        api.getId = function (name) {
            const tp = require("targetprocess-api")({domain, token});
            const condition = `Name eq ${name}`;

            return tp.retrieve(api.resource).where(condition).get();
        };

        return api;
    }

    module.exports = resources;
}());
