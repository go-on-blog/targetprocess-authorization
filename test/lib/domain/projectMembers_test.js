/*jslint
    es6
*/
"use strict";

const {describe, it} = require("mocha");

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
    });

    describe("show", function () {
        function getSUT(users, projects, args, value) {
            const request = sinon.stub();
            const retrieve = require("targetprocess-api/retrieve")(Object.assign({request}, config));
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {retrieve, users, projects}});

            request.rejects();
            request.withArgs(args).resolves(value);

            return stamp(config);
        }

        it("should return a string matching given user name and project id", function () {
            const name = "Bourne";
            const id = 1;
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/ProjectMembers/`,
                qs: {
                    token: credentials.token,
                    where: `(User.Id eq ${id})and(Project.Id eq 2)`
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

            return expect(sut.show(name, 2))
                .to.eventually.be.a("string")
                .and.to.equal("Jason Bourne is assigned to Treadstone with the Developer role.\n");
        });

        it("should return a string matching given user name", function () {
            const name = "Bourne";
            const id = 1;
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/ProjectMembers/`,
                qs: {
                    token: credentials.token,
                    where: `(User.Id eq ${id})`
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

            return expect(sut.show(name))
                .to.eventually.be.a("string")
                .and.to.equal(
                    "Jason Bourne is assigned to Treadstone with the Developer role.\n" +
                    "Jason Bourne is assigned to Blackbriar with the Developer role.\n"
                );
        });
    });
});
