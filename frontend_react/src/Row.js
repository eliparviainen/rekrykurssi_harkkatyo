import React from 'react';
//import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
//import Paper from '@material-ui/core/Paper';
//import Box from '@material-ui/core/Box'
//import OutlinedInput from '@material-ui/core/OutlinedInput'
//import Button from '@material-ui/core/Button'
import {Select, MenuItem, FormControl} from '@material-ui/core';
//import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel  from '@material-ui/core/FormControlLabel'


import {isEmpty, DDTinputLabel} from './helperfuns';


// ============================================================
 class RowControls extends React.Component
// ============================================================
{
    renderViewControls = () => {

	/*
	console.log("renderViewC,indes",this.props.viewRowIndex)
	console.log("renderViewC,dbRows",this.props.appState.dbRows);
	console.log("renderViewC, user",this.props.appState.userId);
	console.log("renderViewC,row",this.props.appState.dbRows[this.props.viewRowIndex])
	console.log("renderViewC,row.owner",this.props.appState.dbRows[this.props.viewRowIndex]._owner)
*/
	
	
	if (this.props.appState.dbRows[this.props.viewRowIndex]._owner === this.props.appState.userId) {
	    
	    return(
		    <>
		    <Button onClick={()=>{this.props.appFuns.initiateUpdateRow(this.props.viewRowIndex);}} variant="outlined" color="primary" size="small">Edit</Button>  
		    <Button onClick={()=>{this.props.appFuns.initiateDeleteRow(this.props.viewRowIndex);}} variant="outlined" color="primary" size="small">Remove</Button>
		    </>	    )
	
	} else {
	    return(
		    <div className="sharingInfo"> Shared by another user<br/> (no editing) </div>
	    )
	}

	  
    }


    renderEditControls = () => {


	return(
	    <>
		<Button onClick={()=>{this.props.appFuns.finalizeUpdateRow();}} variant="outlined" color="secondary" size="small">Save</Button>  
		<Button onClick={()=>{this.props.appFuns.cancelUpdateRow();}} variant="outlined" color="primary" size="small">Discard edits</Button>
		    </>	
)
    }


    renderRemoveControls = () => {


	return(
	    <>

		<Button variant="outlined" color="secondary" onClick={()=>{this.props.appFuns.finalizeDeleteRow();}}>
		Confirm remove</Button>
		<Button variant="outlined" color="primary" onClick={()=>{this.props.appFuns.cancelDeleteRow();}}>
		Cancel remove</Button>
		</>	       
)
    }

    
        renderAddControls = () => {
	    

	    return(
		    <>
		    <Button onClick={this.props.appFuns.finalizeCreateRow} variant="outlined" color="secondary" size="small">Add</Button>  
		    <Button onClick={this.props.appFuns.cancelCreateRow} variant="outlined" color="primary" size="small">Clear fields</Button>
		    </>


)
    }


    render() {
	switch (this.props.controlMode) {
	case "edit":
	    return(this.renderEditControls())
	case "add":
	    return(this.renderAddControls())
	case "remove":
	    return(this.renderRemoveControls())
	default:
	    return(this.renderViewControls())
	    	} // switch
    }
}




export default class Row extends React.Component {


    static emptyRow(template) {
	console.log("joku kutsui Row.emptyRow:ta");
	// this.props.appState.dbTemplate
	let newRow = {};
	newRow["_isPublic"]=true;
	let enumTypes = [];
	for (let key in template.dbEnums) { enumTypes.push(key); }
	for (let key in template.dbFieldTypes)
	{
	    switch (template.dbFieldTypes[key]) {
	    case "string": newRow[key]=""; break;
	    case "text": newRow[key]=""; break;
	    case "url": newRow[key]=""; break;
	    case "number":newRow[key]=0; break;
	    default:
		// implicit assumption: everything not listed above is enum
		let ind = enumTypes.indexOf(template.dbFieldTypes[key]);
		if (ind>=0) {
		    let typeName = enumTypes[ind];
		    newRow[key]=template.dbEnums[typeName][0]; break;
		} else {
		    newRow[key]="(no value)";
		}
	    }//switch
	}//for

	return(newRow);
    }


