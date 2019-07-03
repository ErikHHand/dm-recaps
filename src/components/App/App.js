import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route } from 'react-router-dom';

import Navigation from  "../Navigation/Navigation";
import LandingPage from '../Landing/Landing';
import SignUpPage from '../SignUp/SignUp';
import SignInPage from '../SignIn/SignIn';
import HomePage from '../Home/Home';
import AccountPage from '../Account/Account';
import { AuthUserContext } from '../Session/Session';

import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase/Firebase';
import { withAuthentication } from '../Session/Session';


import './App.css';
import './../../styles.css';

class App extends Component {

  	render() {
		return (
			<Router>
				<div className="App">
					<Navigation />

					<hr />

					<Route exact path={ROUTES.LANDING} component={LandingPage} />
					<Route path={ROUTES.SIGN_UP} component={SignUpPage} />
					<Route path={ROUTES.HOME} component={HomePage} />
				</div>
			</Router>
		);
	}
}

export default withAuthentication(App);
