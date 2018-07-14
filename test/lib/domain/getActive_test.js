/*jslint
    es6
*/
"use strict";

const {describe, it} = require("mocha");

describe("getActive", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const factory = require("../../../lib/domain/getActive");
    const credentials = require("../../credentials");
    const config = Object.assign({resource: "Users"}, credentials);

    chai.use(chaiAsPromised);

    describe("getActive", function () {
        function getSUT(args, value) {
            const request = sinon.stub();
            const retriever = require("targetprocess-api/retrieve")(Object.assign({request}, config));
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {retriever}});

            request.rejects();
            request.withArgs(args).resolves(value);

            return stamp();
        }

        it("should return an empty array when no item is found", function () {
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/Users/`,
                qs: {
                    token: credentials.token,
                    where: "(IsActive eq 'true')",
                    include: "[Id]",
                    take: 1000
                },
                json: true
            };
            const sut = getSUT(args, {Items: []});

            return expect(sut.getActive())
                .to.eventually.be.an("array")
                .and.to.be.empty;
        });

        it("should return an array of objects when items are found", function () {
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/Users/`,
                qs: {
                    token: credentials.token,
                    where: "(IsActive eq 'true')",
                    include: "[Id]",
                    take: 1000
                },
                json: true
            };
            const expected = [{Id: 42}];
            const sut = getSUT(args, {Items: expected});

            return expect(sut.getActive())
                .to.eventually.be.an("array")
                .and.to.have.lengthOf(1)
                .and.to.have.deep.members(expected);
        });

        it("should return an array of objects including the specified properties", function () {
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/Users/`,
                qs: {
                    token: credentials.token,
                    where: "(IsActive eq 'true')",
                    include: "[Id,Login]",
                    take: 1000
                },
                json: true
            };
            const expected = [{Id: 42, Login: "Deep Thought"}];
            const sut = getSUT(args, {Items: expected});

            return expect(sut.getActive(["Id", "Login"]))
                .to.eventually.be.an("array")
                .and.to.have.deep.members(expected);
        });
    });
});
