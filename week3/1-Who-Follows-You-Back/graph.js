function DirectedGraph(nodeMapping) {
    this.nodeMapping = nodeMapping || {};
}

DirectedGraph.prototype.addEdge = function (nodeA, nodeB) {
	this.nodeMapping[nodeA] = this.nodeMapping[nodeA] || [];
	this.nodeMapping[nodeB] = this.nodeMapping[nodeB] || [];
	if (this.nodeMapping[nodeA].indexOf)
	this.nodeMapping[nodeA].push(nodeB);
}

DirectedGraph.prototype.getNeighborsFor = function (node) {
	return this.nodeMapping[node] || [];
}

DirectedGraph.prototype.pathBetween = function (nodeA, nodeB) {
	var self = this,
		visited = arguments[2] || [];

	if (this.nodeMapping[nodeA] == undefined || this.nodeMapping[nodeB] == undefined) {
		return false;
	}
	if (nodeA === nodeB) {
		return true;
	}

	visited.push(nodeA);

	return this.nodeMapping[nodeA].some(function (neighbour) {
		if (visited.indexOf(neighbour) >= 0) {
			return false;
		}
		return self.pathBetween(neighbour, nodeB, visited);
	});
}

DirectedGraph.prototype.toString = function () {
	var result = "";

	for (var node in this.nodeMapping) {
		result += node + ": [";
		this.nodeMapping[node].forEach(function (neighbour, index, arr) {
			result += neighbour + ((index < arr.length - 1) ? ", " : "");
		});
		result += "]; ";
	}

	return result;
}

module.exports = DirectedGraph;