//On détecte la taille du div
var width = document.getElementById('map').offsetWidth,
	height = document.getElementById('map').offsetHeight;

//On déplace la projection au milieu
var projection = projection.translate([width / 2, height / 2]);

//On crée un svg de la taille du div
var svg = d3.select("#map").append("svg")
	.attr("width", width)
	.attr("height", height);

var path = d3.geo.path()
	.projection(projection);

d3.json(topojson_url, function(error, topojson_object) {
	if (error) return console.error(error);
	console.log(topojson_object);

	var subunits = topojson.feature(topojson_object, topojson_object.objects.subunits); //Reconvertir vers GeoJson

	//Création des éléments
	svg.selectAll(".subunit")
		.data(topojson.feature(topojson_object, topojson_object.objects.subunits).features)
		.enter().append("path")
		.attr("class", function(d) {
			return "subunit " + d.id;
		})
		.attr("d", path);

	//Création des bordures
	svg.append("path")
		.datum(topojson.mesh(topojson_object, topojson_object.objects.subunits, function(a, b) {
			return a !== b;
		}))
		.attr("d", path)
		.attr("class", "subunit-boundary");
});