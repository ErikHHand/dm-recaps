import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Navigation from  "../Navigation/Navigation";

import './App.css';

const App = () => (
  <Router>
    <Navigation />
  </Router>
);

export default App;
