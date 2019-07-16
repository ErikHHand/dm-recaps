import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter } from "react-router-dom";
import * as serviceWorker from './serviceWorker';

import App from './components/App/App';
import Firebase, { FirebaseContext } from './components/Firebase/Firebase';


require('dotenv').config()

ReactDOM.render(
	<FirebaseContext.Provider value={new Firebase()}>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</FirebaseContext.Provider>,
	document.getElementById('root')
);

serviceWorker.unregister();
