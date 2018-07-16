/*jslint
    es6
*/
"use strict";

const {describe, it} = require("mocha");

describe("projects", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const factory = require("../../../lib/domain/projects");
    const credentials = require("../../credentials");

    chai.use(chaiAsPromised);

    function getSUT(args, value) {
        const request = sinon.stub();
        const retriever = require("targetprocess-api/retrieve")(Object.assign({request, resource: "Projects"}, credentials));
        const stampit = require("@stamp/it");
        const stamp = stampit(factory, {props: {retriever}});

        request.rejects();
        request.withArgs(args).resolves(value);

        return stamp();
    }

    describe("getByName", function () {
        it("should eventually return the project id matching the specified name", function () {
            const name = "x";
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/Projects/`,
                qs: {
                    token: credentials.token,
                    where: `Name eq '${name}'`
                },
                json: true
            };
            const sut = getSUT(args, {Items: [{Id: 42}]});

            return expect(sut.getByName(name))
                .to.eventually.be.a("number")
                .and.to.equal(42);
        });
    });

    describe("getActive", function () {
        it("should eventually return an array of all active projects", function () {
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/Projects/`,
                qs: {
                    token: credentials.token,
                    where: "(IsActive eq 'true')",
                    include: "[Id]",
                    take: 1000
                },
                json: true
            };
            const expected = [{Id: 1}, {Id: 2}, {Id: 3}];
            const sut = getSUT(args, {Items: expected});

            return expect(sut.getActive())
                .to.eventually.be.an("array")
                .and.to.have.deep.members(expected);
        });
    });
});
