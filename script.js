var easyMap = function(cssSelector,urlTopojson) {
	//On déplace la projection au milieu
	this.projection = this.projection.translate([this.size/2,this.height/2]);
	//Modification du css Selector
	if(cssSelector !== undefined)
		this.cssSelector = cssSelector;
	//Modification de l'url Topojson
	if(urlTopojson !== undefined)
		this.urlTopojson = urlTopojson;
};
//Initialisation d'une taille standard
easyMap.prototype.size = {
	width: 400,
	height: 400
};
//On détecte la taille du div
easyMap.prototype.detectSize = function() {
	this.size.width = d3.select(this.cssSelector).offsetWidth;
	this.size.height = d3.select(this.cssSelector).offsetHeight;
}
//Initialisation d'une projection standard
easyMap.prototype.projection = d3.geo.mercator();
	
//Initialisation du sélecteur du div par défaut
easyMap.prototype.cssSelector = '#map';

//Initialisation du topojson par défaut	
easyMap.prototype.urlTopojson = 'data/world-110m.json';

//Rendu de la map
easyMap.prototype.draw = function() {
	console.log(this.svg)
	//Initialisation du path
	var path = d3.geo.path().projection(this.projection);

	function ready(error,topojsonObject) {
		//Ajout d'un svg de la taille indiquée
		var svg = d3.select(this.cssSelector).append('svg')
				.attr('width',this.size.width)
				.attr('height',this.size.height);
		//Convertir vers GeoJson
		var subunits = topojson.feature(topojsonObject,topojsonObject.objects.subunits);
		//Création des éléments
		svg = selectAll('.subunit')
					.data(topojson.feature(topojsonObject,topojsonObject.objects.subunits).features)
					.enter().append("path")
					.attr("class",function(d) {
						return "subunit " + d.id;
					})
					.attr("d",path);

		svg.append('path')
				.datum(topojson.mesh(topojsonObject,topojsonObject.objects.subunits,function(a,b) {
					return a !== b;
				}))
				.attr('d',path)
				.attr('class','subunit-boundary');
	}

	//Charger le topojson
	queue()
	.defer(d3.json,this.urlTopojson)
	.await(ready);
}

// //Permet de joindre deux territoires collés
// function add_merged_subunit(ids) {
// 	var selected = d3.set(ids);  //Must be an array
// 	svg.append("path")
//       .datum(topojson.merge(topojson_object_saved, topojson_object_saved.objects.subunits.geometries.filter(function(d) { return selected.has(d.id); })))
//       .attr("class", "subunit merged")
//       .attr("d", path);
// }
// function merge_subunits(ids) {
// 	ids.forEach(add_merged_subunit); //Must be arrays in array
// }