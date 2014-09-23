exports.beerAndFries = function (items) {
	items = items.sort(function (item1, item2) {
		return item1.score > item2.score;
	});
	var beerScores = items.filter(function (item) {
			return item.type === "beer";
		}),
		friesScores = items.filter(function (item) {
			return item.type === "fries";
		});
	return beerScores.reduce(function (previous, current, index) {
			return previous + current.score * friesScores[index].score;
		}, 0);
}