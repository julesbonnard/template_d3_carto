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

var topojson_object_saved; //Garde en mémoire le fichier pour lecture ultérieure

d3.json(topojson_url, function(error, topojson_object) {
	if (error) return console.error(error);
	console.log(topojson_object);

	topojson_object_saved = topojson_object;

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

	map_displayed();
});

//Permet de joindre deux territoires collés
function add_merged_subunit(ids) {
	var selected = d3.set(ids);  //Must be an array
	svg.append("path")
      .datum(topojson.merge(topojson_object_saved, topojson_object_saved.objects.subunits.geometries.filter(function(d) { return selected.has(d.id); })))
      .attr("class", "subunit merged")
      .attr("d", path);
}
function merge_subunits(ids) {
	ids.forEach(add_merged_subunit); //Must be arrays in array
}