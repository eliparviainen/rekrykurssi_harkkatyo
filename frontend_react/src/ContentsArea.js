import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import Row from './Row';

export default class ContentsArea extends React.Component {




    
    //inEditMode

    timestampSortDesc = (a,b) => {
    if(a._timestamp < b._timestamp) return 1;
    if(a._timestamp > b._timestamp) return -1;
    return 0;
    }



  /*  
				if (this.props.appState.settings.showShared || dbrow._owner === this.props.appState.userId) {
				    let renderMode="view";
				    if (this.props.appState.rowUpdateMode!=="view") {
					if (dbrow._id===this.props.appState.rowUnderUpdate._id) { renderMode=this.props.appState.rowUpdateMode; }
				    }
				return(
					<Row key={dbrow._id}
				    renderMode={renderMode}
				    viewRowIndex = {index}
				    appState = {this.props.appState}
				    appFuns = {this.props.appFuns}
					/>
				) } else {return([])}
*/
    
    renderOneRow(index, dbrow) {

//	console.log("renderOneRow",index)
			if (this.props.appState.settings.showShared || dbrow._owner === this.props.appState.userId) {
		    	    let renderMode="view";
				    if (this.props.appState.rowUpdateMode!=="view") {
					if (dbrow._id===this.props.appState.rowUnderUpdate._id) { renderMode=this.props.appState.rowUpdateMode; }
				    }

		    return(	<Grid key={index} item xs={12}>	    
				<Row key={dbrow._id} renderMode={renderMode}
				appState = {this.props.appState}
				appFuns = {this.props.appFuns}
				viewRowIndex = {index}				
				/>
				</Grid>
			  )} else {
			      console.log("TYHJÄ RIVI");
			      return([])
			  }

    }
    
    render() {
	/*
	console.log("ContentArea, enter, rivejä=",this.props.appState.dbRows.length)
		console.log("ContentArea, enter, rivit=",this.props.appState.dbRows)
*/


	
	let BEmsgField = <Box mt={2}>
	    <Typography component="div" color="secondary">{this.props.appState.msgFromBackend}</Typography>
	    </Box>


	
	/* aina aikajärjestys */
	this.props.appState.dbRows.sort(this.timestampSortDesc);

	let rows = [];

	if (this.props.appState.userRole==="editor") {
	    if (this.props.appState.rowUpdateMode==="add") {
		rows.push( <Grid key={-1} item xs={12}>
			   <Row renderMode="add"
				appState = {this.props.appState}
				appFuns = {this.props.appFuns}
				viewRowIndex = {-1}	
				/>
			   </Grid>)
	    } else {
		rows.push( <Grid key={-1} item xs={12}>
			   <Button onClick={this.props.appFuns.initiateCreateRow} variant="outlined" color="primary" size="small">Add new data</Button>  
			   </Grid>)
	    }
	}
	
	if (this.props.appState.settings.groupBy === "none") {

	    /*
	    console.log("ContentArea, no grouping")
	    console.log("ContentArea, rivejä:",this.props.appState.dbRows.length);
*/

	    let rows2 = this.props.appState.dbRows.map(
	    (dbrow,index) => {
		return(this.renderOneRow(index,dbrow));		    
	    }) // map
	    rows.push(rows2);
	} // if no grouping
	else {

	    //console.log("visib",this.props.appState.settings.valueVisibility)

	    for (let groupingVariableValue in this.props.appState.settings.valueVisibility) {


		console.log("ContentArea, groupby",this.props.appState.settings.groupBy)
		console.log("ContentArea, groupby-val",groupingVariableValue)

		
		if (this.props.appState.settings.valueVisibility[groupingVariableValue]) {

		    /* käy aina läpi koko tietokannan :( */
		    let rows2 = this.props.appState.dbRows.map(
			(dbrow,index) => {

	    		    //console.log("ContentArea, grouping:",index)

			    console.log("ContentArea", dbrow[this.props.appState.settings.groupBy])
			    
			    if (dbrow[this.props.appState.settings.groupBy]===groupingVariableValue) {

				
				return(this.renderOneRow(index,dbrow));
			    }
			
			    
			    //console.log("x")
			    //return(<div key={index} className="groupTitle">{groupingVariableValue}</div>);
			    //   return(<div key={index}>x</div>)
			    return([])
			}) // map;


		    rows.push(
			    <div key={groupingVariableValue}>			    
			    <div className="groupTitle">{groupingVariableValue}</div>
			    <Grid container spacing={3}>
			    {rows2}
			</Grid>
			    </div>
		    );
		    
	    } // if visible
	    } // for tietokannan rivit
	}

//	('contents',rows)

	return(
		<>
		<Grid container spacing={3}>
		<Grid item xs={12}>
		{BEmsgField}
	    </Grid>
		<Grid item container spacing={3}>
		{rows}
	    	    </Grid>
	    </Grid>

	    </>
	)
    }

}

