import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import * as ROUTES from '../../constants/routes';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { Link } from "react-router-dom";

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
        let userRef = this.props.firebase.db.collection("users")
		.doc(this.props.firebase.auth.currentUser.uid);

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

    render() {

        const pathName = this.props.location.pathname;

        var navClasses = ["nav-text", "nav-text", "nav-text"]; // [campaigns, account, current/last visited campaign]
        var colClasses = ["column", "right-align column", "column"]; //[campigns, account, current/last visited campaign]

        if (pathName === '/campaigns') {
            navClasses[0] += " nav-text-current";
            colClasses[0] += " column-current"
        } else if (pathName === '/account') {
            navClasses[1] += " nav-text-current";
            colClasses[1] += " column-current"
        } else if (pathName.substring(0,11) === '/campaigns/') {
            navClasses[2] += " nav-text-current";
            colClasses[2] += " column-current";

        }

        
        return  (
            <Row className="top-bar border-bottom" noGutters={true}>
                <Col md={2} lg={2} className={colClasses[0]}>
                    <div className={navClasses[0]} onClick={() => this.props.history.push(ROUTES.HOME)}>Campaigns</div>
                </Col>
                <Col md={3} lg={3} className={colClasses[2]}>
                    <Link to={{
						pathname: "/campaigns/"+ this.state.lastCampaignID,
						state: {
							id: this.state.lastCampaignID ? this.state.lastCampaignID: "",
						}
					}}>
                        <div className={navClasses[2]} >{this.props.title ? this.props.title : this.state.lastCampaignName }</div>
                    </Link>
                    {/* Disabled download functionality
                    <Button variant="outline-info" onClick={this.downloadCampaign}>Download</Button> */}
                </Col>
                <Col md={{span:2, offset:3}} lg={{span: 1, offset: 5}} className={colClasses[1]}>
                    <div className={navClasses[1]} onClick={() => this.props.history.push(ROUTES.ACCOUNT)}>Account</div>
                </Col>
                <Col md={"auto"} lg={1} className="right-align column">
                    <div className="nav-text" onClick={this.props.firebase.doSignOut}>
                        Sign out
                    </div>
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