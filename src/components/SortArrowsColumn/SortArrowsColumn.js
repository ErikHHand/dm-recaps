import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';

const SortArrowsColumn = (props) => (
	<div className="center sort-arrows-col">
		<FontAwesomeIcon 
			icon={faArrowUp}
			onClick={props.status ? props.changeSort : null}
			className={props.status ? "sort-arrow-inactive" : "sort-arrow-active"}
		/>
		<FontAwesomeIcon 
			icon={faArrowDown} 
			onClick={props.status ? null : props.changeSort}
			className={props.status ? "sort-arrow-active" : "sort-arrow-inactive"}
		/>
	</div>
)

export default SortArrowsColumn;