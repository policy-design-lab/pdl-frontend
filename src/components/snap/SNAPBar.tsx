import * as React from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { ShortFormat } from "./SNAPUtils";

export default function SNAPBar({ margin = {}, w, h }): JSX.Element {
  const Styles = styled.div`
    .axis path,
    .axis line {
      fill: none;
      stroke: #00000099;
      shape-rendering: crispEdges;
    }

    .y1.axis path,
    .y1.axis line {
      stroke: #ba68c8;
    }
    .y1.axis text {
      color: #ba68c8;
    }

    .y0.axis path,
    .y0.axis line {
      stroke: #1f78b4;
    }
    .y0.axis text {
      color: #1f78b4;
    }

    .x.axis path,
    .x.axis line {
      stroke: none;
    }

    .x.axis text {
      fill: #00000099;
    }
  `;

  const rn = React.useRef(null);
  const tooltipRn = React.useRef(null);
  const [width, setWidth] = React.useState(w);
  const [height, setHeight] = React.useState(h);

  React.useEffect(() => {
    renderBar();
  });

  const renderBar = () => {
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;

    //PENDING: move data out for JSON point
    let data = [
      {
        State: "AK",
        "Total Benefits": 1193510939,
        "Avg Monthly Participation": 85825.6,
        totalPaymentInPercentageNationwide: 0.29,
      },
      {
        State: "AL",
        "Total Benefits": 7612086301,
        "Avg Monthly Participation": 739022.4,
        totalPaymentInPercentageNationwide: 1.85,
      },
      {
        State: "AR",
        "Total Benefits": 2877111594,
        "Avg Monthly Participation": 345184.2,
        totalPaymentInPercentageNationwide: 0.7,
      },
      {
        State: "AZ",
        "Total Benefits": 7914537216,
        "Avg Monthly Participation": 824170.6,
        totalPaymentInPercentageNationwide: 1.92,
      },
      {
        State: "CA",
        "Total Benefits": 45796803502,
        "Avg Monthly Participation": 4149162.6,
        totalPaymentInPercentageNationwide: 11.12,
      },
      {
        State: "CO",
        "Total Benefits": 4999286083,
        "Avg Monthly Participation": 480491.6,
        totalPaymentInPercentageNationwide: 1.21,
      },
      {
        State: "CT",
        "Total Benefits": 4017111727,
        "Avg Monthly Participation": 369414.8,
        totalPaymentInPercentageNationwide: 0.98,
      },
      {
        State: "DC",
        "Total Benefits": 1434382643,
        "Avg Monthly Participation": 123167.6,
        totalPaymentInPercentageNationwide: 0.35,
      },
      {
        State: "DE",
        "Total Benefits": 1201645038,
        "Avg Monthly Participation": 122965.4,
        totalPaymentInPercentageNationwide: 0.29,
      },
      {
        State: "FL",
        "Total Benefits": 28706239805,
        "Avg Monthly Participation": 3075569.2,
        totalPaymentInPercentageNationwide: 6.97,
      },
      {
        State: "GA",
        "Total Benefits": 15537007308,
        "Avg Monthly Participation": 1540748.6,
        totalPaymentInPercentageNationwide: 3.77,
      },
      {
        State: "HI",
        "Total Benefits": 3326647759,
        "Avg Monthly Participation": 167761.2,
        totalPaymentInPercentageNationwide: 0.81,
      },
      {
        State: "IA",
        "Total Benefits": 2744845291,
        "Avg Monthly Participation": 303305.8,
        totalPaymentInPercentageNationwide: 0.67,
      },
      {
        State: "ID",
        "Total Benefits": 1112406178,
        "Avg Monthly Participation": 139392.4,
        totalPaymentInPercentageNationwide: 0.27,
      },
      {
        State: "IL",
        "Total Benefits": 19588560679,
        "Avg Monthly Participation": 1859761.6,
        totalPaymentInPercentageNationwide: 4.76,
      },
      {
        State: "IN",
        "Total Benefits": 5921522168,
        "Avg Monthly Participation": 602443.4,
        totalPaymentInPercentageNationwide: 1.44,
      },
      {
        State: "KS",
        "Total Benefits": 1942895257,
        "Avg Monthly Participation": 199867,
        totalPaymentInPercentageNationwide: 0.47,
      },
      {
        State: "KY",
        "Total Benefits": 5466944610,
        "Avg Monthly Participation": 562468.2,
        totalPaymentInPercentageNationwide: 1.33,
      },
      {
        State: "LA",
        "Total Benefits": 8939742978,
        "Avg Monthly Participation": 839004.8,
        totalPaymentInPercentageNationwide: 2.17,
      },
      {
        State: "MA",
        "Total Benefits": 9248321227,
        "Avg Monthly Participation": 849761.4,
        totalPaymentInPercentageNationwide: 2.25,
      },
      {
        State: "MD",
        "Total Benefits": 7323322818,
        "Avg Monthly Participation": 702827.6,
        totalPaymentInPercentageNationwide: 1.78,
      },
      {
        State: "ME",
        "Total Benefits": 1584062521,
        "Avg Monthly Participation": 158339.2,
        totalPaymentInPercentageNationwide: 0.38,
      },
      {
        State: "MI",
        "Total Benefits": 13080174751,
        "Avg Monthly Participation": 1269168.6,
        totalPaymentInPercentageNationwide: 3.18,
      },
      {
        State: "MN",
        "Total Benefits": 5556827743,
        "Avg Monthly Participation": 421720.4,
        totalPaymentInPercentageNationwide: 1.35,
      },
      {
        State: "MO",
        "Total Benefits": 6415713482,
        "Avg Monthly Participation": 689593,
        totalPaymentInPercentageNationwide: 1.56,
      },
      {
        State: "MS",
        "Total Benefits": 3975461420,
        "Avg Monthly Participation": 437570.2,
        totalPaymentInPercentageNationwide: 0.97,
      },
      {
        State: "MT",
        "Total Benefits": 881836156,
        "Avg Monthly Participation": 101067,
        totalPaymentInPercentageNationwide: 0.21,
      },
      {
        State: "NC",
        "Total Benefits": 14906487992,
        "Avg Monthly Participation": 1406413.2,
        totalPaymentInPercentageNationwide: 3.62,
      },
      {
        State: "ND",
        "Total Benefits": 431901098,
        "Avg Monthly Participation": 48363.8,
        totalPaymentInPercentageNationwide: 0.1,
      },
      {
        State: "NE",
        "Total Benefits": 1327973122,
        "Avg Monthly Participation": 157698.6,
        totalPaymentInPercentageNationwide: 1.06,
      },
      {
        State: "NH",
        "Total Benefits": 686149885,
        "Avg Monthly Participation": 73575.6,
        totalPaymentInPercentageNationwide: 0.17,
      },
      {
        State: "NJ",
        "Total Benefits": 8000827626,
        "Avg Monthly Participation": 758587.4,
        totalPaymentInPercentageNationwide: 1.94,
      },
      {
        State: "NM",
        "Total Benefits": 5001819748,
        "Avg Monthly Participation": 475890,
        totalPaymentInPercentageNationwide: 1.21,
      },
      {
        State: "NV",
        "Total Benefits": 4375526689,
        "Avg Monthly Participation": 437735.8,
        totalPaymentInPercentageNationwide: 0.32,
      },
      {
        State: "NY",
        "Total Benefits": 29996578143,
        "Avg Monthly Participation": 2747359.8,
        totalPaymentInPercentageNationwide: 7.28,
      },
      {
        State: "OH",
        "Total Benefits": 15363041709,
        "Avg Monthly Participation": 1418443,
        totalPaymentInPercentageNationwide: 3.73,
      },
      {
        State: "OK",
        "Total Benefits": 5984214378,
        "Avg Monthly Participation": 596657.2,
        totalPaymentInPercentageNationwide: 1.45,
      },
      {
        State: "OR",
        "Total Benefits": 6934294497,
        "Avg Monthly Participation": 649851.2,
        totalPaymentInPercentageNationwide: 1.68,
      },
      {
        State: "PA",
        "Total Benefits": 18542755086,
        "Avg Monthly Participation": 1770585.6,
        totalPaymentInPercentageNationwide: 4.5,
      },
      {
        State: "RI",
        "Total Benefits": 1586004008,
        "Avg Monthly Participation": 145582.4,
        totalPaymentInPercentageNationwide: 0.39,
      },
      {
        State: "SC",
        "Total Benefits": 6169724034,
        "Avg Monthly Participation": 608017.4,
        totalPaymentInPercentageNationwide: 1.5,
      },
      {
        State: "SD",
        "Total Benefits": 717999053,
        "Avg Monthly Participation": 77262.8,
        totalPaymentInPercentageNationwide: 0.17,
      },
      {
        State: "TN",
        "Total Benefits": 9402396588,
        "Avg Monthly Participation": 875725,
        totalPaymentInPercentageNationwide: 2.28,
      },
      {
        State: "TX",
        "Total Benefits": 35226520481,
        "Avg Monthly Participation": 3496513.4,
        totalPaymentInPercentageNationwide: 8.55,
      },
      {
        State: "UT",
        "Total Benefits": 1612580391,
        "Avg Monthly Participation": 166652.8,
        totalPaymentInPercentageNationwide: 0.39,
      },
      {
        State: "VA",
        "Total Benefits": 7611226562,
        "Avg Monthly Participation": 733380.8,
        totalPaymentInPercentageNationwide: 1.85,
      },
      {
        State: "VT",
        "Total Benefits": 699552736,
        "Avg Monthly Participation": 69435.2,
        totalPaymentInPercentageNationwide: 0.17,
      },
      {
        State: "WA",
        "Total Benefits": 8946823851,
        "Avg Monthly Participation": 876782.2,
      },
      {
        State: "WI",
        "Total Benefits": 6737507730,
        "Avg Monthly Participation": 668643.4,
        totalPaymentInPercentageNationwide: 1.64,
      },
      {
        State: "WV",
        "Total Benefits": 3013528159,
        "Avg Monthly Participation": 304642.4,
        totalPaymentInPercentageNationwide: 0.73,
      },
      {
        State: "WY",
        "Total Benefits": 264704281,
        "Avg Monthly Participation": 27972.6,
        totalPaymentInPercentageNationwide: 0.06,
      },
    ];

    data.sort(function (a, b) {
      if (a["Total Benefits"] == b["Total Benefits"]) return 0;
      if (a["Total Benefits"] > b["Total Benefits"]) return -1;
      if (a["Total Benefits"] < b["Total Benefits"]) return 1;
    });

    var color = d3
      .scaleOrdinal()
      .domain(["Total Benefits", "Avg Monthly Participation"])
      .range(["#1F78B4", "#BA68C8"]);

    var x0 = d3
      .scaleBand()
      .range([0, graphWidth])
      .paddingInner(0.4)
      .paddingOuter(0.4);
    var x1 = d3.scaleBand();

    var y0 = d3.scaleLinear().range([graphHeight, 0]);
    var y1 = d3.scaleLinear().range([graphHeight, 0]);

    var xAxis = d3.axisBottom(x0).ticks(5);

    var yAxisLeft = d3.axisLeft(y0).tickFormat(function (d) {
      return '$' + ShortFormat(parseInt(d));
    });
    var yAxisRight = d3.axisRight(y1).tickFormat(function (d) {
      return ShortFormat(parseInt(d));
    });

    x0.domain(
      data.map(function (d) {
        return d.State;
      })
    );
    x1.domain(["Total Benefits", "Avg Monthly Participation"]).range([
      0,
      x0.bandwidth(),
    ]);

    y0.domain([
      0,
      d3.max(data, function (d) {
        return d["Total Benefits"]*1.11;
      }),
    ]);
    y1.domain([
      0,
      d3.max(data, function (d) {
        return d["Avg Monthly Participation"]*1.11;
      }),
    ]);

    d3.select(rn.current)
      .attr("width", graphWidth + margin.left + margin.right)
      .attr("height", graphHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Ticks on x-axis and y-axis
    d3.select(rn.current)
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + margin.left + "," + graphHeight+ ")")
      .call(xAxis);

    // y0 text
    d3.select(rn.current)
      .append("g")
      .attr("class", "y0 axis")
      .call(yAxisLeft)
      .attr("transform", "translate(" + margin.left + ",0)")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -1*margin.left)
      .attr("x", -1*graphHeight/2)
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .style("fill", "#1F78B4")
      .text("SNAP benefits ($)");

    d3.select(rn.current)
      .select(".y0.axis")
      .selectAll(".tick")
      .style("fill", "#1F78B4");

    // y1 text
    d3.select(rn.current)
      .append("g")
      .attr("class", "y1 axis")
      .attr("transform", "translate(" + (graphWidth + margin.left) + ",0)")
      .call(yAxisRight)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -1*(margin.right/300))
      .attr("x", -1*graphHeight/2)
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .style("fill", "#BA68C8")
      .text("Avg Monthly Participation");

    d3.select(rn.current)
      .select(".y1.axis")
      .selectAll(".tick")
      .style("fill", "#BA68C8");

    let base = d3
      .select(rn.current)
      .selectAll(null)
      .data(data)
      .enter()
      .append("g")
      .attr("class", "g")
      .attr("transform", function (d) {
        return "translate(" + (x0(d.State) + margin.left) + ",0)";
      });

    // Tooltip
    const tooltip = d3
      .select(tooltipRn.current)
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("padding", "15px")
      .style("background", "#ECF0ED")
      .style("border-radius", "5px")
      .style("color", "#000")
      .text("a simple tooltip");

    //Blue bar
    base
      .append("rect")
      .attr("width", x1.bandwidth())
      .attr("x", function (d) {
        return x1("Total Benefits");
      })
      .attr("y", function (d) {
        return y0(d["Total Benefits"]);
      })
      .attr("height", function (d) {
        return graphHeight - y0(d["Total Benefits"]);
      })
      .style("fill", function (d) {
        return color("Total Benefits");
      })
      .on("mouseenter", function (e) {
        tooltip
          .html(
            `Total Benefits Percentage Nationwide: <br/> ${
              d3.select(this).data()[0]["totalPaymentInPercentageNationwide"]
            }`
          )
          .style("visibility", "visible")
          .style("left", (e.pageX + 70) + "px")
          .style("top", (e.pageY - 70) + "px");
        const newColor = d3.color("#1f78b4").darker(1).formatHex();
        d3.select(this).style("fill", newColor);
      })
      .on("mousemove", function (e) {
        //console.log(e.pageY);
        tooltip
          // .html(
          //   "The exact value of<br>this cell is: " +
          //     d3.select(this).data()[0]["totalPaymentInPercentageNationwide"]
          // )
          .style("left", (e.pageX ) + "px")
          .style("top", (e.pageY) + "px"); //-d3.pointer(e)[1]
      })
      .on("mouseleave", function () {
        tooltip.html(``).style("visibility", "hidden");
        d3.select(this).style("fill", "#1f78b4");
      });

    //Purple bar
    base
      .append("rect")
      .attr("width", x1.bandwidth())
      .attr("x", function (d) {
        return x1("Avg Monthly Participation");
      })
      .attr("y", function (d) {
        return y1(d["Avg Monthly Participation"]);
      })
      .attr("height", function (d) {
        return graphHeight - y1(d["Avg Monthly Participation"]);
      })
      .style("fill", function (d) {
        return color("Avg Monthly Participation");
      });
    // // Legend
    var legend = d3
      .select(rn.current)
      .selectAll(".legend")
      .data(["Total Benefits", "Avg Monthly Participation"].slice())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) {
        return "translate(0," + i * 20 + ")";
      });

    legend
      .append("rect")
      .attr("x", graphWidth - 48)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    legend
      .append("text")
      .attr("x", graphWidth - 54)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function (d) {
        return d;
      });

    //Header
    d3.select(rn.current)
      .append("text")
      .attr("x", w / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .text("Comparing SNAP Costs and Participation (2018-2022)");

      //scale
      const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([graphHeight, 0]);
    
      d3.select(rn.current).append('line')
      .attr('class', 'y-axis-line')
      .attr('x1', 0)
      .attr('y1', yScale(50))
      .attr('x2', width)
      .attr('y2', yScale(50));
  };



  return (
    <Styles>
      <svg ref={rn} />
      <div ref={tooltipRn} />
    </Styles>
  );
}
