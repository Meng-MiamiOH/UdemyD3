const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM;

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

let time = 0;

const g = svg
  .append("g")
  .attr("transform", `translate(${MARGIN.LEFT * 2}, ${MARGIN.TOP})`);

// Scales
const x = d3.scaleLog().base(10).range([0, WIDTH]).domain([142, 150000]);
const y = d3.scaleLinear().range([HEIGHT, 0]).domain([0, 90]);

const area = d3
  .scaleLinear()
  .range([25 * Math.PI, 1500 * Math.PI])
  .domain([2000, 1400000000]);

const continentColor = d3.scaleOrdinal(d3.schemePastel1);

// Labels
const xLabel = g
  .append("text")
  .attr("x", WIDTH / 2)
  .attr("y", HEIGHT + 50)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("GDP-per-capita ($)");

const yLabel = g
  .append("text")
  .attr("x", -170)
  .attr("y", -40)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Life Expectancy (Years)");

const timeLabel = g
  .append("text")
  .attr("x", WIDTH - 240)
  .attr("y", HEIGHT - 10)
  .attr("font-size", "60px")
  .attr("opacity", "0.4")
  .attr("text-anchor", "middle")
  .text("1800"); //initial value

// X Axis
const xAxisCall = d3
  .axisBottom(x)
  .tickValues([400, 4000, 40000])
  .tickFormat(d3.format("$"));
g.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${HEIGHT})`)
  .call(xAxisCall);

// Y Axis
const yAxisCall = d3.axisLeft(y);
g.append("g").attr("class", "y axis").call(yAxisCall);

d3.json("/data/data.json")
  .then((data) => {
    // clean data
    const formattedData = data.map((year) => {
      return year["countries"]
        .filter((country) => {
          const dataExists = country.income && country.life_exp;
          return dataExists;
        })
        .map((country) => {
          country.income = Number(country.income);
          country.life_exp = Number(country.life_exp);
          return country;
        });
    });

    d3.interval(() => {
      // at the end of our data, loop back
      time = time < 214 ? time + 1 : 0;
      update(formattedData[time]);
    }, 2000);

    // first run of the visualization
    update(formattedData[0]);

    function update(data) {
      const t = d3.transition().duration(100);

      // JOIN new data with old elements.
      const circles = g.selectAll("circle").data(data, (d) => d.country);

      // EXIT old elements not present in new data.
      circles.exit().remove();

      // ENTER new elements present in new data.
      circles
        .enter()
        .append("circle")
        .attr("fill", (d) => continentColor(d.continent))
        // UPDATE old elements present in new data.
        .merge(circles)
        .transition(t)
        .attr("cx", (d) => x(d.income))
        .attr("cy", (d) => y(d.life_exp))
        .attr("r", (d) => Math.sqrt(area(d.population) / Math.PI));

      // update the time label
      timeLabel.text(String(time + 1800));
    }
  })
  .catch((err) => {
    console.log(err);
  });
