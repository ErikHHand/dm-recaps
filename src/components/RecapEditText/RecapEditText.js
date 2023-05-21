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
			textAreaStyle: {height: "100%",}
		};

		// Set the context for "this" for the following functions
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
  	}

	componentDidMount() {
		// Automatically update the height of the text area to fit all text in it
		this.setState({textAreaStyle: {height: "max(" + this.textArea.scrollHeight + "px, 50px",}});
		setTimeout(() => {
			this.textArea.focus();
			this.textArea.selectionStart = this.textArea.selectionEnd = this.textArea.value.length;
		}, 100);
	}

	componentWillUnmount() {
		// Save any changes made but not submitted
		if(this.state.text !== this.props.recapItem.text) {

			let oldRecap = {
				tags: this.props.recapItem.tags,
				text: (" " + this.props.recapItem.text).slice(1),
				session: this.props.recapItem.session,
			};
	
			// Save text in recapItem locally
			let recap = this.props.recapItem;
			recap.text = this.state.text;
			
			// Call function in parent to add changes to Firestore
			this.props.writeRecap(recap, oldRecap);
		}
	}
	
	// Saves the recap text to the state while writing, and also adjust the text area height
	onChange(event) {
		this.setState({ 
			text: event.target.value,
			textAreaStyle: {height: "auto",},
		}, () =>
			this.setState({
				textAreaStyle: {height: "max(" + this.textArea.scrollHeight + "px, 50px",}
			})
		);
	}

	// Triggers when submitting a recap
	onSubmit(event) {
		event.preventDefault();

		let oldRecap = {
			tags: this.props.recapItem.tags,
			text: (" " + this.props.recapItem.text).slice(1),
			session: this.props.recapItem.session,
		};

		// Save text in recapItem locally
		let recap = this.props.recapItem;
		recap.text = this.state.text;

		// Reset height
		this.setState({
			textAreaStyle: {height: "50px",}
		});
		
		// Call function in parent to add changes to Firestore
		this.props.writeRecap(recap, oldRecap);
	};

	render() {

		const { text, error} = this.state;

		let recapEditText = this;

		return (
			<Form onSubmit={this.onSubmit} ref={form => this.form = form}>
				<Form.Group controlId="formRecapEdit" className="mb-3">
					<Form.Control 
						ref={textArea => this.textArea = textArea}
						name="text"
						value={text}
						onKeyDown={(event) => {if(event.key === "Enter") recapEditText.form.dispatchEvent(new Event('submit'))}}
						onChange={this.onChange}
						type="text"
						as="textarea"
						placeholder="Write something that happened..."
						autoFocus
						className="regular-text"
						style={this.state.textAreaStyle}
						maxLength="4000" 
					/>
				</Form.Group>
				{error && <p>{error.message}</p>}
			</Form>
		);
	}
}

export default withFirebase(RecapEditText)

// 