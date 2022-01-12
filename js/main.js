const MARGIN = { LEFT: 40, RIGHT: 20, TOP: 10, BOTTOM: 65 };
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM;

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

let flag = true;

const g = svg
  .append("g")
  .attr("transform", `translate(${MARGIN.LEFT * 2}, ${MARGIN.TOP})`);

// X label
g.append("text")
  .attr("class", "x axis-label")
  .attr("x", WIDTH / 2)
  .attr("y", HEIGHT + 60)
  .attr("font-size", "16px")
  .attr("text-anchor", "middle")
  .text("GDP-per-capita");

// Y label
g.append("text")
  .attr("class", "y axis-label")
  .attr("x", -(HEIGHT / 2))
  .attr("y", -60)
  .attr("font-size", "16px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Life Expectancy");

const x = d3.scaleBand().range([0, WIDTH]).paddingInner(0.3).paddingOuter(0.2);

const y = d3.scaleLinear().range([HEIGHT, 0]);

const xAxisGroup = g
  .append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${HEIGHT})`);

const yAxisGroup = g.append("g").attr("class", "y axis");

d3.json("/data/data.json")
  .then((data) => {
    data.forEach((d) => {
      d.countries.forEach((c) => {
        if (c.income === null) c.income = 0;
        if (c.life_exp === null) c.life_exp = 0;
      });
    });

    console.log(data);

    // d3.interval(() => {
    //   update(data);
    // }, 2000);

    // update(data);

    function update(data) {
      const t = d3.transition().duration(750);

      x.domain(data.map((d) => d.month));
      y.domain([0, d3.max(data, (d) => d[value])]);

      const xAxisCall = d3.axisBottom(x);

      xAxisGroup
        .transition(t)
        .call(xAxisCall)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

      const yAxisCall = d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((d) => d + "m");
      yAxisGroup.transition(t).call(yAxisCall);

      // JOIN new data with old elements.
      const recs = g.selectAll("circle").data(data, d=> d.month);

      // EXIT old elements not present in new data.
      recs
        .exit()
        .attr("fill", "red")
        .transition(t)
        .attr("cy", y(0))
        .remove();

      // ENTER new elements present in new data.
      recs
        .enter()
        .append("circle")
        .attr("cy", y(0))
        .attr("r", 5)
        .attr("fill", "grey")
        // UPDATE old elements present in new data.
        .merge(recs)
        .transition(t)
        .attr("cx", (d) => x(d.month) + (x.bandwidth() / 2))
        .attr("cy", (d) => y(d[value]))


    }
  })
  .catch((err) => {
    console.log(err);
  });
