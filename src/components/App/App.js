import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route } from 'react-router-dom';

import Navigation from  "../Navigation/Navigation";
import LandingPage from '../Landing/Landing';
import SignUpPage from '../SignUp/SignUp';
import SignInPage from '../SignIn/SignIn';
import HomePage from '../Home/Home';
import AccountPage from '../Account/Account';

import * as ROUTES from '../../constants/routes';

import './App.css';

const App = () => (
  <Router>
    <Navigation />
  </Router>
);

export default App;
