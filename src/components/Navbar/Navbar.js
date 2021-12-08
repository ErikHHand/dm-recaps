import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import * as ROUTES from '../../constants/routes';

import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Offcanvas from 'react-bootstrap/Offcanvas'
import Spinner from 'react-bootstrap/Spinner'

import { withFirebase } from '../Firebase/Firebase';

class NavbarBase extends Component {

    constructor(props) {
		super(props);

		this.state = {
			lastCampaignName: null,
            lastCampaignID: null,
            show: false,
            status: "LOADING",
		};

        // Set the context for "this" for the following function
        this.updateDimension = this.updateDimension.bind(this);
	}

    componentDidMount() {
        // Add a listener for the window size
		window.addEventListener('resize', this.updateDimension);
    }

    componentDidUpdate() {
        // Handles updates to last visited campaign
        let userData = this.props.userDataContext.userData;
        if(userData 
            && (userData.lastCampaignID !== this.state.lastCampaignID 
            || userData.lastCampaignName !== this.state.lastCampaignName)) {
            this.setState({
                lastCampaignID: userData.lastCampaignID,
                lastCampaignName: userData.lastCampaignName,
                status: "LOADED",
            });
        }
    }

    componentWillUnmount() {
		// Remove listener
		window.removeEventListener('resize', this.updateDimension);
	}

    // Function called when a change in window width is detected. This is used to dynamically
    // handle what type of navbar is rendered, depending on screen width.
    updateDimension() {
		this.setState({ windowWidth: window.innerWidth });
	}

    render() {

        let pathName = this.props.location.pathname;
        let activePage = "";

        // A switch for manually deciding the active page based on url
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

        // Nasty Hack for what navbar to render depending on screen width
        // The contents of the navbar will always be the same, but the navbar container will vary
        let navbarContainer = <></>;
        const navbar = (
            <Nav className="ms-auto w-100" activeKey={activePage}>
                <Nav.Item className={"nav-item-static " + (activePage === "campaignsPage" ? "nav-item-active" : "nav-item-inactive ")}>
                    <Nav.Link 
                        eventKey="campaignsPage" 
                        onClick={() => this.props.history.push(ROUTES.HOME)}
                        >
                        Campaigns
                    </Nav.Link>
                </Nav.Item>
                {
                    // Only render nav item for last visited campaign if there is a last visited campaign
                    this.state.lastCampaignID ?
                    <Nav.Item className={"nav-item-campaign " + (activePage === "campaignRecaps" ? "nav-item-active " : "nav-item-inactive ")}>
                        <Nav.Link 
                            eventKey="campaignRecaps" 
                            onClick={() => this.props.history.push("/campaigns/" + this.state.lastCampaignID)}
                            >
                            {this.state.lastCampaignName}
                        </Nav.Link>
                    </Nav.Item> :
                    <></>
                }
                <Nav.Item className="nav-item-air">
                    <div >
                    </div>
                </Nav.Item>
                <Nav.Item className={"nav-item-static " + (activePage === "account" ? "nav-item-active" : "nav-item-inactive ")}>
                    <Nav.Link 
                        eventKey="account" 
                        onClick={() => this.props.history.push(ROUTES.ACCOUNT)}
                    >
                        Account
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item className="nav-item-static nav-item-inactive">
                    <Nav.Link onClick={this.props.firebase.doSignOut}>Sign out</Nav.Link>
                </Nav.Item>
            </Nav>
        );

        // A switch to create a spinner while user data containing the last visited campaign
        // is being fetched. When that data is fetched, the navbar is rendered
        switch (this.state.status) {
			case "LOADING":
				// Create spinner
				navbarContainer =   (
                    <div className="center-vertically">
                        <Spinner animation="grow" variant="info" role="status">
                            <span className="sr-only">Loading...</span>
                        </Spinner>
                    </div>
                );
				break;
			case "LOADED":
				// Dynamically create the navbar container
                if(window.innerWidth < 768) {
                    navbarContainer = (
                        <>
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
                        </>
                    );
                } else {
                    navbarContainer = (
                        <>
                            <Navbar.Brand className="nav-brand">RPG Recaps</Navbar.Brand>
                            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                {navbar}
                            </Navbar.Collapse>
                        </>
                    );
                }
				break;
			default:
				navbarContainer = <></>;
				break;
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
