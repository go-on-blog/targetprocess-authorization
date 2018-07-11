/*jslint
    es6
*/
"use strict";

const {after, before, describe, it} = require("mocha");

describe("projectMembers", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const factory = require("../../../lib/domain/projectMembers");
    const credentials = require("../../credentials");
    const config = Object.assign({resource: "ProjectMembers"}, credentials);

    chai.use(chaiAsPromised);

    describe("getId", function () {
        function getStub(args, value) {
            const getId = sinon.stub();

            getId.withArgs(args).resolves(value);

            return {
                resource: "Users",
                getId
            };
        }

        before(function () {
            sinon.spy(console, 'warn');
        });

        it("should eventually return undefined when no argument is given", function () {
            const sut = factory(config);
            return expect(sut.getId(null, undefined)).to.eventually.be.undefined;
        });

        it("should eventually return its argument when it is a number", function () {
            const sut = factory(config);
            const id = 1;

            return expect(sut.getId(null, id)).to.eventually.equal(id);
        });

        it("should return a rejected promise when the given name matches several users", function () {
            const sut = factory(config);
            const veryCommonLastName = "Smith";
            const stub = getStub(veryCommonLastName, [1, 2]);

            return expect(sut.getId(stub, veryCommonLastName))
                .to.be.rejected;
        });

        it("should eventually return an identifier matching the given name", function () {
            const sut = factory(config);
            const name = "x";
            const stub = getStub(name, 42);

            return expect(sut.getId(stub, name))
                .to.eventually.be.a("number")
                .and.to.equal(42);
        });

        it("should output a warning when either user or project is not found by its name", function () {
            const sut = factory(config);
            const name = "x";
            const stub = getStub(name, null);

            return sut.getId(stub, name, true)
                .then(() => expect(console.warn.calledOnce).to.be.true);
        });

        after(function () {
            console.warn.restore();
        });
    });

    describe("getItems", function () {
        function getSUT(users, projects, args, value) {
            const request = sinon.stub();
            const retriever = require("targetprocess-api/retrieve")(Object.assign({request}, config));
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {retriever, users, projects}});

            request.rejects();
            request.withArgs(args).resolves(value);

            return stamp(config);
        }

        it("should return an array with a single item matching given user name and project id", function () {
            const name = "Bourne";
            const id = 1;
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/ProjectMembers/`,
                qs: {
                    token: credentials.token,
                    where: `(User.Id eq ${id})and(Project.Id eq 2)`,
                    take: 1000
                },
                json: true
            };
            const expected = {
                Items: [
                    {
                        User: {
                            Id: id,
                            FirstName: "Jason",
                            LastName: name
                        },
                        Project: {
                            Id: 2,
                            Name: "Treadstone"
                        },
                        Role: {
                            Name: "Developer"
                        }
                    }
                ]
            };
            const users = {};
            const projects = {};
            const sut = getSUT(users, projects, args, expected);
            const getId = sinon.stub(sut, "getId");
            getId.withArgs(users, name).resolves(id);
            getId.withArgs(projects, 2).resolves(2);

            return expect(sut.getItems(name, 2))
                .to.eventually.be.an("array")
                .and.to.deep.equal(expected.Items);
        });

        it("should return an array with several items matching the given user name", function () {
            const name = "Bourne";
            const id = 1;
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/ProjectMembers/`,
                qs: {
                    token: credentials.token,
                    where: `(User.Id eq ${id})`,
                    take: 1000
                },
                json: true
            };
            const expected = {
                Items: [
                    {
                        User: {
                            Id: id,
                            FirstName: "Jason",
                            LastName: name
                        },
                        Project: {
                            Id: 2,
                            Name: "Treadstone"
                        },
                        Role: {
                            Name: "Developer"
                        }
                    },
                    {
                        User: {
                            Id: id,
                            FirstName: "Jason",
                            LastName: name
                        },
                        Project: {
                            Id: 3,
                            Name: "Blackbriar"
                        },
                        Role: {
                            Name: "Developer"
                        }
                    }
                ]
            };
            const users = {};
            const projects = {};
            const sut = getSUT(users, projects, args, expected);
            const getId = sinon.stub(sut, "getId");
            getId.withArgs(users, name).resolves(id);

            return expect(sut.getItems(name))
                .to.eventually.be.an("array")
                .and.to.deep.equal(expected.Items);
        });

        it("should throw an error when both project and user names are not valid", function () {
            const badUserName = "x";
            const badProjectName = "y";
            const users = {};
            const projects = {};
            const sut = getSUT(users, projects);
            const getId = sinon.stub(sut, "getId");
            getId.withArgs(users, badUserName).resolves(null);
            getId.withArgs(projects, badProjectName).resolves(null);

            return expect(sut.getItems(badUserName, badProjectName))
                .to.be.rejectedWith(Error);
        });
    });

    describe("show", function () {
        it("should return a string matching given user and project", function () {
            const userName = "Bourne";
            const projectName = "Treadstone";
            const sut = factory(config);
            const getItems = sinon.stub(sut, "getItems");
            getItems.withArgs(userName, projectName).resolves([
                {
                    User: {
                        Id: 1,
                        FirstName: "Jason",
                        LastName: userName
                    },
                    Project: {
                        Id: 2,
                        Name: projectName
                    },
                    Role: {
                        Name: "Developer"
                    }
                }
            ]);

            return expect(sut.show(userName, projectName))
                .to.eventually.be.a("string")
                .and.to.equal("Jason Bourne is assigned to Treadstone with the Developer role.\n");
        });
    });

    describe("unassign", function () {
        it("should return a fulfilled promise once the given user has been unassigned from the given project", function () {
            const userName = "Bourne";
            const projectName = "Treadstone";
            const batchRemove = sinon.stub();
            const remover = {batchRemove};
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {remover}});
            const sut = stamp(config);
            const getItems = sinon.stub(sut, "getItems");
            const response = {ResourceType: "ProjectMember", Id: 42};

            getItems.withArgs(userName, projectName).resolves([
                {
                    Id: 42,
                    User: {Id: 1, FirstName: "Jason", LastName: userName},
                    Project: {Id: 2, Name: projectName},
                    Role: {Id: 3, Name: "Developer"}
                }
            ]);

            batchRemove.withArgs([42]).resolves(response);

            return expect(sut.unassign(userName, projectName))
                .to.eventually.equal(response);
        });
    });

    describe("assign", function () {
        it("should return a rejected promise if the user is undefined", function () {
            const sut = factory(config);
            return expect(sut.assign(undefined, "Project", "Role")).to.be.rejected;
        });

        it("should return a rejected promise if the project is undefined", function () {
            const sut = factory(config);
            return expect(sut.assign("User", undefined, "Role")).to.be.rejected;
        });

        it("should unassign prior assignment", function () {
            const create = sinon.stub();
            const creator = {create};
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {creator}});
            const sut = stamp(config);
            const unassign = sinon.stub(sut, "unassign");

            unassign.withArgs(1, 2).resolves({});
            create.resolves({});

            sut.assign(1, 2, 3);
            return expect(unassign.calledWith(1, 2));
        });

        it("should eventually assign the given user to the given project", function () {
            const create = sinon.stub();
            const creator = {create};
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {creator}});
            const sut = stamp(config);
            const unassign = sinon.stub(sut, "unassign");
            const response = {ResourceType: "ProjectMember", Id: 456};

            unassign.withArgs(1, 2).resolves({});

            create.withArgs({
                User: {Id: 1},
                Project: {Id: 2},
                Role: {Id: 3}
            }).resolves(response);

            return expect(sut.assign(1, 2, 3))
                .to.eventually.equal(response);
        });
    });
});
