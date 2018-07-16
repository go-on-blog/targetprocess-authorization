/*jslint
    es6, node
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const getByName = require("./getByName");
    const getActive = require("./getActive");
    const filter = require("./filter");

    module.exports = stampit(getByName, getActive, filter, {
        props: {
            resource: "Users",
            propName: "LastName"
        }
    });
}());
