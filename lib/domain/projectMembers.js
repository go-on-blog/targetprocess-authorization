/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const retriever = require("./retriever");
    const remover = require("./remover");
    const creator = require("./creator");

    function format(arr) {
        return arr.reduce(function (accumulator, item) {
            return accumulator.concat(`${item.User.FirstName} ${item.User.LastName} is assigned to ${item.Project.Name} with the ${item.Role.Name} role.\n`);
        }, "");
    }


    module.exports = stampit(retriever, remover, creator, {
        props: {
            resource: "ProjectMembers",
            users: null,
            projects: null,
            roles: null
        },
        init(config = {}) {
            if (!this.users) {
                this.users = require("./users")(config);
            }

            if (!this.projects) {
                this.projects = require("./projects")(config);
            }

            if (!this.roles) {
                this.roles = require("./roles")(config);
            }
        },
        methods: {
            getId(handler, name, warning) {
                if (!name) {
                    return Promise.resolve(undefined);
                }

                if (Number.isInteger(name)) {
                    return Promise.resolve(name);
                }

                return handler.getId(name).then(function (result) {
                    if (!result && warning) {
                        console.warn(`No entity of name "${name}" was found. This argument will be ignored.`);
                    }

                    if (Array.isArray(result)) {
                        throw new Error(`Several ${handler.resource} (${result.join(",")}) match the name "${name}".`);
                    }

                    return result;
                });
            },

            getItems(user, project) {
                const ret = this.retriever;
                const WARNING = true;

                return Promise.all([this.getId(this.users, user, WARNING), this.getId(this.projects, project, WARNING)])
                    .then(function ([userId, projectId]) {
                        var condition = "";

                        if (!userId && !projectId) {
                            throw new Error(`Neither project nor user are valid. At least one of them is required. Command aborted.`);
                        }

                        if (userId) {
                            condition = condition.concat(`(User.Id eq ${userId})`);
                        }

                        if (projectId) {
                            if (condition.length > 0) {
                                condition = condition.concat("and");
                            }
                            condition = condition.concat(`(Project.Id eq ${projectId})`);
                        }

                        // 1000 items is TP upper limit of a retrieve operation
                        return ret.where(condition).take(1000).get();
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
            },

            assign(user, project, role) {
                const that = this;

                if (!user) {
                    return Promise.reject(new Error("The user is missing."));
                }

                if (!project) {
                    return Promise.reject(new Error("The project is missing."));
                }

                return Promise.all([
                    this.getId(this.users, user),
                    this.getId(this.projects, project),
                    this.getId(this.roles, role)
                ]).then(function ([userId, projectId, roleId]) {
                    return that.unassign(userId, projectId).then(function () {
                        return that.creator.create({
                            User: {Id: userId},
                            Project: {Id: projectId},
                            Role: {Id: roleId}
                        });
                    });
                });
            }
        }
    });
}());
