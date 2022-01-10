const MARGIN = { LEFT: 40, RIGHT: 20, TOP: 10, BOTTOM: 65 };
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM;

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

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
  .text("By Month");

// Y label
g.append("text")
  .attr("class", "y axis-label")
  .attr("x", -(HEIGHT / 2))
  .attr("y", -60)
  .attr("font-size", "16px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Revenue");

d3.csv("/data/revenues.csv")
  .then((data) => {
    data.forEach((d) => {
      d.revenue = Number(d.revenue);
      d.profit = Number(d.profit);
      console.log(d);
    });

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, WIDTH])
      .paddingInner(0.3)
      .paddingOuter(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.revenue)])
      .range([HEIGHT, 0]);

    const xAxisCall = d3.axisBottom(x);
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${HEIGHT})`)
      .call(xAxisCall)
      .selectAll("text")
      .attr("y", "10")
      .attr("x", "-5")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-40)");

    const yAxisCall = d3.axisLeft(y).tickFormat((d) => d + "m");
    g.append("g").attr("class", "y axis").call(yAxisCall);

    const recs = g.selectAll("rect").data(data);

    recs
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.month))
      .attr("y", (d) => y(d.revenue))
      .attr("width", x.bandwidth)
      .attr("height", (d) => HEIGHT - y(d.revenue))
      .attr("fill", "grey");
  })
  .catch((err) => {
    console.log(err);
  });
