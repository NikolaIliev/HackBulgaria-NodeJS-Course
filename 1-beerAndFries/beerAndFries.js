exports.beerAndFries = function (items) {
	var beerScores = items.filter(function (item) {
			return item.type === "beer";
		}).map(function (item) {
			return item.score;
		}).sort(function (score1, score2) {
			return score1 > score2;
		}),
		friesScores = items.filter(function (item) {
			return item.type === "fries";
		}).map(function (item) {
			return item.score;
		}).sort(function (score1, score2) {
			return score1 > score2;
		});
	return beerScores.reduce(function (previous, current, index) {
			return previous + current * friesScores[index];
		}, 0);
}