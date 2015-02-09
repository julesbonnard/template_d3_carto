var easyMap = function(cssSelector,urlTopojson) {
	//Modification du css Selector
	if(cssSelector !== undefined)
		this.cssSelector = cssSelector;
	//Modification de l'url Topojson
	if(urlTopojson !== undefined)
		this.urlTopojson = urlTopojson;

	this.detectSize();

	//Initialisation du SVG
	this.svg = d3.select(this.cssSelector).append('svg')
			.attr('width',this.size.width)
			.attr('height',this.size.height);
};

//Définition du prototype de base

//Initialisation d'une taille standard
easyMap.prototype.size = {
	width: 400,
	height: 400
};
//On détecte la taille du div
easyMap.prototype.detectSize = function() {
	this.size.width = d3.select(this.cssSelector)[0][0].offsetWidth;
	this.size.height = d3.select(this.cssSelector)[0][0].offsetHeight;
}

//Initialisation d'une projection standard
easyMap.prototype.projection = d3.geo.mercator();
	
//Initialisation du sélecteur du div par défaut
easyMap.prototype.cssSelector = '#map';

//Initialisation du topojson par défaut	
easyMap.prototype.urlTopojson = 'data/world-110m.json';

//Initialisation du tableau pour rassembler deux zones
easyMap.prototype.mergedSubUnits = [];
easyMap.prototype.addMergedSubunits = function(array) {
	this.mergedSubUnits.push(array);
}

//Rendu de la map
easyMap.prototype.draw = function() {
	var svg = this.svg;
	var mergedSubUnits = this.mergedSubUnits;

	//Initialisation du path
	var path = d3.geo.path()
			.projection(this.projection);

	var topojsonObject;

	//Une fois les fichiers chargés
	function ready(error,result) {
		topojsonObject = result;

		createSubUnits();
		createBoundaries();

		if(mergedSubUnits.length>0)
			mergeSubUnits();
	}

	function createSubUnits() {
		svg.selectAll('.subunit')
			.data(topojson.feature(topojsonObject,topojsonObject.objects.subunits).features)
			.enter().append("path")
			.attr("class",function(d) {
				return "subunit subunit" + d.id;
			})
			.attr("d",path);
	}

	function createBoundaries() {
			svg.append('path')
				.datum(topojson.mesh(topojsonObject,topojsonObject.objects.subunits,function(a,b) {
					return a !== b;
				}))
				.attr('d',path)
				.attr('class','subunit-boundary');
	}

	function mergeSubUnits() {
		mergedSubUnits.forEach(function(d) {
			var selected = d3.set(d);
			svg.append("path")
			.datum(topojson.merge(topojsonObject, topojsonObject.objects.subunits.geometries.filter(function(a) { return selected.has(a.id); })))
			.attr("class", function(a) {
				var classIds = "";
				d.forEach(function(b) {
					classIds = classIds + "subunit"+b+" ";
				});
				return "subunit merged"+classIds;
			})
			.attr("d", path);
		});
	}

	//Charger le topojson
	queue()
	.defer(d3.json,this.urlTopojson)
	.await(ready);
}