    /*
    setIndex = (event) => {
	this.setState({indexInMenu:event.target.dataset.index});	
    }
*/


    renderSimpleInput = (elemwid, key, index, typeTag, multiline) => {

	elemwid = 12;
	
	if (this.props.renderMode === "edit" || this.props.renderMode === "add") {
	    if (!multiline) { multiline=false; }
	    let renderAsType = typeTag;
	    if (typeTag==="url") { renderAsType="string" }

	    /*
	    console.log("renderSimpleInput,mode",this.props.renderMode);
	    console.log("renderSimpleInput,key",key)
	    console.log("renderSimpleInput,row",this.props.appState.rowUnderUpdate[key]);
*/
	    
	    //console.log("renderSimpleInput",key)
	    //console.log("renderSimpleInput",this.props.appState.rowUnderUpdate[key])

	    // Initially, rowUnderUpdate comes here as an empty object so input
	    // values are undefined. Changing from unefined to defined later is
	    // not tolerated. So don't render undefineds.
	    if (this.props.appState.rowUnderUpdate[key]===undefined) {
		//console.log("ongelmakenttiä ei renderöidä");
		/*
		return(<TableRow key={index}>
		       <TableCell>
		       </TableCell></TableRow>)
		*/
		return(
			<Grid item xs={elemwid} key={index}>
			TYHJÄ RIVI (tänne ei pitäisi päätyä)
		       </Grid>)

	    }
	    
	    	return(
			
			    <Grid container item xs={elemwid} key={index}>
			<DDTinputLabel>{key} </DDTinputLabel>
			<OutlinedInput type={renderAsType} fullWidth={true} label={key}
		    placeholder={"("+typeTag+")"}
	    name={key}
	    multiline={multiline}
			value={this.props.appState.rowUnderUpdate[key]}
		    onChange={this.props.appFuns.changeRowUnderUpdate} />
			</Grid>
			
	)
	} // edit/add
	else {

	    //KESKEN
	    //rivin tallentaja ei laita datakenttiä lainkaan, vain systeemikentät
	    
/*
	    console.log("simple-render-for-view, index",this.props.viewRowIndex);
	    console.log("simple-render-for-view, rivi",this.props.appState.dbRows[this.props.viewRowIndex]);
	    console.log("simple-render-for-view, kenttä",this.props.appState.dbRows[this.props.viewRowIndex][key]);
*/
	    

//	    let st = (typeTag==="url")?{"fontStyle":"italic"}:{};
	    //	    return( <TableRow key={index}><TableCell style={st} multiline={multiline}>&nbsp;{this.props.appState.dbRows[this.props.viewRowIndex][key]}</TableCell></TableRow>)
	    

	    let fieldElem = [];
	    switch (typeTag) {
	    case "url":
		fieldElem = <TextField name="dbfield" variant="outlined"  margin="normal" style={{"fontStyle":"italic"}} InputProps={{readOnly: true}} label={key} defaultValue={this.props.appState.dbRows[this.props.viewRowIndex][key]}/>
		    break;
	    case "text":
		fieldElem = <TextField name="dbfield" variant="outlined"  margin="normal" InputProps={{readOnly: true}} label={key} defaultValue={this.props.appState.dbRows[this.props.viewRowIndex][key]} multiline/>
		    break;
	    case "string":
	    case "number":
	    default:
		    fieldElem = <TextField name="dbfield" variant="outlined" margin="normal" InputProps={{readOnly: true}} label={key} defaultValue={this.props.appState.dbRows[this.props.viewRowIndex][key]} />
		    break;
	    } // switch
	    return(
		   <Grid item xs={elemwid} key={index}>
		    <Card style={{padding:"0.25em"}}>
		    { fieldElem }
		   </Card>

		   </Grid>
	    )
	} // view
    }

    		
    renderEnumInput = (elemwid, key, index, enumName) => {

	elemwid = 12;
	
	// lyhenne
	let templateEnums = this.props.appState.dbTemplate.dbEnums;

	/*
	console.log('renderEnumInput enter, enumname=', enumName);
	console.log('renderEnumInput enter, enums=', templateEnums);
	*/


	
	if (this.props.renderMode === "edit" || this.props.renderMode === "add") {


	    /*
	    console.log('renderEnumInput name', enumName);
	    console.log('renderEnumInput all-enums', templateEnums);
	    console.log('renderEnumInput enum[name]', templateEnums[enumName]);
*/
	    
	let optionTags = templateEnums[enumName].map(
	    (enumval, index) => {
		return(<MenuItem key={index} value={enumval} name={enumval}
		       data-index={index} >
		       {enumval}</MenuItem>);
	    }) // map

	    // onMouseEnter={this.setIndex}
	    
	    
	    //console.log( optionTags );
	    // onchange={(event)=>this.changeEnum(enumName, event.target.value)}>

	    //console.log("renderEnum, value", this.props.appState.rowUnderUpdate[key]);

	    if ((!this.props.appState.rowUnderUpdate[key])||isEmpty(optionTags)) {
		//		console.log("ongelmaselektiä ei renderöidä");
		/*
		return(<TableRow key={index}>
		       <TableCell>
		       </TableCell></TableRow>)
		*/
				return(
		       <Grid item xs={elemwid} key={index}>
		       </Grid>)
	    }

	    //	    console.log("ongelmaselect renderöidään");

	    return(
		    
		<Grid item xs={elemwid} key={index}>
		<DDTinputLabel>{key}</DDTinputLabel>

		<FormControl variant="outlined" style={{minWidth:"10em"}}>
		<Select
	    	    name={key}
	    value={this.props.appState.rowUnderUpdate[key]}
	    onChange={this.props.appFuns.changeRowUnderUpdate}>
		{optionTags}
	    </Select>
		</FormControl>
		    </Grid>

	)
	} // add/edit
	else {

	    /*
	return(
	    		<TableRow key={index}>			    
		<TableCell>{this.props.appState.rowUnderUpdate[key]}			 
			    </TableCell>
		</TableRow>
	) 
*/
	    // view


	    let fieldElem = <TextField name="dbfield" variant="outlined" margin="normal" InputProps={{readOnly: true}} label={key} defaultValue={this.props.appState.dbRows[this.props.viewRowIndex][key]} />
		
//	    let fieldElem = <TextField name="dbfield" variant="outlined" margin="normal" InputProps={{readOnly: true}} label={key} defaultValue={this.props.appState.rowUnderUpdate[key]}		/>

	    	return(
		       <Grid item xs={elemwid} key={index}>
			<Card style={{padding:"0.25em"}}>
			{fieldElem}
		       </Card>
			    </Grid>
	) 
    }
    }

