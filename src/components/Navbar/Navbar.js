import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import * as ROUTES from '../../constants/routes';

import Col from 'react-bootstrap/Col'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

import { withFirebase } from '../Firebase/Firebase';

class NavbarBase extends Component {

    constructor(props) {
		super(props);

		this.state = {
			lastCampaignName: "",
            lastCampaignID: ""
		};
	}

    componentDidMount() {
        let userRef = this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid);

        userRef.get().then((doc) => {

            let lastCampaignName = "";
            let lastCampaignID = "";

            if (doc.exists) {
                lastCampaignName = doc.data().lastCampaignName;
                lastCampaignID = doc.data().lastCampaignID;
            }

			this.setState({
				lastCampaignName: lastCampaignName,
                lastCampaignID: lastCampaignID,
			});
						
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }

    componentDidUpdate() {
        if(this.props.location.state && this.props.location.state.id !== this.state.lastCampaignID) {
            this.setState({
				lastCampaignName: this.props.location.state.campaign.name,
                lastCampaignID: this.props.location.state.id,
			});
        }
    }

    render() {

        let pathName = this.props.location.pathname;
        let activePage = "";

        switch(pathName.substring(0,11)) {
            case "/campaigns":
                activePage = "campaignsPage";
                break;
            case "/campaigns/":
                activePage = "campaignRecaps";
                break;
            case "/account":
                activePage = "account";
                break;
            default:
                activePage = "";
        }
        
        return  (
            <Navbar collapseOnSelect expand="md" variant="light" className="top-bar border-bottom">
                <Navbar.Brand>RPG Recaps</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav justify className="ms-auto w-100" activeKey={activePage}>
                        <Nav.Item className={activePage === "campaignsPage" ? "nav-item-active" : ""}>
                            <Nav.Link 
                                eventKey="campaignsPage" 
                                onClick={() => this.props.history.push(ROUTES.HOME)}
                                >
                                Campaigns
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item className={activePage === "campaignRecaps" ? "nav-item-active" : ""}>
                            <Nav.Link 
                                eventKey="campaignRecaps" 
                                onClick={() => this.props.history.push("/campaigns/" + this.state.lastCampaignID)}
                                >
                                {this.state.lastCampaignName}
                            </Nav.Link>
                        </Nav.Item>
                        <Col md={2} lg={3} xl={4}>&nbsp;</Col>
                        <Nav.Item className={activePage === "account" ? "nav-item-active" : ""}>
                            <Nav.Link 
                                eventKey="account" 
                                onClick={() => this.props.history.push(ROUTES.ACCOUNT)}
                            >
                                Account
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link onClick={this.props.firebase.doSignOut}>Sign out</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

const NavbarCustom = compose(
    withRouter,
    withFirebase,
)(NavbarBase);

export default NavbarCustom;