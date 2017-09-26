import React from "react";
import ForceGraph from "./ForceGraph";
import socketIOClient from "socket.io-client";
const endpoint = "http://localhost:4001";
class Game extends React.Component{
  state={
    nodes:[],
    links:[],
    gameInitiated:false,
    id:null,
    playerAtTurn:"",
    gameStopped:false,
  }
  componentDidMount(){
    this.nextId=0;
    this.socket = socketIOClient(endpoint);
    this.socket.on("set_id",(data)=>this.setState({id:data.id}));
    this.socket.on("game_started",(data)=>this.setState({nodes:data.nodes,links:data.links,gameInitiated:true,playerAtTurn:data.nextPlayer}));
    this.socket.on("game_stopped",(data)=>{window.location.reload()});
    this.socket.on('turn_made',(data)=>{
      console.log(data);
      console.log("received turn");
      for (var i = 0; i < this.state.nodes.length; i++) {
      var node = this.state.nodes[i];
      if(node.id === data.action.node_id ){
        if(!node.owner){
          node.owner = data.action.player;
          break;
        }else if (node.owner === data.action.player) {
          this.handleNodeExplosion(node);
          break;
        }

      }
      }
      this.setState({nodes:this.state.nodes.slice(),links:this.state.links.slice(),playerAtTurn:data.nextPlayer});
    });
  }
  handleNodeExplosion(node){
    var node_id = node.id;

    var connectedLinks = this.state.links.filter(link=>(link.source.id === node_id || link.target.id === node_id));
    var directlyConnectedNodes = this.state.nodes.filter(node=>{
      return connectedLinks.filter(link=>(link.source.id === node.id || link.target.id == node.id)).length>0
    });

    var destroyedNodes = this.state.nodes.filter(node=>!(
      directlyConnectedNodes.filter(directNode=>(
        directNode.id === node.id
      )).length === 0 || node.owner
    ));
    var restLinks=this.state.links.filter(link=>(
      destroyedNodes.filter(node=>(node.id===link.target.id||node.id===link.source.id)).length===0
    ));
    var restNodes = this.state.nodes.filter(node=>(
      destroyedNodes.filter(destroyedNode=>destroyedNode.id===node.id).length === 0
    ));
    this.state.nodes=restNodes;
    this.state.links=restLinks;
  }
  handleNodeClick=(d)=>{
    this.socket.emit("turn",{id:d.id});
  }
  getScores(){
    var scores = {};
    var nodes = this.state.nodes.forEach(node=>{
      if(node.owner){
        if(scores[node.owner]){
          scores[node.owner]++;
        }else{
          scores[node.owner]=1;
        }
      }
    });
    var scoreArr = [];
    var players = Object.keys(scores);
    players.forEach(player=>{
      scoreArr.push({player:player,score:scores[player]});
    });
    return scoreArr;
  }
  render(){
    console.log("rendering");
    if(!this.state.gameInitiated){
      return(
        <div>
          <h2>Loading</h2>
        </div>
      )
    }
    var scores = this.getScores();
    var scoreItems = scores.map(score=>(
      <p key={score.player} style={{color:(score.player===this.state.id? "blue":"red")}}>
        {score.player}: {score.score} Nodes
      </p>
    ));
    return(
      <div>
      <h4>Scores</h4>
      <div>
        {scoreItems}
      </div>
      <div style={{backgroundColor:(this.state.playerAtTurn===this.state.id?"#d9eef5":"darkgrey"),transition:"all 500ms"}}>
       <ForceGraph
        data={{nodes:this.state.nodes,links:this.state.links}}
        onNodeClick={this.handleNodeClick}
        thisPlayer={this.state.id}
      />
      </div>
      </div>
    )
  }
}

export default Game;