    formattedFields() {


//	console.log("RowCont props.jsonrow",this.props.appState.rowUnderUpdate);
	
	let fieldnames = [];
	let enumTypes = [];

	/*
	console.log("RowCedit jsonrow",this.props.appState.rowUnderUpdate)
	console.log("RowCedit template",this.props.appState.dbTemplate)
*/
	
	for (let key in this.props.appState.dbTemplate.dbFieldTypes) { fieldnames.push(key); }

//	console.log("RowCedit template enums",this.props.appState.dbTemplate.dbEnums)
	for (let key in this.props.appState.dbTemplate.dbEnums) { enumTypes.push(key); }
	
//	console.log("enums=",enumTypes)
	
	
//	console.log("RowCedit kentät",fieldnames)

	let wideElems = [];
	let narrowElems = [];


	let isChecked = {};
	let onChange= ()=>{};
	let readonly=true;
	if (this.props.renderMode==="view") {
	    isChecked = this.props.appState.dbRows[this.props.viewRowIndex]["_isPublic"];
	}
	if (this.props.renderMode==="edit" || this.props.renderMode==="add") {
	    isChecked = this.props.appState.rowUnderUpdate["_isPublic"];
	    onChange = this.props.appFuns.toggleRowPublicity;
	    readonly=false;
	}

	narrowElems.push(
		<Grid key={-1} item xs={12} >
		    <Card style={{padding:"0.25em"}}>
		    <FormControlLabel          
		control={
			<Checkbox
		    checked={isChecked}
		    onChange={onChange}
		    color="default"
			/>	     
		}
		disabled={readonly}
		label="visible to other users"
		labelPlacement="end"
	    	/>	     </Card>
		</Grid>
	    );
	
	let WIDE = 6;
	let NARROW = 4;
	
	fieldnames.forEach( (key, index) => {

	    /*
		console.log("RowCont key-"+index,key)
		console.log("RowCont type-"+index,this.props.appState.dbTemplate.dbFieldTypes[key])
*/

		
		//this.wrapWithTitle(key, () => {
		switch (this.props.appState.dbTemplate.dbFieldTypes[key]) {
		case "string":
		    wideElems.push(this.renderSimpleInput(WIDE, key, index, "text"));
		    break;

		case "url":
		    wideElems.push(this.renderSimpleInput(WIDE, key, index, "url"));
		    break;

		case "text":
		    let multiline=true;
		    wideElems.push(this.renderSimpleInput(WIDE, key, index, "text", multiline));
		    break;
		    			
		case "number":
		    //console.log("kutsuu renderSimple (nro)")


		    narrowElems.push(this.renderSimpleInput(NARROW, key, index, "number"));
		    //console.log("narrow=",narrowElems)
		    break;
		    
		default:

/*
		    console.log("RowCedit, enumTypes",enumTypes)
		    console.log("RowCedit, enumTypes, sisältäkö: ",this.props.appState.dbTemplate.dbFieldTypes[key])
*/
		    
		    if (enumTypes.includes(this.props.appState.dbTemplate.dbFieldTypes[key])) {

			/*
			console.log("RowContents, kenttätyypit",this.props.appState.dbTemplate.dbFieldTypes)
			console.log("RowContents, key=",key)
			console.log("RowContents, löytyi enumtyyppi",this.props.appState.dbTemplate.dbFieldTypes[key])
*/

			
			let enumName = this.props.appState.dbTemplate.dbFieldTypes[key];


			//console.log("kutsuu renderEnum",this.props.appState.rowUnderUpdate[key])
			
			
			narrowElems.push(this.renderEnumInput(NARROW, key, index, enumName));

			//console.log("narrow=",narrowElems)
			
		    } // enum-tyyppi
		    else {
			console.log("row edit/add: unknown field type, skip");
		    }
		    break;
		} // switch
		//}) // titleWrap			     
	    } //map:n fun	     
	) // map

	return({ wide: wideElems, narrow: narrowElems })

    }

    
    render() {
	
	/*
	if (isEmpty(this.props.appState.dbTemplate)) {
	    return(<p>No database.</p>);
	}
*/

/*
	console.log("Row:",this.props.renderMode)
	console.log("Row underUpd:",this.props.appState.rowUnderUpdate)
*/

	// add, edit, remove, view
	let ctrlsMode = this.props.renderMode;
	//if (this.props.renderMode==="remove") { ctrlsMode="edit"; }


	    
	let fields = this.formattedFields();

	if (this.props.renderMode==="edit") {
	    console.log("Row, kentät w=",fields.wide)
	    console.log("Row, kentät n=",fields.narrow)
	}
	
	
		    return(<>
		   <Paper elevation={5} >
			   <Grid container spacing={3}>  
		   
       	    	   <Grid item xs={6}>
			   <Card elevation={0} style={{padding:"0.25em"}}>
			   <Grid container spacing={3}>  
			   {fields.wide}
			   </Grid>
			   </Card>
		   </Grid>

			   <Grid item xs={4}>
			   <Card elevation={0} style={{padding:"0.25em"}}>
			   <Grid container spacing={3}>  
			   {fields.narrow}
			   		   </Grid>
			   </Card>
		   </Grid>

			   
			   <Grid item xs={2}>

			   <RowControls controlMode={ctrlsMode}
		   appState={this.props.appState}
		   appFuns={this.props.appFuns}
			   viewRowIndex={this.props.viewRowIndex}
		   />


		   		   </Grid>
		   </Grid>



		       </Paper>

		   <br/></>
	)


    } // render
   
}
