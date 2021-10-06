import React, { Component } from 'react';

import Badge from 'react-bootstrap/Badge'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import SearchField from "react-search-field";
import AwesomeDebouncePromise from 'awesome-debounce-promise';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

const USERSHAREMAX = 15;

/*
    This component holds the row for searching user in the campaign sharing window.
    It handles searching for users, showing the result of a search, and letting
    users share campaigns by clicking on the user appearing in the search result.
*/
class UserSearch extends Component {

    constructor(props) {
        super(props);

		this.state = {
			searchText: "",
            searchResult: null,
            showAlreadyAddedAlert: false,
            showMaxUserAlert: false,
		}

        // Set the context for "this" for the following function
        this.shareWithUser = this.shareWithUser.bind(this);
    }

    componentWillUnmount() {
        this.setState = () => {};
    }

    // Function to be called when searching for a user
    // This is a get call for a requested username in the usernames collection of Firestore
    searchAPI = userName => this.props.firebase.db.collection("usernames").doc(userName).get();

    // Debounce call, delay of 500 milliseconds
    searchAPIDebounced = AwesomeDebouncePromise(this.searchAPI, 500);

    // Triggers when writing in the user search field.
    // Debounces the search and saves the result of any successful search in the state
    async handleTextChange(searchText) {
        this.setState({ 
            searchText, 
            searchResult: null,
            showMaxUserAlert: false,
            showAlreadyAddedAlert: false,
        });
        if(searchText) {
            const searchResult = await this.searchAPIDebounced(searchText);
            if(searchResult.exists) {
                this.setState({ 
                    searchResult: {username: searchResult.id, userID: searchResult.data().uid} 
                });
            }
        }
    };

    // Function for sharing a campaign with a users. Triggers when clicking
    // on a users appearing as a result from a search
    shareWithUser() {

        if (this.props.campaign.usersSharedWith[this.state.searchResult.userID]) {
            // Trigers when trying to add a user that is alreacy added
            this.setState({showAlreadyAddedAlert: true})
        } else if(this.props.campaign.usersSharedWithList.length >= USERSHAREMAX) {
            // Trigers if a campaign is shared with the maximum amount of allowed users
            this.setState({showMaxUserAlert: true});
        } else {

            // Edit list of users shared with locally
            let campaigns = this.props.campaigns;
            let user = this.state.searchResult;
            campaigns[this.props.campaignID].usersSharedWith[user.userID] = user.username;
            campaigns[this.props.campaignID].usersSharedWithList.push(user.userID);
            this.props.handleCampaigns(campaigns);
            
            // Edit list of users shared with on Firestore
            this.props.campaignsRef.doc(this.props.campaignID).update({
                operation: "share",
                userLastHandled: user.userID,
                ['usersSharedWith.' + user.userID]: user.username, 
                usersSharedWithList: firebase.firestore.FieldValue.arrayUnion(user.userID),
            }).then(() => {
                console.log("Document successfully updated!");
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
            /*
            // Write shared campaign to user document on Firestore
            this.props.firebase.db.collection("users").doc(user.userID).update({
                campaignLastHandled: this.props.campaignID,
                campaignsSharedWith: firebase.firestore.FieldValue.arrayUnion(this.props.campaignID),
            }).then(() => {
                console.log("Document successfully updated!");
            }).catch((error) => {
                console.log("Error getting document:", error);
            });*/
        }
    }

    render() {

        // Set the default no results text
        let searchResult =  <div className="search-user-no-result text-muted">
                                No results
                            </div> 

        if(this.state.searchResult) {
            if(this.state.searchResult.userID === this.props.firebase.auth.currentUser.uid) {
                // A users has search for him/her/themselves
                searchResult =  <div className="search-user-no-result text-muted">
                                    Hey, that's you!
                                </div> 
            } else {
                // Render successful search result
                searchResult =  <Badge 
                                    pill 
                                    className="user-tag-search-result" 
                                    onClick={this.shareWithUser}
                                >
                                    <FontAwesomeIcon icon={faUser} />
                                    &nbsp;
                                    {this.state.searchResult.username}
                                </Badge>
            }
        }

        return (
            <>
                <Row className="border-bottom user-search">
                    <Col xs="6" className="filter-field">
                        <SearchField
                            placeholder="Search..."
                            onChange={(value, event) => this.handleTextChange(value, event)}
                            searchText=""
                        />
                    </Col>
                    <Col xs="6" className="search-user-result">
                        {searchResult}
                    </Col>
                </Row>
                <Alert
                    dismissible
                    show={this.state.showAlreadyAddedAlert}
                    onClose={() => this.setState({showAlreadyAddedAlert: false})}
                    variant="info"
                    className="alert-custom"
                >
                    {this.state.searchResult ? this.state.searchResult.username : ""} already has access to this campaign!
                </Alert>
                <Alert
                    dismissible
                    show={this.state.showMaxUserAlert}
                    onClose={() => this.setState({showMaxUserAlert: false})}
                    variant="danger"
                    className="alert-custom"
                >
                    A maximum of {USERSHAREMAX + 1} people already have access to this camapign!
                </Alert>
            </>
        );
    }
}

export default withFirebase(UserSearch)