import React from 'react';
import { Route, Switch } from "react-router-dom";

import AuthUser from '../AuthUser/AuthUser';
import Landing from '../Landing/Landing';
import NotFound from '../NotFound/NotFound';

import { AuthUserContext } from '../Session/Session';


const Navigation = () => (
	<div>
        <AuthUserContext.Consumer>{
            authUser => {
                // Wait for login response before rendering any components
                switch(authUser){
                    case "WAITING":
                        console.log("waiting")
                        break;
                    case null:
                        console.log("NonAuth")
                        return <NonAuthUser/>;
                    default:
                        console.log("Auth")
                        return <AuthUser/>;
                }
            }
        }
        </AuthUserContext.Consumer>
    </div>
);
  
const NonAuthUser = () => (

    <Switch>
        <Route
            exact path="/"
            component={Landing}
        />
        <Route 
            path='*' 
            component={NotFound} 
        />                        
    </Switch>
);

export default Navigation;