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
            users: null,
            projects: null
        },
        init(config = {}) {
            if (!this.users) {
                this.users = require("./users")(config);
            }

            if (!this.projects) {
                this.projects = require("./projects")(config);
            }
        },
        methods: {
            getId(handler, name) {
                if (!name) {
                    return Promise.resolve(undefined);
                }

                if (Number.isInteger(name)) {
                    return Promise.resolve(name);
                }

                return handler.getId(name).then(function (result) {
                    if (Array.isArray(result)) {
                        throw new Error(`Several ${handler.resource} (${result.join(",")}) match the name "${name}".`);
                    }

                    return result;
                });
            },

            show(user, project) {
                const retrieve = this.retrieve;

                return Promise.all([this.getId(this.users, user), this.getId(this.projects, project)])
                    .then(function ([userId, projectId]) {
                        var condition = "";
                        if (userId) {
                            condition = condition.concat(`(User.Id eq ${userId})`);
                        }

                        if (projectId) {
                            if (condition.length > 0) {
                                condition = condition.concat("and");
                            }
                            condition = condition.concat(`(Project.Id eq ${projectId})`);
                        }

                        return retrieve.where(condition).get().then(format);
                    });
            }
        }
    });
}());
