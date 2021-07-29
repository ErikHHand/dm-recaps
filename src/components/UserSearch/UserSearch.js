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

class UserSearch extends Component {

    constructor(props) {
        super(props);

		this.state = {
			searchText: "",
            searchResult: null,
            showAlert: false,
		}

        this.shareWithUser = this.shareWithUser.bind(this);
    }

    componentWillUnmount() {
        this.setState = () => {};
    }

    searchAPI = userName => this.props.firebase.db.collection("usernames").doc(userName).get();

    searchAPIDebounced = AwesomeDebouncePromise(this.searchAPI, 500);

    async handleTextChange(searchText) {
        this.setState({ 
            searchText, 
            searchResult: null,
            showAlert: false,
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

    shareWithUser() {

        if(this.props.campaign.usersSharedWithList.length >= 15) {
            this.setState({showAlert: true});
        } else {

            // Change campaign sharing status locally
            let campaigns = this.props.campaigns;
            let user = this.state.searchResult;
            campaigns[this.props.campaignID].usersSharedWith[user.userID] = user.username;
            this.props.handleCampaigns(campaigns);

            // Edit campaign document on Firestore
            this.props.campaignsRef.doc(this.props.campaignID).update({
                userLastHandled: user.userID,
                ['usersSharedWith.' + user.userID]: user.username, 
                usersSharedWithList: firebase.firestore.FieldValue.arrayUnion(user.userID),
            }).then(() => {
                console.log("Document successfully updated!");
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
        }
    }

    render() {

        let searchResult =  <div className="search-user-no-result text-muted">
                                No results
                            </div> 

        if(this.state.searchResult) {
            if(this.state.searchResult.userID === this.props.firebase.auth.currentUser.uid) {
                searchResult =  <div className="search-user-no-result text-muted">
                                    Hey, that's you!
                                </div> 
            } else {
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
                    show={this.state.showAlert}
                    onClose={() => this.setState({showAlert: false})}
                    variant="danger"
                    className="alert-error"
                >
                    A maximum of 16 people already have access to this camapign!
                </Alert>
            </>
        );
    }
}

export default withFirebase(UserSearch)