import React from 'react';

import { withFirebase } from '../Firebase/Firebase';

import {Button} from 'react-bootstrap';

// The sign out button
const SignOut = ({ firebase }) => (
    <Button variant="secondary"  onClick={firebase.doSignOut} >
        Sign Out
    </Button>          
);

export default withFirebase(SignOut);
