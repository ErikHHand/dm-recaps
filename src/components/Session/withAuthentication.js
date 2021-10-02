import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import * as ROUTES from '../../constants/routes';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase/Firebase';

const withAuthentication = Component => {
	class WithAuthentication extends React.Component {

		constructor(props) {
			super(props);
	  
			this.state = {
			  	authUser: "WAITING",
			};
		}

		// When mounting, add listener that triggers when user signs in or signs out
		componentDidMount() {
			this.listener = this.props.firebase.auth.onAuthStateChanged(
				authUser => {
					if(authUser) {
						// User signed in
						this.setState({ authUser });
					} else {
						// User signed out
						this.setState({ authUser: null });
						this.props.history.push(ROUTES.LANDING);
					}
				}
			);
		}

		// Remove listener when unmounting
		componentWillUnmount() {
			this.listener();
		}

		render() {
			return (
				<AuthUserContext.Provider value={this.state.authUser}>
				  	<Component {...this.props} />
				</AuthUserContext.Provider>
			);
		}
	}

	return compose(
		withRouter,
		withFirebase,
	)(WithAuthentication);
};

export default withAuthentication;