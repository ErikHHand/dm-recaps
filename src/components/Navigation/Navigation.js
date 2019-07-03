import React from 'react';
import { Route, Redirect, Switch } from "react-router-dom";

import AuthUser from '../AuthUser/AuthUser';
import Landing from '../Landing/Landing';
import SignUp from '../SignUp/SignUp';
import NotFound from '../NotFound/NotFound';

import { AuthUserContext } from '../Session/Session';



const Navigation = () => (
	<div>
        <AuthUserContext.Consumer>{
            authUser => {
                // Wait for login response before rendering any components
                switch(authUser){
                    case "WAITING":
                        break;
                    case null:
                        return <NonAuthUser/>;
                    default:
                        return <AuthUser/>;
                }
            }
        }
        </AuthUserContext.Consumer>
    </div>
);
  
const NonAuthUser = () => (

	<div>
        <Switch>
            <Route
                exact path="/"
                render={ () => (
                    <Redirect to="/signin"/>
                    )}
                    />
            <Route
                path="/signin"
                component={Landing}
                />
            <Route
                path="/signup"
                component={SignUp}
                />
            <Route 
                path='*' 
                component={NotFound} 
            />                        
        </Switch>
    </div>
);

export default Navigation;