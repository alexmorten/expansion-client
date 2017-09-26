import React from 'react'
import * as d3 from 'd3'
import ReactFauxDOM, {withFauxDOM}  from 'react-faux-dom';
import './ForceGraph.css';
const animationLength = 30000;

class ForceGraph extends React.Component {

  componentDidUpdate (prevProps, prevState) {
    // do not compare props.chart as it gets updated in updateD3()
    if (this.props.data.nodes !== prevProps.data.nodes || this.props.data.links !== prevProps.data.links) {
      console.log("updating d3");
      this.updateD3()
    }
  }
  componentDidMount () {
    this.width=this.props.width || 1000;
    this.height=this.props.height || 800;
    const faux = this.props.connectFauxDOM('svg', 'chart');

    d3.select(faux)
    .attr('width',this.width)
    .attr('height',this.height).append("g");
    this.updateD3();

  }
  updateD3=()=>{
    var colors = d3.scaleOrdinal(d3.schemeCategory20);
    const faux = this.props.connectFauxDOM('svg', 'chart');
    const svg = d3.select(faux);
    // const chart = svg.selectAll("g");
    var data = this.props.data;

    var simulation = d3.forceSimulation()
    .force("link",d3.forceLink().id((d)=>{return d.id}).distance(10).strength(0.8))
    .force("charge",d3.forceManyBody().strength(-50))
    .force("center",d3.forceCenter(this.width/2,this.height/2))
    .alphaDecay(0.03)

    var links = svg.selectAll(".link").data(data.links,d=>d.id);
    links.enter().append("line")
    .attr("class","link")
    .attr("stroke-width",1)
    .style("stroke","grey");
    links.exit().remove();
    var nodes = svg.selectAll(".node").data(data.nodes,(d)=>d.id);
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
    nodes.exit().remove();



    simulation
    .nodes(data.nodes)
    .on("tick",ticked);

    simulation.force("link")
    .links(data.links);
    function ticked() {
      const _links = svg.selectAll(".link").data(data.links,d=>d.id);
      _links.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      const _nodes = svg.selectAll(".node").data(data.nodes,d=>d.id);
      _nodes.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
    }
    var that = this;
    function dragstarted(d) {
      // if (!d3.event.active) simulation.alphaTarget(0.8).restart();
      // d.fx = d.x;
      // d.fy = d.y;
      //  that.props.animateFauxDOM(animationLength);

    }

    function dragged(d) {
      // d.fx = d3.event.sourceEvent.clientX;
      // d.fy = d3.event.sourceEvent.clientY;
      // console.log(d3.event);
      //
      // that.props.animateFauxDOM(animationLength);

    }

    function dragended(d) {
      // if (!d3.event.active) simulation.alphaTarget(0);
      // d.fx = null;
      // d.fy = null;
      //  that.props.animateFauxDOM(animationLength);

    }
    this.props.animateFauxDOM(animationLength);
    simulation.restart()
  }
  render () {


    return (
      <div>

        <div className='renderedD3'>

          {this.props.chart}
        </div>
      </div>
    )



  }
}

ForceGraph.defaultProps = {
  chart: 'loading'
}

export default withFauxDOM(ForceGraph)
