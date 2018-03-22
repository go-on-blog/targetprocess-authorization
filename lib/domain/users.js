/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const resources = require("./resources");

    module.exports = stampit(resources, {statics: {resource: "Users"}, props: {propName: "LastName"}});
}());
