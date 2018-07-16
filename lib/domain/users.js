/*jslint
    es6, node
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const getByName = require("./getByName");
    const getActive = require("./getActive");

    module.exports = stampit(getByName, getActive, {
        props: {
            resource: "Users",
            propName: "LastName"
        }
    });
}());
