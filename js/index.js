//config for container
d3.select("#map")
  .style("width", containerWidth + "px")
  .style("height", containerHeight + "px");

//config for mapbox gl
mapboxgl.accessToken = API_KEY;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  center: [13.79, 53.545], // starting position [lng, lat]
  zoom: 2, // starting zoom
});

function project(d) {
  return map.project(new mapboxgl.LngLat(d[0], d[1]));
}

function render() {
  dots
    .attr("cx", function (d) {
      return project(d).x;
    })
    .attr("cy", function (d) {
      return project(d).y;
    });
}
const data = [
  [-74.5, 40.05],
  [-74.45, 40.0],
  [-74.55, 40.0],
];
const container = map.getCanvasContainer();
const canvas = d3
  .select(container)
  .append("canvas")
  .attr("width", containerWidth)
  .attr("height", containerHeight)
  .style("position", "absolute")
  .style("z-index", 2);

var context = canvas.node().getContext("2d");

var customBase = document.createElement("custom");
var custom = d3.select(customBase); // replacement of SVG
databind(data);

function databind(data) {
  custom
    .selectAll("custom.circle")
    .data(data)
    .join((enter) => enter.append("custom").attr("class", "circle"));
}

function draw() {
  context.clearRect(0, 0, containerWidth, containerHeight);

  var elements = custom.selectAll("custom.circle");
  elements.each(function (d, i) {
    var node = d3.select(this);
    context.fillStyle = "steelblue";
    context.beginPath();
    context.arc(project(d).x, project(d).y, 10, 0, 2 * Math.PI);
    context.fill();
  });
}
map.on("viewreset", draw);
map.on("move", draw);
map.on("moveend", draw);
draw();
