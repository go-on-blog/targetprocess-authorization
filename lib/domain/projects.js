/*jslint
    es6, node
*/
(function () {
    "use strict";

    const getId = require("./getId");

    module.exports = getId.compose({
        props: {
            resource: "Projects"
        }
    });
}());
