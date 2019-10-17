import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Login from './Login.js'
import Buscador from './Buscador.js'
class App extends Component {

  render(){
    return(
      <Switch>
        <Route exact path="/">
          <Buscador />
        </Route>
        <Route path="/Buscador">
          <Buscador />
        </Route>
      </Switch>
    )
  }
}

export default App;
