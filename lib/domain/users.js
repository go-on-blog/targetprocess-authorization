/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const getId = require("./getId");

    module.exports = getId.compose({
        props: {
            resource: "Users",
            propName: "LastName"
        }
    });
}());
