/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const retriever = require("./retriever");
    const remover = require("./remover");
    const creator = require("./creator");

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

                return handler.getByName(name).then(function (result) {
                    if (!result && warning) {
                        console.warn(`No entity of name "${name}" was found. This argument will be ignored.`);
                    }

                    if (Array.isArray(result)) {
                        throw new Error(`Several ${handler.resource} (${result.join(",")}) match the name "${name}".`);
                    }

                    return result;
                });
            },

            toIds(handler, criteria) {
                if (!criteria || (typeof criteria === "boolean")) {
                    return Promise.resolve(undefined);
                }

                if (Number.isInteger(criteria)) {
                    return Promise.resolve([criteria]);
                }

                if (typeof criteria !== "string") {
                    criteria = criteria.toString();
                }

                if (criteria.startsWith("where=")) {
                    return handler.filter(criteria.substring(6));
                }

                return handler.getByName(criteria).then(function (result) {
                    if (!result) {
                        throw new Error(`No entity of name "${criteria}" was found. Command aborted.`);
                    }

                    if (Array.isArray(result)) {
                        throw new Error(`Several ${handler.resource} (${result.join(",")}) match the name "${criteria}".`);
                    }

                    return [result];
                });
            },

            getItems(user, project) {
                const WARNING = true;
                const ret = this.retriever;

                return Promise.all([
                    this.getId(this.users, user, WARNING),
                    this.getId(this.projects, project, WARNING)
                ]).then(function ([userId, projectId]) {
                    var condition = "";

                    if (!userId && !projectId) {
                        throw new Error("Neither project nor user are valid. At least one of them is required. Command aborted.");
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
                return this.getItems(user, project);
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

            makeItem(user, project, role) {
                const item = {
                    User: {Id: user},
                    Project: {Id: project}
                };

                if (role) {
                    item.Role = {Id: role};
                }

                return item;
            },

            create(user, project, role) {
                const that = this;

                if (user && project) {
                    return this.creator.create(this.makeItem(user, project, role));
                } else if (project) {
                    return this.users.getActive().then(function (items) {
                        const batch = items.map((i) => that.makeItem(i.Id, project, role));
                        return that.creator.batchCreate(batch);
                    });
                } else {
                    return this.projects.getActive().then(function (items) {
                        const batch = items.map((i) => that.makeItem(user, i.Id, role));
                        return that.creator.batchCreate(batch);
                    });
                }
            },

            assign(user, project, role) {
                const WARNING = true;
                const that = this;

                return Promise.all([
                    this.getId(this.users, user, WARNING),
                    this.getId(this.projects, project, WARNING),
                    this.getId(this.roles, role, WARNING)
                ]).then(function ([userId, projectId, roleId]) {
                    if (!userId && !projectId) {
                        throw new Error("Neither project nor user are valid. At least one of them is required. Command aborted.");
                    }

                    const create = that.create.bind(that, userId, projectId, roleId);
                    return that.unassign(userId, projectId).then(create);
                });
            }
        }
    });
}());
