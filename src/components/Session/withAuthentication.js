import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

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

		componentDidMount() {
			this.listener = this.props.firebase.auth.onAuthStateChanged(
				authUser => {
					if(authUser) {
						this.setState({ authUser })
						
					}
					else {
						this.setState({ authUser: null });
						this.props.history.push("/");
					}
				}
			);
		}

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