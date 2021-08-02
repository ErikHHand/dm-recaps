import React, { Component } from 'react';

import ChangePassword from '../ChangePassword/ChangePassword';
import ChangeEmail from '../ChangeEmail/ChangeEmail';
import ChangeUsername from '../ChangeUsername/ChangeUsername';
import DeleteAccount from '../DeleteAccount/DeleteAccount';

import { withFirebase } from '../Firebase/Firebase';
import { withAuthorization } from '../Session/Session';

import Navbar from '../Navbar/Navbar';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

/*
    This class hold the account page of the app. This is where a user can update 
    account details. 
*/
class Account extends Component {
    constructor(props) {
        super(props);
     
        this.state = { 
            showChangePassword: false,
            showChangeEmail: false,
            showChangeUsername: false,
            showDeleteAccount: false,
            ownedCampaigns: [],
        };
    }

    componentDidMount() {
        let userRef = this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid);

        userRef.get().then((doc) => {
            if (doc.exists) {
                this.setState({
                    ownedCampaigns: doc.data().ownedCampaigns,
                });
            }			
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }

    render() {

        // Checks if displayName is set for profile, and also handles if currentUser is null
        let displayNameTitle = this.props.firebase.auth.currentUser.displayName ? 
            this.props.firebase.auth.currentUser.displayName + "'s Account" : "Account";

        return (
            <Container>
                <Navbar/>
                <h1 className="border-bottom">{displayNameTitle}</h1>
                <Row className="account-page-subtitle border-bottom">
                    <Col>
                        <h5>Account Settings</h5>
                    </Col>
                </Row>
                <Row className="account-page-row">
                    <Col md="9">
                        <h6 className="account-property-text">Password</h6>
                        <p className="account-property-info">
                            Insert password requirements here.
                        </p>
                    </Col>
                    <Col md="3" className="right-align">
                        <Button variant="outline-info" onClick={() => this.setState({showChangePassword: true})}>
                            Change
                        </Button>
                    </Col>
                </Row>

                <Row className="account-page-row">
                    <Col md="9">
                        <h6 className="account-property-text">Email address</h6>
                        <p className="account-property-info">
                            {this.props.firebase.auth.currentUser.email}
                        </p>
                    </Col>
                    <Col md="3" className="right-align">
                        <Button variant="outline-info" onClick={() => this.setState({showChangeEmail: true})}>
                            Change
                        </Button>
                    </Col>
                </Row>

                <Row className="account-page-row">
                    <Col md="9">
                        <h6 className="account-property-text">Username</h6>
                        <p className="account-property-info">
                            {this.props.firebase.auth.currentUser.displayName}
                        </p>
                    </Col>
                    <Col md="3" className="right-align">
                        <Button variant="outline-info" onClick={() => this.setState({showChangeUsername: true})}>
                            Change
                        </Button>
                    </Col>
                </Row>

                <Row className="account-page-subtitle border-bottom">
                    <Col>
                        <h5>Account Termination</h5>
                    </Col>
                </Row>

                <Row className="account-page-row">
                    <Col md="9">
                        <h6 className="account-property-text">Delete Account</h6>
                        <p className="account-property-info">
                            No going back
                        </p>
                    </Col>
                    <Col md="3" className="right-align">
                        <Button variant="outline-danger" onClick={() => this.setState({showDeleteAccount: true})}>
                            Delete
                        </Button>
                    </Col>
                </Row>

                <ChangePassword
                    show = {this.state.showChangePassword}
					onHide = {() => this.setState({ showChangePassword: false })}
                />
                <ChangeEmail
                    show = {this.state.showChangeEmail}
					onHide = {() => this.setState({ showChangeEmail: false })}
                />
                <ChangeUsername
                    show = {this.state.showChangeUsername}
					onHide = {() => this.setState({ showChangeUsername: false })}
                    ownedCampaigns = {this.state.ownedCampaigns}
                />
                <DeleteAccount
                    show = {this.state.showDeleteAccount}
					onHide = {() => this.setState({ showDeleteAccount: false })}
                />
            </Container>
        );
    }
}

const condition = authUser => !!authUser;
  
export default withAuthorization(condition)(withFirebase(Account));