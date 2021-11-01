import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import * as ROUTES from '../../constants/routes';

import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Offcanvas from 'react-bootstrap/Offcanvas'

import { withFirebase } from '../Firebase/Firebase';

class NavbarBase extends Component {

    constructor(props) {
		super(props);

		this.state = {
			lastCampaignName: "",
            lastCampaignID: "",
            show: false,
		};

        this.updateDimension = this.updateDimension.bind(this);
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

        // Add a listener for the window size
		window.addEventListener('resize', this.updateDimension);
    }

    componentDidUpdate() {
        if(this.props.location.state && this.props.location.state.id !== this.state.lastCampaignID) {
            this.setState({
				lastCampaignName: this.props.location.state.campaign.name,
                lastCampaignID: this.props.location.state.id,
			});
        }
    }

    componentWillUnmount() {
		// Remove listener
		window.removeEventListener('resize', this.updateDimension);
	}

    updateDimension() {
		this.setState({ windowWidth: window.innerWidth });
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


        // Hack for what navbar to render
        let navbarContainer = <></>;
        const navbar = (
            <Nav justify className="ms-auto w-100" activeKey={activePage}>
                <Nav.Item className={activePage === "campaignsPage" ? "nav-item-active" : "nav-item-custom"}>
                    <Nav.Link 
                        eventKey="campaignsPage" 
                        onClick={() => this.props.history.push(ROUTES.HOME)}
                        >
                        Campaigns
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item className={activePage === "campaignRecaps" ? "nav-item-active" : "nav-item-custom"}>
                    <Nav.Link 
                        eventKey="campaignRecaps" 
                        onClick={() => this.props.history.push("/campaigns/" + this.state.lastCampaignID)}
                        >
                        {this.state.lastCampaignName}
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item className="nav-air">
                    <Nav.Link >
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item className={activePage === "account" ? "nav-item-active" : "nav-item-custom"}>
                    <Nav.Link 
                        eventKey="account" 
                        onClick={() => this.props.history.push(ROUTES.ACCOUNT)}
                    >
                        Account
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item className="nav-item-custom">
                    <Nav.Link onClick={this.props.firebase.doSignOut}>Sign out</Nav.Link>
                </Nav.Item>
            </Nav>
        );

        if(window.innerWidth < 768) {
            navbarContainer = (
                <Container fluid>
                    <Navbar.Brand className="nav-brand">RPG Recaps</Navbar.Brand>
                    <Navbar.Toggle aria-controls="offcanvasNavbar"/>
                    <Navbar.Offcanvas
                        id="offcanvasNavbar"
                        aria-labelledby="offcanvasNavbarLabel"
                        placement="end"
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title id="offcanvasNavbarLabel">RPG Recaps</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            {navbar}
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            );
        } else {
            navbarContainer = (
                <Container>
                    <Navbar.Brand className="nav-brand">RPG Recaps</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        {navbar}
                    </Navbar.Collapse>
                </Container>
            )
        }
        
        return  (
            <Navbar expand="md" variant="light" className="top-bar border-bottom" collapseOnSelect={true}>
                {navbarContainer}
            </Navbar>
        )
    }
}

const NavbarCustom = compose(
    withRouter,
    withFirebase,
)(NavbarBase);

export default NavbarCustom;
