import React, { Component } from 'react';

import ChangePassword from '../ChangePassword/ChangePassword';
import ChangeEmail from '../ChangeEmail/ChangeEmail';
import ChangeUsername from '../ChangeUsername/ChangeUsername';
import DeleteAccount from '../DeleteAccount/DeleteAccount';

import { withFirebase } from '../Firebase/Firebase';
import { withAuthorization } from '../Session/Session';

import Button from 'react-bootstrap/Button';
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
            userData: null,
        };

        // Set the context for "this" for the following function
		this.handleUserData = this.handleUserData.bind(this);
    }

    componentDidMount() {
        this.setState({
            userData: this.props.userDataContext.userData,
        });
    }

    componentDidUpdate() {
        if(this.props.userDataContext.userData !== this.state.userData) {
            this.setState({
                userData: this.props.userDataContext.userData,
            });
        }
    }

    // Function for modifying user data locally
    handleUserData(userData) {
        this.setState({
            userData: userData,
        });
        this.props.userDataContext.updateUserData(userData);
    }

    render() {

        let daysSinceUsernameChange = 0;
        let canChangeUsername = true;
        let changeUsernameText = "";
        let userData = this.state.userData;

        // Calculate how long until the user can change username, if the username was changed
        // in the last 60 days
        if (userData && userData.usernameLastChanged) {
            let milliSinceUsernameChange = Date.now() - userData.usernameLastChanged.toDate();
            daysSinceUsernameChange = Math.ceil(Math.abs(milliSinceUsernameChange) / (1000 * 60 * 60 * 24));
            canChangeUsername = daysSinceUsernameChange > 60 ? true : false;
            changeUsernameText = canChangeUsername ? "" : " - Can change username in " + (60 - daysSinceUsernameChange) + " days";
        }

        let ownedCampaigns = userData ? userData.ownedCampaigns : [];

        return (
            <div className="account-page">
                <Row className="account-page-subtitle border-bottom">
                    <Col>
                        <h5>Account Settings</h5>
                    </Col>
                </Row>
                <Row className="account-page-row">
                    <Col xs="9">
                        <h6 className="account-property-text">Password</h6>
                        <p className="text-grey-italic">
                            Insert password requirements here.
                        </p>
                    </Col>
                    <Col xs="3" className="right-align center-vertically">
                        <Button variant="outline-info" onClick={() => this.setState({showChangePassword: true})}>
                            Change
                        </Button>
                    </Col>
                </Row>

                <Row className="account-page-row">
                    <Col xs="9">
                        <h6 className="account-property-text">Email address</h6>
                        <p className="text-grey-italic">
                            {this.props.firebase.auth.currentUser.email}
                        </p>
                    </Col>
                    <Col xs="3" className="right-align center-vertically">
                        <Button variant="outline-info" onClick={() => this.setState({showChangeEmail: true})}>
                            Change
                        </Button>
                    </Col>
                </Row>

                <Row className="account-page-row">
                    <Col xs="9">
                        <h6 className="account-property-text">Username</h6>
                        <p className="text-grey-italic">
                            {userData ? userData.username + changeUsernameText : this.props.firebase.auth.currentUser.displayName}
                        </p>
                    </Col>
                    <Col xs="3" className="right-align center-vertically">
                        <Button variant="outline-info" onClick={() => this.setState({showChangeUsername: true})} disabled={!canChangeUsername}>
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
                    <Col xs="9">
                        <h6 className="account-property-text">Delete Account</h6>
                        <p className="text-grey-italic">
                            No going back
                        </p>
                    </Col>
                    <Col xs="3" className="right-align center-vertically">
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
                    ownedCampaigns = {ownedCampaigns}
                    user = {userData}
                    handleUserData = {this.handleUserData}
                />
                <DeleteAccount
                    show = {this.state.showDeleteAccount}
					onHide = {() => this.setState({ showDeleteAccount: false })}
                />
            </div>
        );
    }
}

const condition = authUser => !!authUser;
  
export default withAuthorization(condition)(withFirebase(Account));