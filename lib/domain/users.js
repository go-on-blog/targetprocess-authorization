/*jslint
    es6, node
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const getId = require("./getId");
    const getAll = require("./getAll");

    module.exports = stampit(getId, getAll, {
        props: {
            resource: "Users",
            propName: "LastName"
        }
    });
}());
