var easyMap = function(cssSelector,projection,urlTopojson,urlNames) {
	this.cssSelector = cssSelector || '#map';
	this.urlTopojson = urlTopojson || 'data/world-110m.json';
	this.projection = projection || d3.geo.mercator();
	this.urlNames = urlNames || 'data/world-110m-data.tsv';
	this.property = 'utilisation_internet';
	this.range = 9;
	this.colorPalette = 'RdYlGn';
	
	var container = d3.select(this.cssSelector),
		svg,
		that = this,
		path,
		data = d3.map();

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

	path = d3.geo.path()
		.projection(projection);

	function convertToGeoJson(topojsonObject) {
		return topojson.feature(topojsonObject,topojsonObject.objects.subunits).features;
	}

	function formatHover(id) {
		if(data.get(id) !== undefined)
			return data.get(id).name+" ("+id+") : "+data.get(id)[that.property];
	}

	function createSubUnits(listSubUnits) {
		var quantize = d3.scale.quantize()
		    .domain(d3.extent(data.values(),function(d) {return d[that.property];}))
		    .range(d3.range(that.range).map(function(i) { return "q" + i + "-" + that.range; }));

		svg.selectAll('.subunit')
			.data(listSubUnits)
			.enter().append("path")
			.attr("class",function(d) {
				var dataClass = "subunit subunit" + d.id;
				if(data.get(d.id)!==undefined && data.get(d.id)[that.property]!=='') 
					dataClass = dataClass + " " +quantize(data.get(d.id)[that.property]);
				
				return dataClass;
			})
			.attr("title",function(d) {
				if(data.get(d.id) !== undefined)
					return data.get(d.id).name;
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


	this.draw = function(error,topojsonLoaded,data) {
		svg = container.append('svg')
			.attr('width',this.width())
			.attr('height',this.height())
			.attr('class',this.colorPalette);

		this.resize();

		createSubUnits(mergeSubUnits(topojsonLoaded));
		createBoundaries(topojsonLoaded);

		this.resize();
	}

	this.load = function() {
		queue()
			.defer(d3.json,this.urlTopojson)
			.defer(d3.tsv,this.urlNames, function(d) { data.set(d.id, d); })
			.await(function(error,topology,data) {
				that.draw(error,topology,data);
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
	window.addEventListener('resize', that.resize, false);
};