/*jslint
    es6, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const resources = require("./resources");
    const users = stampit(resources, {props: {resource: "Users", propName: "LastName"}});

    module.exports = users;
}());
