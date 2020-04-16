import React from 'react';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase/Firebase';

const withAuthorization = condition => Component => {
	class WithAuthorization extends React.Component {

		render() {
			return (
				<AuthUserContext.Consumer>
					{authUser =>condition(authUser) ? <Component {...this.props} /> : null}
				</AuthUserContext.Consumer>
			)
		}
	}

	return withFirebase(WithAuthorization);
};

export default withAuthorization;