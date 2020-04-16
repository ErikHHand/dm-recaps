import React, { Component } from 'react';
import { Route, Redirect, Switch } from "react-router-dom";

import Landing from '../Landing/Landing';
import NotFound from '../NotFound/NotFound';
import CampaignPage from '../CampaignPage/CampaignPage';
import CampaignRecaps from '../CampaignRecaps/CampaignRecaps';

import { AuthUserContext } from '../Session/Session';

/*
    This class holds the main navigation of the app.
    The available navigation links depends on whether or not
    a user is signed in.
*/
class Navigation extends Component {

    render() {

        // Navigation if no user is signed in
        let nonAuthUserNav = (
            <Switch>
                <Route exact path="/" component={Landing}/>
                <Route path='*' component={NotFound}/>                        
            </Switch>
        );

        // Navigation if a user is signed in
        let authUserNav = (
            <Switch>
                <Route
                    exact path="/"
                    render={ () => (
                        <Redirect to="/campaigns"/>
                        )}
                />
                <Route
                    exact path="/campaigns"
                    render = { (props) => <CampaignPage {...props}/> }
                />
                <Route
                    path = "/campaigns/:id"
                    render = { (props) => <CampaignRecaps {...props}/> }
                />
                <Route path='*' component={NotFound} />                        
            </Switch>
        );

        return (
            <AuthUserContext.Consumer>{
                authUser => {
                    // Wait for login response before rendering any components
                    switch(authUser){
                        case "WAITING":
                            break;
                        case null:
                            return nonAuthUserNav;
                        default:
                            return authUserNav;
                    }
                }
            }</AuthUserContext.Consumer>
        );
    }
}
  

export default Navigation;