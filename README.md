# template_d3_carto
An empty template to project maps with topojson

Extensive use of the tutoriel Let's Make a Map by Mike Bostock http://bost.ocks.org/mike/map/

Exemples de projections : 
	d3.geo.mercator()
	d3.geo.azimuthalEqualArea() 
	d3.geo.kavrayskiy7()

Cartes disponibles (topojson) :
	world-10m.json 
	world-50m.json 
	world-110m.json 

Fonction Map Displayed appelée lorsque la carte est affichée : 

	Réunir les territoires disputés (par id) : 
		merge_subunits([[732,504],[250,724]]);