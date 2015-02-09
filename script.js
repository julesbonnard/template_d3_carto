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

	d3.select(window).on('resize', this.resize);
};

//Définition du prototype de base

//Initialisation d'une taille standard
easyMap.prototype.size = {
	width: 400,
	height: 400,
	mapRatio: 0.5
};
//On détecte la taille du div
easyMap.prototype.detectSize = function() {
	this.size.width = d3.select(this.cssSelector).node().getBoundingClientRect().width;
	this.size.height = this.size.width*this.size.mapRatio;
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

//Fichier de noms par défaut
easyMap.prototype.urlNames = 'data/world-110m-country-names.tsv';

//Rendu de la map
easyMap.prototype.draw = function() {
	var svg = this.svg;
	var mergedSubUnits = this.mergedSubUnits;
	var names = d3.map();

	var projection = this.projection.scale(this.size.width).translate([this.size.width / 2, this.size.height / 2]);
	//Initialisation du path
	var path = d3.geo.path()
			.projection(this.projection);

	var topojsonObject;

	//Une fois les fichiers chargés
	function ready(error,topojsonLoaded,namesLoaded) {
		topojsonObject = topojsonLoaded;
		createSubUnits(mergeSubUnits());
		createBoundaries();
	}

	function createSubUnits(listSubUnits) {
		svg.selectAll('.subunit')
			.data(listSubUnits)
			.enter().append("path")
			.attr("class",function(d) {
				return "subunit subunit" + d.id;
			})
			.attr("title",function(d) {
				return names.get(d.id);
			})
			.attr("d",path)
			.on('mouseover',function(d) {
				console.log(formatHover(d.id));
			});
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
		var listSubUnits = topojson.feature(topojsonObject,topojsonObject.objects.subunits).features;
		mergedSubUnits.forEach(function(d) {
			var merged = d3.set(d);
			var newSubUnit = topojson.merge(topojsonObject, topojsonObject.objects.subunits.geometries.filter(function(a) { return merged.has(a.id); }));
			newSubUnit.id = d[0];
			listSubUnits.push(newSubUnit);
		});
		return listSubUnits;
	}

	function formatHover(id) {
		return names.get(id)+" ("+id+")";
	}

	//Charger le topojson
	queue()
	.defer(d3.json,this.urlTopojson)
	.defer(d3.tsv,this.urlNames, function(d) { names.set(d.id, d.name); })
	.await(ready);
}

easyMap.prototype.resize = function() {
    // adjust things when the window size changes
    this.size.width = parseInt(d3.select(this.cssSelector).style('width'));
    console.log(this.size.width)

    // update projection
    this.projection
        .translate([this.size.width / 2, this.size.height / 2])
        .scale(this.size.width);

    // resize the map container
    d3.select(this.cssSelector)
        .style('width', this.size.width + 'px')
        .style('height', this.size.height + 'px');

    // resize the map
    // d3.select(this.cssSelector).select('.land').attr('d', path);
    d3.select(this.cssSelector).selectAll('.subunit').attr('d', path);
}