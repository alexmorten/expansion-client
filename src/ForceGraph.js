import React from 'react'
import * as d3 from 'd3'
import ReactFauxDOM, {withFauxDOM}  from 'react-faux-dom';
import './ForceGraph.css';
const animationLength = 30000;

class ForceGraph extends React.Component {

  componentDidUpdate (prevProps, prevState) {
    // do not compare props.chart as it gets updated in updateD3()
    // if (this.props.data.nodes !== prevProps.data.nodes || this.props.data.links !== prevProps.data.links) {
    //   console.log("updating d3");
    //   this.updateD3()
    // }
    if(this.props.data!==prevProps.data){
      this.updateD3();
    }
  }
  componentDidMount () {
    this.width=this.props.width || 1000;
    this.height=this.props.height || 800;
    const faux = this.props.connectFauxDOM('g', 'chart');

    this.updateD3 = ()=>{
      var colors = d3.scaleOrdinal(d3.schemeCategory20);
      const faux = this.props.connectFauxDOM('g', 'chart');
      const chart = d3.select(faux);
      // const chart = svg.selectAll("g");
      var data = this.props.data;
      const forceX = d3.forceX(this.width / 2).strength(0.1)
      const forceY = d3.forceY(this.height / 2).strength(0.1)

      var simulation = d3.forceSimulation()
      .force("link",d3.forceLink().id((d)=>{return d.id}).distance(20))
      .force("charge",d3.forceManyBody().strength(-50))
      .force("x",forceX)
      .force("y",forceY)
      // .force("center",d3.forceCenter(this.width/2,this.height/2))
      .alphaDecay(0.05)

      var links = chart.selectAll(".link").data(data.links,d=>d.id);
      links.enter().append("line")
      .attr("class","link")
      .attr("stroke-width",1);
      links.exit()
      .attr("opacity",1)
      .transition().delay(500).duration(500)
      .attr("opacity",0)
      .transition()
      .remove();
      var nodes = chart.selectAll(".node").data(data.nodes,(d)=>d.id);
      var nodesUpdate = nodes.enter().append("circle");
      nodes.merge(nodesUpdate)
      .attr("class","node")
      .attr("r",7)
      .attr("fill",d=>d.owner ? (d.owner === this.props.thisPlayer ?  "steelblue" : "red") :"lightgrey")
      .call(
        d3.drag()
        .on("start",dragstarted)
        .on("drag",dragged)
        .on("end",dragended)
      )
      .on("click",(d)=>{
        this.props.onNodeClick(d);
      })
      .append("title").text(d=>d.id)
      nodes.exit()
      .transition().delay(d=>(d.id===this.props.lastClickedNode? 0 : 500)).duration((500))
      .attr("r",10)
      .transition().duration(500)
      .attr("r",0)
      .transition()
      .remove();



      simulation
      .nodes(data.nodes)
      .on("tick",ticked);

      simulation.force("link")
      .links(data.links);
      function ticked() {
        const _links = chart.selectAll(".link").data(data.links,d=>d.id);
        _links.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        const _nodes = chart.selectAll(".node").data(data.nodes,d=>d.id);
        _nodes.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
      }
      var that = this;
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.6).restart();
        d.fx = d.x;
        d.fy = d.y;
        that.props.animateFauxDOM(animationLength);

      }

      function dragged(d) {
        var point = cursorPoint(that.svg,d3.event.sourceEvent);
        console.log(point);
        d.fx = point.x;
        d.fy = point.y;

        that.props.animateFauxDOM(animationLength);

      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        that.props.animateFauxDOM(animationLength);

      }
      this.props.animateFauxDOM(animationLength);
      simulation.restart()
  }
  this.updateD3();

  }
  render () {
    console.log("rendering");

    return (
      <div>

        <div className='renderedD3'>
          <svg width={1000} height={800} ref={(element)=>{this.svg=element}}>
            {this.props.chart}
          </svg>
        </div>
      </div>
    )



  }
}

ForceGraph.defaultProps = {
  chart: 'loading'
}

export default withFauxDOM(ForceGraph)

function cursorPoint(svg,evt){
  console.log(svg);
  var pt = svg.createSVGPoint();
  pt.x = evt.clientX; pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
