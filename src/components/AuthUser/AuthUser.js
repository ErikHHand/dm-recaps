import React, { Component } from 'react';
import { Route, Redirect, Switch } from "react-router-dom";

import NotFound from '../NotFound/NotFound';
import HomePage from '../HomePage/HomePage';
import CampaignRecaps from '../CampaignRecaps/CampaignRecaps';

import { withFirebase } from '../Firebase/Firebase';

class AuthUser extends Component {
	constructor(props) {
        super(props);

        this.state = {
            status: "LOADING",
        };
	}
	
	componentDidMount() {

        let auth = this;

		// TODO
        // Get necessary data from Firestore and add to global state
        // Is this still relevant?
		auth.setState({
			status: "LOADED",
		});
	}
	
	render() {
        console.log(this.props)
        let navigation = null;

        // Switch for waiting until stuff (what exactly?) have been loaded.
        switch (this.state.status) {
            case "LOADING":
                console.log("Loading");
                navigation = <em>Loading</em>;
                break;
            case "LOADED":
                console.log("loaded");
                navigation =
                    <Switch>
                        <Route
                            exact path="/"
                            render={ () => (
                                <Redirect to="/campaigns"/>
                                )}
                        />
                        <Route
                            exact path="/campaigns"
                            render = { (props) =>
                                <HomePage {...props}/>
                            }
                        />
                        <Route
                            path = "/campaigns/:id"
                            render = { (props) =>
                                <CampaignRecaps {...props}/>
                            }
                        />
                        <Route path='*' component={NotFound} />                        
                    </Switch>;
                break;
            default:
                navigation = <b>Failed to load data, please try again</b>;
                break;
        }
        return navigation;
    }
}

export default withFirebase(AuthUser);