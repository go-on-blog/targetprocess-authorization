/*jslint
    es6, node
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const getId = require("./getId");
    const getActive = require("./getActive");

    module.exports = stampit(getId, getActive, {
        props: {
            resource: "Users",
            propName: "LastName"
        }
    });
}());
