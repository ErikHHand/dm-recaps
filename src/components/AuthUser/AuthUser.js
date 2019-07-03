import React, { Component } from 'react';
import { Route, Redirect, Switch } from "react-router-dom";

import NotFound from '../NotFound/NotFound';
import HomePage from '../HomePage/HomePage';
import SessionsPage from '../SessionsPage/SessionsPage';
import TagsPage from '../TagsPage/TagsPage';

import { withFirebase } from '../Firebase/Firebase';

class AuthUser extends Component {
	constructor(props) {
        super(props);

        this.state = {
            status: "LOADING",
        };

        // This is need for callbacks that will be passed to lower level components
        //this.handleSearchStringChange = this.handleSearchStringChange.bind(this);
	}
	
	componentDidMount() {

        let auth = this;

		// TODO
		// Get necessary data from Firestore and add to global state
		auth.setState({
			status: "LOADED",
		});
	}
	
	// Add functions for changing the global state here

	render() {

        let navigation = null;

        // Switch for waiting until wishlist and list of seen movies have been loaded.
        switch (this.state.status) {
            case "LOADING":
                navigation = <em>Loading</em>;
                break;
            case "LOADED":
                navigation =
                    <div>
                        <Switch>
                            <Route
                                exact path="/"
                                render={ () => (
                                    <Redirect to="/campaigns"/>
                                    )}
							/>
                            <Route
                                path="/campaigns"
                                render = { (props) =>
                                    <HomePage {...props}/>
                                }
							/>
                            <Route
                                path = "/sessions"
                                render = { (props) =>
                                    <SessionsPage {...props}/>
                                }
                            />
                            <Route
                                path = "/tags"
                                render = {(props) =>
                                    <TagsPage {...props}/>
                                }
                            />
                            <Route path='*' component={NotFound} />                        
                        </Switch>
                    </div>;
                break;
            default:
                navigation = <b>Failed to load data, please try again</b>;
                break;
        }
        return navigation;
    }
}

export default withFirebase(AuthUser);