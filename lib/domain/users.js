/*jslint
    es6, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const resources = require("./resources");

    module.exports = stampit(resources, {props: {resource: "Users", propName: "LastName"}});
}());
