import React, { Component } from 'react';

import Navigation from  "../Navigation/Navigation";

import { withAuthentication } from '../Session/Session';

import './App.css';
import './../../styles.css';

require('dotenv').config()

class App extends Component {

  	render() {
		return (
			<div className="App">
				<Navigation/>
			</div>
		);
	}
}

export default withAuthentication(App);
