import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Game from "./Game";
class App extends Component {
  render() {
    return (
      <div className="App">
        
        <div>
          <Game/>
        </div>
      </div>
    );
  }
}

export default App;
