import React from 'react';


export default class OpenCloseArea extends React.Component {
    constructor(props) {
	super(props)
	this.state = { isOpen: false }
    }

    areaOpen = () => { this.setState( { isOpen: true } ) }
    areaClose = () => { this.setState( { isOpen: false } ) }
}



export class OpenCloseAreaLabel extends React.Component {

    render() {
	if (this.props.isOpen) {
	    return(
		    <div className="openCloseAreaLabel">
	    	    <span> {this.props.title} </span>
		    <span className="openCloseTriangle" onClick={this.props.close}>&#x25B2;</span>
		    </div>
	    )
	}

	return(

	    	<div className="openCloseAreaLabel">
	    	<span> {this.props.title} </span>
		<span className="openCloseTriangle" onClick={this.props.open}>&#x25BC;</span>
		</div>

	)

    }
}


