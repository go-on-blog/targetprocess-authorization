/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const retriever = require("./retriever");
    const remover = require("./remover");

    function format(arr) {
        return arr.reduce(function (accumulator, item) {
            return accumulator.concat(`${item.User.FirstName} ${item.User.LastName} is assigned to ${item.Project.Name} with the ${item.Role.Name} role.\n`);
        }, "");
    }


    module.exports = stampit(retriever, remover, {
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

            getItems(user, project) {
                const ret = this.retriever;

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

                        return ret.where(condition).get();
                    });
            },

            show(user, project) {
                return this.getItems(user, project).then(format);
            },

            unassign(user, project) {
                const pluck = require("mout/array/pluck");
                const rem = this.remover;

                return this.getItems(user, project)
                    .then((arr) => pluck(arr, "Id"))
                    .then(function (batch) {
                        return rem.batchRemove(batch);
                    });
            }
        }
    });
}());
