/*jslint
    es6
*/
"use strict";

const {describe, it} = require("mocha");

describe("users", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const factory = require("../../../lib/domain/users");
    const credentials = require("../../credentials");

    chai.use(chaiAsPromised);

    function getSUT(args, value) {
        const request = sinon.stub();
        const retriever = require("targetprocess-api/retrieve")(Object.assign({request, resource: "Users"}, credentials));
        const stampit = require("@stamp/it");
        const stamp = stampit(factory, {props: {retriever}});

        request.rejects();
        request.withArgs(args).resolves(value);

        return stamp();
    }

    describe("getId", function () {
        it("should return the user id matching the specified last name", function () {
            const lastName = "x";
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/Users/`,
                qs: {
                    token: credentials.token,
                    where: `LastName eq '${lastName}'`
                },
                json: true
            };
            const sut = getSUT(args, {Items: [{Id: 42}]});

            return expect(sut.getId(lastName))
                .to.eventually.be.a("number")
                .and.to.equal(42);
        });
    });

    describe("getAll", function () {
        it("should return the user id matching the specified last name", function () {
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/Users/`,
                qs: {
                    token: credentials.token,
                    include: "[Id]",
                    take: 1000
                },
                json: true
            };
            const expected = [{Id: 42}];
            const sut = getSUT(args, {Items: expected});

            return expect(sut.getAll(["Id"]))
                .to.eventually.be.an("array")
                .and.to.have.deep.members(expected);
        });
    });
});
