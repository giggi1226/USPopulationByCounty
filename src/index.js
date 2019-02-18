import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component{
    componentDidMount(){
      var svg = d3.select("svg")
        .style("width", "100%")
        .style("height", "auto");
        
      const g = svg.append("g")
        .attr("transform", "translate(0,40)");

      var path = d3.geoPath();
      var data = d3.map();

      var colorScheme = d3.schemePuBu[9];
      var colorScale = d3.scaleQuantize()
        .domain([0, 90])
        .range(colorScheme);

      const x = d3.scaleLinear()
        .domain(d3.extent(colorScale.domain()))
        .rangeRound([600, 860]);

      const format = d3.format("")

      d3.queue()
        .defer(d3.json, 'https://d3js.org/us-10m.v1.json')
        .defer(d3.csv, '/src/county_population.csv', function(d){
          data.set(`${d.STATE.padStart(2, 0)}${d.COUNTY.padStart(3, 0)}`, d.POPESTIMATE2017);
        })
        .await(analyze);

      function analyze(error, us){
        g.append("text")
          .attr("class", "caption")
          .attr("x", x.range()[0])
          .attr("y", -6)
          .attr("fill", "black")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text('Population in Thousands');

        g.selectAll("rect")
        .data(colorScale.range().map(d => colorScale.invertExtent(d)))
        .enter().append("rect")
          .attr("height", 8)
          .attr("x", d => x(d[0]))
          .attr("width", d => x(d[1]) - x(d[0]))
          .attr("fill", d => colorScale(d[0]));

        g.call(d3.axisBottom(x)
          .tickSize(13)
          .tickFormat(format)
          .tickValues(colorScale.range().slice(1).map(d => colorScale.invertExtent(d)[0])))
          .select(".domain")
            .remove();

        svg.append("g")
          .attr("class", "counties")
          .selectAll("path")
          .data(topojson.feature(us, us.objects.counties).features)
          .enter().append("path")
          .attr("fill", (d) => {
              d.total = data.get(d.id) || 0;
              return colorScale(d.total/1000);
          })
          .attr("d", path)

        svg.append("path")
          .attr("class", "states")
          .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
          .attr("fill", "none")
          .attr("stroke-linejoin", "round")
          .attr("d", path);
        }
    }
    render(){
        return(
            <div>
              <svg viewBox='0 0 960 600' width='960' height='600' style={{width: '100%', height: 'auto' }}></svg> 
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));