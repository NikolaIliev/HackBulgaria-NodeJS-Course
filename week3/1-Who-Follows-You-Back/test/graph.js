var assert = require("chai").assert,
	DirectedGraph = require("./../graph");

describe("DirectedGraph", function () {
	var g;
	beforeEach(function () {
		g = new DirectedGraph({
			"1": ["2", "3"],
			"2": ["1"],
			"3": []
		});
	});
	
	describe("#addEdge()", function () {
		it("should add the first node if it is not in the graph", function () {
			g.addEdge(5, 3);
			assert(g.nodeMapping[5] instanceof Array);
			assert(g.nodeMapping[5].indexOf(3) >= 0);
		});
		it("should add both nodes if they are not in the graph", function () {
			g.addEdge(4, 5);
			assert(g.nodeMapping[4] instanceof Array);
			assert(g.nodeMapping[5] instanceof Array);
			assert(g.nodeMapping[4].indexOf(5) >= 0);
		});
	});

	describe("#pathBetween()", function () {
		it("should return true for a trivial path", function () {
			assert.equal(g.pathBetween("1", "1"), true);
		});
		it("should return true for nodes which have a path between them", function () {
			assert.equal(g.pathBetween("1", "3"), true);
		});
		it("should return false for nodes which don't have a path between them", function () {
			assert.equal(g.pathBetween("3", "2"), false);
		});
		it("should return false if the first node is not in the graph", function () {
			assert.equal(g.pathBetween("99", "3"), false);
		});
		it("should return false if the second node is not in the graph", function () {
			assert.equal(g.pathBetween("3", "99"), false);
		});
		it("should return false if both nodes are not in the graph", function () {
			assert.equal(g.pathBetween("8", "99"), false);
		});
		it("should return false if both nodes are the same and are not in the graph", function () {
			assert.equal(g.pathBetween("99", "99"), false);
		});
	});
});