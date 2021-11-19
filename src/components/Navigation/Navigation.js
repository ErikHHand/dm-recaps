import React, { Component } from 'react';
import { Route, Redirect, Switch} from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import Landing from '../Landing/Landing';
import NotFound from '../NotFound/NotFound';
import CampaignsPage from '../CampaignsPage/CampaignsPage';
import CampaignRecaps from '../CampaignRecaps/CampaignRecaps';
import Account from '../Account/Account';
import Navbar from '../Navbar/Navbar';

import { AuthUserContext } from '../Session/Session';
import { UserDataContext } from '../Session/Session';

import Container from 'react-bootstrap/Container'

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
            <UserDataContext.Consumer>
                {userDataContext => (
                    <Router>
                        <Container fluid="lg" className="container-app container-all">
                            <Navbar/>
                            <Switch>
                                <Route
                                    exact path="/"
                                    render={ () => (
                                        <Redirect to="/campaigns"/>
                                        )}
                                />
                                <Route
                                    exact path="/campaigns"
                                    render = { (props) => <CampaignsPage {...props}/> }
                                />
                                <Route
                                    path = "/campaigns/:id"
                                    render = { (props) => <CampaignRecaps {...props} userDataContext={userDataContext}/> }
                                />
                                <Route
                                    path = "/account/"
                                    render = { (props) => <Account {...props} userDataContext={userDataContext}/> }
                                />
                                <Route path='*' component={NotFound} />                        
                            </Switch>
                        </Container>
                    </Router>
                )}
            </UserDataContext.Consumer>
        );

        return (
            <AuthUserContext.Consumer>
                {authUser => {
                    // Wait for login response before rendering any components
                    switch(authUser){
                        case "WAITING":
                            break;
                        case null:
                            return nonAuthUserNav;
                        default:
                            return authUserNav;
                    }
                }}
            </AuthUserContext.Consumer>
        );
    }
}
  

export default Navigation;