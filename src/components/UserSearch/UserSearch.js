import React, { Component } from 'react';

import Badge from 'react-bootstrap/Badge'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import SearchField from "react-search-field";
import AwesomeDebouncePromise from 'awesome-debounce-promise';

import { withFirebase } from '../Firebase/Firebase';


class UserSearch extends Component {

    constructor(props) {
        super(props);

		this.state = {
			searchText: "",
            searchResult: null,
		}
    }

    componentWillUnmount() {
        this.setState = () => {};
    }

    searchAPI = userName => this.props.firebase.db.collection("usernames").doc(userName).get();

    searchAPIDebounced = AwesomeDebouncePromise(this.searchAPI, 500);

    async handleTextChange(searchText) {
        this.setState({ searchText, searchResult: null });
        if(searchText) {
            const searchResult = await this.searchAPIDebounced(searchText);
            console.log(searchResult.data())
            console.log(searchResult.id)
            if(searchResult.exists) {
                this.setState({ 
                    searchResult: {username: searchResult.id, userID: searchResult.data().uid} 
                });
            }
        }
    };

    render() {

        let searchResult = "No results";

        if(this.state.searchResult) {
            searchResult = <Badge 
                                pill 
                                className="recap-tag" 
                                onClick={() => console.log("Added user")}
                            >
                                <FontAwesomeIcon icon={faUser} />
                                &nbsp;
						        {this.state.searchResult.username}
                            </Badge>
        }

        console.log(this.state)
        return (
            <Row>
                <Col xs="6" className="filter-field">
                    <SearchField
                        placeholder="Search..."
                        onChange={(value, event) => this.handleTextChange(value, event)}
                        searchText=""
                    />
                </Col>
                <Col xs="6" className="search-user-result text-muted">
                    {searchResult}
                </Col>
            </Row>
        );
    }
}

export default withFirebase(UserSearch)