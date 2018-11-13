{
  var LIKERT_MAX = 7;
  var LIKERT_NEUTRAL = Math.round(LIKERT_MAX/2);
  var formatPercent = d3.format("+.0%");

  var margin = { top: 10, right: 90, bottom: 20, left: 30 },
    width = +d3.select( ".container" ).style( 'width' ).slice( 0, -2 ) - 140,
    height = 150;
  
  /* Data Loading */
  d3.csv("./data/results-easiness.csv", function (err, data) {
    if (err) throw err;
    
    drawLikertChart( data, "easiness", [ "Significantly hard", "Hard", "Somewhat hard", "Equal", "Somewhat easy", "Easy", "Significantly easy" ] );    
    
  });

  d3.csv("./data/results-usefulness.csv", function (err, data) {
    if (err) throw err;
    
    drawLikertChart( data, "usefulness", [ "Significantly useless", "Useless", "Somewhat useless", "Equal", "Somewhat useful", "Useful", "Significantly useful" ] );    
    
  });

  d3.csv("./data/results-satisfaction.csv", function (err, data) {
    if (err) throw err;
    
    drawLikertChart( data, "satisfaction", [ "Significantly dissatisfied", "Dissatisfied", "Somewhat dissatisfied", "Equal", "Somewhat satisfied", "Satisfied", "Significantly satisfied" ] );    
    
  });

  function drawLikertChart( data, id, answers ) {

    var svg = d3.select( "#" + id )
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var y = d3.scaleBand()
        .padding(0.1)
        .rangeRound([margin.top, height - margin.bottom]);

    var x = d3.scaleLinear()
        .rangeRound([margin.left, width - margin.right]);

    var z = d3.scaleSequential(d3.interpolateRdBu)
      .domain([-3,3]);

    var totalAnswers = d3.max(data, function (q) {
      return d3.range(1, LIKERT_MAX+1).reduce(function (acc, val) {
        q[val]=+q[val];
        return acc+ q[val]
      }, 0);
    });
    
    var series = d3.stack()
        .keys(d3.range(1,LIKERT_MAX+1))
        .offset(stackOffsetLikert)
        (data);

    y.domain(data.map(function(d) { return d.question; }));
    x.domain([d3.min(series, stackMin), d3.max(series, stackMax)]);

    svg.append("g")
      .selectAll("g")
      .data(series)
      .enter().append("g")
        .attr("fill", function(d) { return z(+d.key - LIKERT_NEUTRAL); })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("height", y.bandwidth)
        .attr("y", function(d) { return y(d.data.question); })
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })

    svg.append("g")
        .attr("transform", "translate(0," + (height-margin.bottom) + ")")
        .call(d3.axisBottom(x).tickFormat(function (d) {return formatPercent(Math.abs(d/totalAnswers));}));

    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));

    addLegend( svg, z, answers );
    // var linear = d3.scaleLinear()
    // .domain([0,10])
    // .range(["rgb(46, 73, 123)", "rgb(71, 187, 94)"]);
    // addLegend(linear)

    function stackMin(serie) {
      return d3.min(serie, function(d) { return d[0]; });
    }

    function stackMax(serie) {
      return d3.max(serie, function(d) { return d[1]; });
    }

    // Assumes that the series include answers in the LIKERT_MAX Likert scale (default 7), therefore
    // 1-3 are negative, 4 is neutral and 5-7 are positive
    function stackOffsetLikert(series, order) {
      if (!((n = series.length) > 1)) return;
      for (var i, j = 0, d, dy, yp, yn, n, m = series[order[0]].length; j < m; ++j) {
        // Stack the neutral and positive values
        for (yp = yn = 0, i = LIKERT_NEUTRAL-1; i < n; ++i) {
          dy = (d = series[order[i]][j])[1] - d[0];

          if (i=== (LIKERT_NEUTRAL-1)) {
            //neutral goes centered in the middle
            d[0] = yp -dy/2, d[1] = yp += dy/2;
          } else {
            d[0] = yp, d[1] = yp += dy;
          }
        }
        // Now stack the negative values
        for (yp = yn = 0, i = LIKERT_NEUTRAL-1; i >= 0 ; --i) {
          dy = (d = series[order[i]][j])[1] - d[0];
          if (i=== (LIKERT_NEUTRAL-1)) {
            yp -= dy/2;
          } else
          if (i <(LIKERT_NEUTRAL-1)) {
            d[1] = yp, d[0] = yp -= dy;
          }
        }
      }
    }

  }

  function addLegend( svg, z, answers ) {

    svg.append( "g" )
      .attr( "class", "legend" )
      .attr( "transform", "translate("+ ( width - margin.right + 20 ) + ",20)" );

    var colorLegend = d3.legendColor()
      .labelFormat( d3.format( ".2f" ) )
      .cells( LIKERT_MAX )
      .title( "Answers" )
      .labels( answers )
      .scale( z );

    svg.select( ".legend" )
      .call( colorLegend );

  }

}