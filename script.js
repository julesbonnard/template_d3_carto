d3.json(topojson_url, function(error, topojson) {
  if (error) return console.error(error);
  console.log(topojson);
});