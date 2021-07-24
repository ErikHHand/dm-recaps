import React, { Component } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from "react-router-dom";

import * as ROUTES from '../../constants/routes';

// Component that is rendered in case of 404 Not Found
class NotFound extends Component {
    render() {
        return  (
            <Container>
                <p className="h1">
                    404.. This page is not found!
                </p>
                <p>
                    So sorry about that!
                </p>
                <Link to="/">
                    <Button onClick={() => this.props.history.push(ROUTES.LANDING)}>
                        Return to homepage
                    </Button>    
                </Link>
            </Container>
        )
    }
}

export default NotFound;