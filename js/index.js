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

const container = map.getCanvasContainer();
const svg = d3
  .select(container)
  .append("svg")
  .attr("width", containerWidth)
  .attr("height", containerHeight)
  .style("position", "absolute")
  .style("z-index", 2);

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

const dots = svg
  .selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("r", 20)
  .style("fill", "ff0000");

map.on("viewreset", render);
map.on("move", render);
map.on("moveend", render);
render();
