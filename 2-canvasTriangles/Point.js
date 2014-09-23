function Point(options) {
    this.x = options.x;
    this.y = options.y;
}

Point.prototype.computeDistance = function (point) {
    return Math.sqrt((this.x - point.x) * (this.x - point.x) + (this.y - point.y) * (this.y - point.y));
};