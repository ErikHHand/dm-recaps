import React from 'react';
import { Link } from "react-router-dom";

import { withFirebase } from '../Firebase/Firebase';

import {Button} from 'react-bootstrap';

const SignOutButton = ({ firebase }) => (
    <Link to="/signin">
        <Button variant="secondary" onClick={firebase.doSignOut}>
            Sign Out
        </Button>          
    </Link>
);

export default withFirebase(SignOutButton);