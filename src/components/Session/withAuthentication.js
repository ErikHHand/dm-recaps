import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import * as ROUTES from '../../constants/routes';

import AuthUserContext from './context';
import UserDataContext from './userDataContext';
import { withFirebase } from '../Firebase/Firebase';

const withAuthentication = Component => {
	class WithAuthentication extends React.Component {

		constructor(props) {
			super(props);
	  
			this.state = {
			  	authUser: "WAITING",
				  userData: null,
			};
		}

		// When mounting, add listener that triggers when user signs in or signs out
		componentDidMount() {
			this.listener = this.props.firebase.auth.onAuthStateChanged(
				authUser => {
					if(authUser) {
						// User signed in
						this.setState({ authUser });
						this.props.firebase.db.collection("users").doc(authUser.uid).get()
						.then((doc) => {
							if (doc.exists) {
								this.setState({
									userData: doc.data(),
								});
							}
						});
					} else {
						// User signed out
						this.setState({
							authUser: null
						}, () => {
							this.props.history.push(ROUTES.LANDING);
						});
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
				<UserDataContext.Provider value={this.state.userData}>
					<AuthUserContext.Provider value={this.state.authUser}>
						<Component {...this.props} />
					</AuthUserContext.Provider>
				</UserDataContext.Provider>
			);
		}
	}

	return compose(
		withRouter,
		withFirebase,
	)(WithAuthentication);
};

export default withAuthentication;