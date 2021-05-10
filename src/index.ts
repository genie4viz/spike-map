import * as d3 from "d3";
import * as mapboxgl from "mapbox-gl";
import { API_KEY, containerWidth, containerHeight } from "./constants";
import { Piece } from "./models";

d3.select("#map")
  .style("z-index", 1)
  .style("width", containerWidth + "px")
  .style("height", containerHeight + "px")
  .style("position", "relative");

const map = new mapboxgl.Map({
  accessToken: API_KEY,
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  center: [13.79, 53.545], // starting position [lng, lat]
  zoom: 1, // starting zoom
});

const spikeHeight = d3.scaleLinear().range([0, 200]);

const container = map.getCanvasContainer();
const canvas = d3
  .select(container)
  .append("canvas")
  .attr("width", containerWidth)
  .attr("height", containerHeight)
  .style("position", "absolute")
  .style("top", 0)
  .style("left", 0)
  .style("z-index", 2);

const context = canvas.node().getContext("2d");
const custom = d3.select(document.createElement("custom"));

let data: any[] = [];
let selectedDate: string = "";

map.on("viewreset", draw);
map.on("move", draw);
map.on("moveend", draw);

function project(d: Piece) {
  return map.project(new mapboxgl.LngLat(d.lon, d.lat));
}
function spike(x: number, y: number, value: number, bottomWidth = 7) {
  context.fillStyle = "rgba(255, 0, 0, .3)";
  context.strokeStyle = "red";
  context.beginPath();
  context.moveTo(x - bottomWidth / 2, y);
  context.lineTo(x, y - value);
  context.lineTo(x + bottomWidth / 2, y);
  context.fill();
  context.stroke();
  // context.closePath();
}
function legendText(text: string, x: number, y: number) {
  context.fillStyle = "white";
  context.fillText(text, x, y + 14);
  context.font = "sans-serif";
}
function bindData(data: Piece[]) {
  custom
    .selectAll("custom.spike")
    .data(data)
    .join((enter) => enter.append("custom").attr("class", "spike"));
}
function draw() {
  context.clearRect(0, 0, containerWidth, containerHeight);

  const elements = custom.selectAll("custom.spike");
  elements.each(function (d: Piece) {
    spike(project(d).x, project(d).y, spikeHeight(d.value));
  });
  updateLegend();
}
function bindLegend() {
  custom
    .selectAll("custom.legend")
    .data(spikeHeight.ticks(4).slice(1).reverse())
    .join((enter) => enter.append("custom").attr("class", "legend"));
}
function updateLegend() {
  const legendElements = custom.selectAll("custom.legend");
  legendElements.each(function (d: number, i: number) {
    spike(containerWidth - (i + 1) * 24, 740, spikeHeight(d));
    legendText(d3.format(".0s")(d), containerWidth - (i + 1) * 24 - 8, 740);
  });
}
function buildSpike(date: string) {
  const dataToDraw = data.map((d: any) => ({
    country: d["Country/Region"],
    lat: +d["Lat"],
    lon: +d["Long"],
    value: +d[date],
  }));
  bindData(dataToDraw);
  draw();
}
function updateDateList(dates: string[]) {
  d3.select(".date-picker")
    .selectAll("option")
    .data(dates)
    .join((enter) =>
      enter
        .append("option")
        .attr("value", (d) => d)
        .html((d) => d)
    );

  d3.select(".date-picker").on("change", function (e) {
    selectedDate = e.target.value;
    buildSpike(e.target.value);
  });
}
function loadData(url: string) {
  d3.csv(url).then((csvData) => {
    const dates = csvData.columns.slice(4, csvData.columns.length);
    data = csvData;
    spikeHeight.domain([
      0,
      d3.max(data, (d) => d3.max(Object.values(d), (e) => +e)),
    ]);
    updateDateList(dates);
    bindLegend();
    buildSpike(selectedDate || dates[0]);
  });
}
d3.select(".update-button").on("click", () => {
  loadData(
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
  );
});

loadData(
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
);
