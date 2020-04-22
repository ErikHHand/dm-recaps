import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortNumericDown } from '@fortawesome/free-solid-svg-icons';
import { faSortNumericUpAlt } from '@fortawesome/free-solid-svg-icons';
import { faSortAlphaDown } from '@fortawesome/free-solid-svg-icons';
import { faSortAlphaUpAlt } from '@fortawesome/free-solid-svg-icons';

const SortArrowsColumn = (props) => (
	<div className="center sort-arrows-col">
		{props.alphabetical ?
			<>
				<FontAwesomeIcon 
					icon={faSortNumericUpAlt} 
					onClick={props.status === 1 ? null : () => props.changeSort(1)}
					className={props.status === 1 ? "sort-arrow-active" : "sort-arrow-inactive"}
				/>
				<FontAwesomeIcon 
					icon={faSortNumericDown}
					onClick={props.status === 2 ? null : () => props.changeSort(2)}
					className={props.status === 2 ? "sort-arrow-active" : "sort-arrow-inactive"}
				/>
				<FontAwesomeIcon 
					icon={faSortAlphaUpAlt} 
					onClick={props.status === 3 ? null : () => props.changeSort(3)}
					className={props.status === 3 ? "sort-arrow-active" : "sort-arrow-inactive"}
				/>
				<FontAwesomeIcon 
					icon={faSortAlphaDown}
					onClick={props.status === 4 ? null : () => props.changeSort(4)}
					className={props.status === 4 ? "sort-arrow-active" : "sort-arrow-inactive"}
				/>
			</>
		:	<>
				<FontAwesomeIcon 
					icon={faSortNumericUpAlt} 
					onClick={props.status ? null : props.changeSort}
					className={props.status ? "sort-arrow-active" : "sort-arrow-inactive"}
				/>
				<FontAwesomeIcon 
					icon={faSortNumericDown}
					onClick={props.status ? props.changeSort : null}
					className={props.status ? "sort-arrow-inactive" : "sort-arrow-active"}
				/>
			</>
		}
	</div>
)

export default SortArrowsColumn;