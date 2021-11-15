import React from 'react';

import Navigation from  "../Navigation/Navigation";

import { withAuthentication } from '../Session/Session';

import './../../styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

require('dotenv').config()

const App = () => (
	<div className="App">
		<Navigation/>
	</div>
)

export default withAuthentication(App);
