import React, { Component } from 'react';

import { Container, Button } from 'react-bootstrap';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Link } from "react-router-dom";

import * as ROUTES from '../../constants/routes';

// NOTE: THIS COMPONENT IS NOT CURRENTLY IN USE AND IS NOT FULLY FUNTIONAL
// Component that is rendered in case of Unverified account
class UnverifiedAccount extends Component {
    render() {
        return  (
            <Container>
                <h1>
                    You have not yet verified the email address for this account!
                </h1>
                <p>
                    Please verify your email address and sign in again.
                </p>
                <Row>
					<Col>
                        <Link to="/">
                            <Button variant="secondary" onClick={() => this.props.history.push(ROUTES.LANDING)}>
                                Return to homepage
                            </Button>    
                        </Link>
					</Col>
					<Col className="right-align">
						<Button variant="primary">
							Send verification email again
						</Button>
					</Col>
				</Row>
                
            </Container>
        )
    }
}

export default UnverifiedAccount;