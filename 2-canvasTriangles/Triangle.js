function Triangle(options) {
    this.a = new Point(options.a);
    this.b = new Point(options.b);
    this.c = new Point(options.c);
    this.color = options.color;
    this.area = options.area || Math.round(this.computeArea());
    this.fontSize = options.fontSize || Math.min((this.area / 5000 + 1) * 7, 25);
}

Triangle.prototype.draw = function () {
    var offsetLeft = this.area.toString().length / 4 * this.fontSize;
    context.fillStyle = this.color;
    context.strokeStyle = 'black';
    context.beginPath();
    context.moveTo(this.a.x, this.a.y);
    context.lineTo(this.b.x, this.b.y);
    context.lineTo(this.c.x, this.c.y);
    context.lineTo(this.a.x, this.a.y);
    context.fill();
    context.fillStyle = this.color > "#AAAAAA" ? "black" : "white";
    context.font = this.fontSize + "px Georgia";
    context.fillText(this.area, (this.a.x + this.b.x + this.c.x) / 3 - offsetLeft, (this.a.y + this.b.y + this.c.y) / 3);
};

Triangle.prototype.isViable = function (a, b, c) {
    var sameX = a.x === b.x && a.x === c.x,
        sameY = a.y === b.y && a.y === c.y;

    return !sameX && !sameY;
};

Triangle.prototype.computeArea = function () {
    var sideA = this.b.computeDistance(this.c),
        sideB = this.a.computeDistance(this.c),
        sideC = this.a.computeDistance(this.b),
        s = (sideA + sideB + sideC) / 2;

    return Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
};