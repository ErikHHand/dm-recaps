import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import * as ROUTES from '../../constants/routes';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { withFirebase } from '../Firebase/Firebase';

class NavbarBase extends Component {
    render() {
        return  (
            <Row className="top-bar">
                <Col md={1}>
                    <p className="nav-text" onClick={() => this.props.history.push(ROUTES.HOME)}>Campaigns</p>
                </Col>
                <Col md={4}>
                    <div className="nav-text">{this.props.title ? this.props.title : ""}</div>
                    {/* Disabled download functionality
                    <Button variant="outline-info" onClick={this.downloadCampaign}>Download</Button> */}
                </Col>
                <Col md={{span:1, offset: 5}} className="right-align">
                    <p className="nav-text" onClick={() => this.props.history.push(ROUTES.ACCOUNT)}>Account</p>
                </Col>
                <Col md={1} className="right-align">
                    <p className="nav-text" onClick={this.props.firebase.doSignOut}>Sign out</p>
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