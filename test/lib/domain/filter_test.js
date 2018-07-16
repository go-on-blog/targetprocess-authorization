/*jslint
    es6
*/
"use strict";

const {describe, it} = require("mocha");

describe("filter", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const factory = require("../../../lib/domain/filter");
    const credentials = require("../../credentials");
    const config = Object.assign({resource: "UserStories"}, credentials);

    chai.use(chaiAsPromised);

    describe("filter", function () {
        function getSUTWithFakeRequester(condition, value) {
            const request = sinon.stub();
            const retriever = require("targetprocess-api/retrieve")(Object.assign({request}, config));
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {retriever}});
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/UserStories/`,
                qs: {
                    token: credentials.token,
                    where: condition,
                    take: 1000
                },
                json: true
            };

            request.rejects();
            request.withArgs(args).resolves(value);

            return stamp();
        }

        it("should return a rejected promise when the condition syntax is wrong", function () {
            const condition = "Id in (123,";
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/UserStories/`,
                qs: {
                    token: credentials.token,
                    where: condition,
                    take: 1000
                },
                json: true
            };

            const request = sinon.stub();
            const retriever = require("targetprocess-api/retrieve")(Object.assign({request}, config));
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {retriever}});
            const sut = stamp();

            request.withArgs(args).rejects();

            return expect(sut.filter(condition))
                .to.be.rejected;
        });

        it("should eventually return an empty array when no item match the given condition", function () {
            const condition = "(Owner is null)";
            const sut = getSUTWithFakeRequester(condition, {Items: []});

            return expect(sut.filter(condition))
                .to.eventually.be.an("array")
                .and.to.be.empty;
        });

        it("should eventually return a one-item array when one single item match the given condition", function () {
            const condition = "(Id eq 123)";
            const sut = getSUTWithFakeRequester(condition, {Items: [{"ResourceType": "UserStory"}]});

            return expect(sut.filter(condition))
                .to.eventually.be.an("array")
                .and.to.have.length(1);
        });

        it("should eventually return an array of items when multiple items match the given condition", function () {
            const condition = "(EntityState.IsFinal eq 'false')";
            const expected = [
                {"ResourceType": "UserStory", "Id": 123},
                {"ResourceType": "UserStory", "Id": 456}
            ];
            const sut = getSUTWithFakeRequester(condition, {Items: expected});

            return expect(sut.filter(condition))
                .to.eventually.deep.equal(expected);
        });
    });
});
