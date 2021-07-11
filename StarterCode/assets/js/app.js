function displayChartResponsive() {
  //Functions to be used inside displayChartResponsive
  //Clear SVGArea
  function clearSVGArea(svgArea) {
    if (!svgArea.empty()) {
      svgArea.remove();
    }
  }

  //Define xScale
  function xScale(data, xAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[xAxis]),
      d3.max(data, d => d[xAxis])
      ])
      .range([0, width]);
    return xLinearScale;
  }
  //Define yScale
  function yScale(data, yAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[yAxis]),
      d3.max(data, d => d[yAxis])
      ])
      .range([height, 0]);
    return yLinearScale;
  }
  //Change Circles
  function changeCircles(circlesGroup, XScale, XAxis,
    YScale, YAxis) {

    circlesGroup.transition()
      .duration(1700)
      .attr("cx", d => XScale(d[XAxis]))
      .attr("cy", d => YScale(d[YAxis]));
    return circlesGroup;
  }
  //change text 
  function changeText(textGroup, XScale, XAxis,
    YScale, YAxis) {

    textGroup.transition()
      .duration(1700)
      .attr("x", d => XScale(d[XAxis]))
      .attr("y", d => YScale(d[YAxis]))
      .attr("text-anchor", "middle")
      .attr("alignement-baseline", "central");

    return textGroup;
  }
  //change X Axis
  function changeX(XScale, xAxis) {
    var bottomAxis = d3.axisBottom(XScale);
    xAxis.transition()
      .duration(1700)
      .call(bottomAxis);
    return xAxis;
  }
  // change Y Axis
  function changeY(YScale, yAxis) {
    var leftAxis = d3.axisLeft(YScale);
    yAxis.transition()
      .duration(1700)
      .call(leftAxis);
    return yAxis;
  }
  //change tooltip
  function updateToolTip(XAxis, YAxis,
    circlesGroup, textGroup) {
    var xLabel;
    var yLabel;
    switch (XAxis) {
      case "poverty":
        xLabel = "In Poverty (%)";
        break;
      case "age":
        xLabel = "Age (Median)";
        break;
      default:
        xLabel = "Household Income (Median)";
        break;
    }
    switch (YAxis) {
      case "healthcare":
        yLabel = "Lacks Healthcare (%)";
        break;
      case "obesity":
        yLabel = "Obesity (%)";
        break;
      default:
        yLabel = "Smokes (%)";
        break;
    }
    var toolTip = d3.tip()
      .attr("class", "tooltip d3-tip")
      .offset([90, 90])
      .html(function (d) {
        return (`<h6>${d.state}</h6>
                  ${xLabel}-- ${d[XAxis]}
                <br>${yLabel}-- ${d[YAxis]}`);
      });
    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function (data) {
      toolTip.show(data, this);
    }).on("mouseout", function (data) {
      toolTip.hide(data);
    });
    textGroup.call(toolTip);
    textGroup.on("mouseover", function (data) {
      toolTip.show(data, this);
    }).on("mouseout", function (data) {
      toolTip.hide(data);
    });
    return circlesGroup;
  }
  var svgArea = d3.select("body").select("svg");
  clearSVGArea(svgArea);
  //Make the svg responsive
  var svgHeight = window.innerHeight * 0.7;
  var svgWidth = window.innerWidth * 0.7;
  //svg margins
  var margin = {
    top: 20,
    right: 40,
    bottom: 90,
    left: 100
  };
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // append svg and group
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);


  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params 
  var initialX = "poverty";
  var initialY = "obesity";
  //create D3 promise
  d3.csv("assets/data/data.csv")
    .then(function (response) {
      response.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
      });
      var xLinearScale = xScale(response, initialX);
      var yLinearScale = yScale(response, initialY);
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);
      var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

      var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

      var circlesGroup = chartGroup.selectAll(".stateCircle")
        .data(response)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[initialX]))
        .attr("cy", d => yLinearScale(d[initialY]))
        .attr("class", "stateCircle")
        .attr("r", 10)
        .attr("opacity", ".75");
      var textGroup = chartGroup.selectAll(".stateText")
        .data(response)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[initialX]))
        .attr("y", d => yLinearScale(d[initialY] * .995))
        .text(d => (d.abbr))
        .attr("class", "stateText")
        .attr("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("alignement-baseline", "central")
        .attr("fill", "black");

      var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
      //Labels for diferent axis
      var poverty = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

      var age = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

      var income = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");

      var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(-25, ${height / 2})`);

      var obesity = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("x", 0)
        .attr("value", "obesity")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("active", true)
        .text("Obesity (%)");

      var healthcare = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -30)
        .attr("x", 0)
        .attr("value", "healthcare")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

      var smokes = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", 0)
        .attr("value", "smokes")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Smokes (%)");


      var circlesGroup = updateToolTip(initialX, initialY,
        circlesGroup, textGroup);
      // Handle Changes
      xLabelsGroup.selectAll("text")
        .on("click", function () {
          var xSelection = d3.select(this).attr("value");

          if (xSelection !== initialX) {
            initialX = xSelection;
            xLinearScale = xScale(response, initialX);
            xAxis = changeX(xLinearScale, xAxis);
            circlesGroup = changeCircles(circlesGroup, xLinearScale, initialX,
              yLinearScale, initialY);
            textGroup = changeText(textGroup, xLinearScale, initialX,
              yLinearScale, initialY)
            circlesGroup = updateToolTip(initialX, initialY,
              circlesGroup, textGroup);
            switch (initialX) {
              case "poverty":
                poverty.classed("active", true)
                  .classed("inactive", false);
                age.classed("active", false)
                  .classed("inactive", true);
                income.classed("active", false)
                  .classed("inactive", true);
                break;
              case "age":
                poverty.classed("active", false)
                  .classed("inactive", true);
                age.classed("active", true)
                  .classed("inactive", false);
                income.classed("active", false)
                  .classed("inactive", true);
                break;
              default:
                poverty.classed("active", false)
                  .classed("inactive", true);
                age.classed("active", false)
                  .classed("inactive", true);
                income.classed("active", true)
                  .classed("inactive", false);
            }
          }
        });
      yLabelsGroup.selectAll("text")
        .on("click", function () {
          var ySelection = d3.select(this).attr("value");
          if (ySelection !== initialY) {
            initialY = ySelection;
            yLinearScale = yScale(response, initialY);
            yAxis = changeY(yLinearScale, yAxis);
            circlesGroup = changeCircles(circlesGroup, xLinearScale, initialX,
              yLinearScale, initialY);
            textGroup = changeText(textGroup, xLinearScale, initialX,
              yLinearScale, initialY)
            circlesGroup = updateToolTip(initialX, initialY,
              circlesGroup, textGroup);
            switch (initialY) {
              case "healthcare":
                healthcare.classed("active", true)
                  .classed("inactive", false);
                smokes.classed("active", false)
                  .classed("inactive", true);
                obesity.classed("active", false)
                  .classed("inactive", true);
                break;
              case "smokes":
                healthcare.classed("active", false)
                  .classed("inactive", true);
                smokes.classed("active", true)
                  .classed("inactive", false);
                obesity.classed("active", false)
                  .classed("inactive", true);
                break;
              default:
                healthcare.classed("active", false)
                  .classed("inactive", true);
                smokes.classed("active", false)
                  .classed("inactive", true);
                obesity.classed("active", true)
                  .classed("inactive", false);
                break;
            }
          }
        });
    });
}

displayChartResponsive();
d3.select(window).on("resize", displayChartResponsive);