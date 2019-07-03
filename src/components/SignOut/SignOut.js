import React from 'react';

import { withFirebase } from '../Firebase/Firebase';

import {Button} from 'react-bootstrap';

const SignOutButton = ({ firebase }) => (
    <Button variant="secondary" onClick={firebase.doSignOut}>
      	Sign Out
    </Button>
);

export default withFirebase(SignOutButton);