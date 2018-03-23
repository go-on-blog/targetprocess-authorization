/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const retriever = require("./retriever");

    function format(arr) {
        return arr.reduce(function (accumulator, item) {
            return accumulator.concat(`${item.User.FirstName} ${item.User.LastName} is assigned to ${item.Project.Name} with the ${item.Role.Name} role.\n`);
        }, "");
    }


    module.exports = stampit(retriever, {
        props: {
            resource: "ProjectMembers",
            users: null
        },
        init(config = {}) {
            if (!this.users) {
                this.users = require("./users")(config);
            }
        },
        methods: {
            getUserId(user) {
                if (Number.isInteger(user)) {
                    return Promise.resolve(user);
                }

                return this.users.getId(user).then(function (result) {
                    if (Array.isArray(result)) {
                        throw new Error(`Several users (${result.join(",")}) match the name "${user}".`);
                    }

                    return result;
                });
            },

            show(user, project) {
                const retrieve = this.retrieve;

                return this.getUserId(user).then(function (userId) {
                    const condition = project
                        ? `(User.Id eq ${userId})and(Project.Id eq ${project})`
                        : `(User.Id eq ${userId})`;

                    return retrieve.where(condition).get().then(format);
                });
            }
        }
    });
}());
