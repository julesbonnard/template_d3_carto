var easyMap = function(cssSelector,projection,urlTopojson,urlNames) {
	this.cssSelector = cssSelector || '#map';
	this.urlTopojson = urlTopojson || 'data/world-110m.json';
	this.projection = projection || d3.geo.mercator();
	this.urlNames = urlNames || 'data/world-110m-country-names.tsv';
	
	var container = d3.select(this.cssSelector),
		svg,
		that = this,
		path;

	this.mapRatio = 0.4,
	this.scale = 0.1;

	this.width = function() {
		return parseInt(container.style('width'));
	}

	this.height = function() {
		var svgHeight = parseInt(container.select('svg').style('height'));
		var normalHeight = this.width()*this.mapRatio;
		if(svgHeight>=normalHeight) {
			return svgHeight;
		}
		else {
			return normalHeight;
		}
	}

	this.changeProjection = function(projection) {
		path = d3.geo.path()
			.projection(projection);
	}
	this.changeProjection(this.projection);

	var names = d3.map();

	function convertToGeoJson(topojsonObject) {
		return topojson.feature(topojsonObject,topojsonObject.objects.subunits).features;
	}

	function formatHover(id) {
		return names.get(id)+" ("+id+")";
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

	function createBoundaries(topojsonObject) {
		svg.append('path')
			.datum(topojson.mesh(topojsonObject,topojsonObject.objects.subunits,function(a,b) {
				return a !== b;
			}))
			.attr('d',path)
			.attr('class','subunit-boundary');
	}

	this.mergedSubUnits = [];
	this.addMergedSubunits = function(array) {
		this.mergedSubUnits.push(array);
	}
	function mergeSubUnits(topojsonObject) {
		var listSubUnits = topojson.feature(topojsonObject,topojsonObject.objects.subunits).features;
		that.mergedSubUnits.forEach(function(d) {
			var merged = d3.set(d);
			var newSubUnit = topojson.merge(topojsonObject, topojsonObject.objects.subunits.geometries.filter(function(a) { return merged.has(a.id); }));
			newSubUnit.id = d[0];
			listSubUnits.push(newSubUnit);
		});
		return listSubUnits;
	}


	this.draw = function(error,topojsonLoaded,namesLoaded) {
		svg = container.append('svg')
			.attr('width',this.width())
			.attr('height',this.height());

		this.resize();

		createSubUnits(mergeSubUnits(topojsonLoaded));
		createBoundaries(topojsonLoaded);

		this.resize();
	}

	this.load = function() {
		queue()
			.defer(d3.json,this.urlTopojson)
			.defer(d3.tsv,this.urlNames, function(d) { names.set(d.id, d.name); })
			.await(function(error,topology,names) {
				that.draw(error,topology,names);
			});
	}

	this.resize = function() {
	    that.projection
	        .translate([that.width() / 2, that.height() / 2])
	        .scale(that.width()*that.scale);

	    container.style('height', that.height() + 'px');

	    container.selectAll('.subunit').attr('d', path);
	    container.selectAll('.subunit-boundary').attr('d', path);
	}
	d3.select(window).on('resize', this.resize);
};