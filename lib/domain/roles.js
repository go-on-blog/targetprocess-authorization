/*jslint
    es6, node
*/
(function () {
    "use strict";

    const getByName = require("./getByName");

    module.exports = getByName.compose({
        props: {
            resource: "Roles"
        }
    });
}());
