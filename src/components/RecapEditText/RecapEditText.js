import React, { Component } from 'react';

import Form from 'react-bootstrap/Form'

import { withFirebase } from '../Firebase/Firebase';

/*
	This class holds the text field for editing recap texts
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

	componentWillUnmount() {
		if(this.state.text !== this.props.recapItem.text) {
			// Save text in recapItem locally
			let recap = this.props.recapItem;
			recap.text = this.state.text;
			
			// Call function in parent to add changes to Firestore
			this.props.writeRecap(recap, recap.tags);
		}
	}
	
	// Saves the recap text to the state while writing
	onChange(event) {
		this.setState({ text: event.target.value });
	}

	// Triggers when submitting a recap
	onSubmit(event) {
		event.preventDefault();

		// Save text in recapItem locally
		let recap = this.props.recapItem;
		recap.text = this.state.text;
		
		// Call function in parent to add changes to Firestore
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
						className="regular-text"
						maxLength="4000" 
					/>
				</Form.Group>
				{error && <p>{error.message}</p>}
			</Form>
		);
	}
}

export default withFirebase(RecapEditText)