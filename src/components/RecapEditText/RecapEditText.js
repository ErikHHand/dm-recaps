import React, { Component } from 'react';

import Form from 'react-bootstrap/Form'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This class holds the field where new recaps are entered and
	handles adding new recaps.
*/
class RecapEditText extends Component {
	constructor(props) {
		super(props);
	  
		this.state = {
			text: this.props.recapItem.text,
			error: "",
		};

		// Set the context for "this" for the following functions
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
  	}

	// Saves the recap text to the state while writing
	onChange(event) {
		this.setState({ text: event.target.value });
	}

	// Triggers when submitting a recap
	onSubmit(event) {
		event.preventDefault();

		// Save text in recapItem
		let recap = this.props.recapItem;
		recap.text = this.state.text;
		
		this.props.writeRecap(recap, recap.tags);
	};

	render() {

		const { text, error} = this.state;

		let recapEditText = this;

		return (
			<Form onSubmit={this.onSubmit} ref={f => this.form = f}>
				<Form.Group controlId="formRecapEdit">
					<Form.Control 
						name="text"
						value={text}
						onKeyDown={(event) => {if(event.keyCode === 13) recapEditText.form.dispatchEvent(new Event('submit'))}}
						onChange={this.onChange}
						type="text"
						as="textarea"
						placeholder="Write something that happened..."
						autoFocus
					/>
				</Form.Group>
				{error && <p>{error.message}</p>}
			</Form>
		);
	}
}

export default withFirebase(RecapEditText)