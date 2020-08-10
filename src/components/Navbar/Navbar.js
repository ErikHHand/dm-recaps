import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import * as ROUTES from '../../constants/routes';

import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { withFirebase } from '../Firebase/Firebase';

class NavbarBase extends Component {
    render() {
        return  (
            <Row className="top-bar">
                <Col md={2}>
                    <Button variant="outline-secondary" onClick={() => this.props.history.push(ROUTES.HOME)}>Campaigns</Button>
                </Col>
                <Col md={8}>
                    <div className="center campaign-title">{this.props.title ? this.props.title : ""}</div>
                    {/* Disabled download functionality
                    <Button variant="outline-info" onClick={this.downloadCampaign}>Download</Button> */}
                </Col>
                <Col md={2} className="right-align">
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic"></Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => this.props.history.push(ROUTES.ACCOUNT)}>Account</Dropdown.Item>
                            <Dropdown.Item onClick={this.props.firebase.doSignOut}>Sign out</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>	
                </Col>
            </Row>
        )
    }
}

const Navbar = compose(
    withRouter,
    withFirebase,
)(NavbarBase);

export default Navbar;