import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box'

export default class CreateDBarea extends React.Component {

    
        constructor(props) {
	super(props)
	this.props.appFuns.consumeMsgFromBackend();
	    this.state = {
		dbName: "",
		dbDescription:"",
		dbUserList:"",
		dbFieldTypes: {},
		dbEnums: {},
		newEnumName: "",
		newEnumValues: [],
		newFieldName: "",
		newFieldType: "string",
	}
	}


    zeroState = () => {this.setState(
	    {
		dbName: "",
		dbDescription:"",
		dbUserList:"",
		dbFieldTypes: {},
		dbEnums: {},
		newEnumName: "",
		newEnumValues: [],
		newFieldName: "",
		newFieldType: "string",
	}
	)};

    componentDidMount = () => {
    	// set initial values
	this.zeroState();
    }


    createSchema = () => {

	let info = { dbName: this.state.dbName,
		     dbDescription: this.state.dbDescription,
		     dbUserList: this.state.dbUserList,
		     dbTemplate: {
			 dbFieldTypes: this.state.dbFieldTypes,
			 dbEnums: this.state.dbEnums
		     }
		   }

	//console.log("FE create DB ",info)	
	this.props.appFuns.createSchema(info);
	this.zeroState();
	this.props.appFuns.consumeMsgFromBackend();
    }

    cancelCreateSchema = () => {
	this.props.appFuns.cancelCreateSchema();
	this.zeroState();
	this.props.appFuns.consumeMsgFromBackend();
    }


    /*
    		    for (let i=0; i<this.state.dbEnums[key].length; i++) {
			 {this.state.dbEnums[key].map(
			(value) => { return(<span>{value},</span>)})}
			 
    */
    renderExistingEnums = () => {
	//console.log(this.state.dbEnums)
	let enums = [];
	for (let key in this.state.dbEnums) {
	    let valuelist = this.state.dbEnums[key].join(',');
	    enums.push(
		    <TableRow key={key}>
		    <TableCell>{key}</TableCell>
		    <TableCell>{valuelist}
		</TableCell>
		    </TableRow>)
	}
	return(enums)
    }


        renderExistingFields = () => {
	    //console.log(this.state.dbFieldTypes)
	    let enums = [];
	    for (let key in this.state.dbFieldTypes) {
	    enums.push(
		    <TableRow key={key}>
		    <TableCell>{key}</TableCell>
		    <TableCell>{this.state.dbFieldTypes[key]}
		</TableCell>
		    </TableRow>)
	    }
	    return(enums)
    }

    
    changeField = (event) => {
	let newState = this.state;
	newState[event.target.name] = event.target.value;
	this.setState(newState);
//	console.log(this.state)
    }


    changeUserList = (event) => {
	let newState = this.state;
	newState.dbUserList = event.target.value.split(",")	
	this.setState(newState);
    }


    changeEnumName = (event) => {
	let newState = this.state;
	newState.newEnumName = event.target.value;
	this.setState(newState);
    }

    changeEnumValues = (event) => {
	let newState = this.state;
	newState.newEnumValues = event.target.value.split(",")	
	this.setState(newState);
    }


    createEnum = () => {
	let newState = this.state;
	newState.dbEnums[this.state.newEnumName] = this.state.newEnumValues;
	newState.newEnumName="";
	newState.newEnumValues=[];
	this.setState(newState);
    }

    createField = () => {
	let newState = this.state;
	if (this.state.newFieldType==="") { 
	    newState.dbFieldTypes[this.state.newFieldName] = "string"
	} else {
	    newState.dbFieldTypes[this.state.newFieldName] = this.state.newFieldType;
	}
	newState.newFieldName="";
	newState.newFieldType="string";
	this.setState(newState);
//	console.log(this.state)
    }

    renderEnumCreator = (oldEnumsFun) => {
	return(<Paper elevation={5}>
	       <Box p={1} fontWeight="fontWeightBold">
	       
                Custom types
               
	       </Box>
	       <Box p={2}>
	       <Table size="small">
		<TableHead>
		<TableRow>
		<TableCell title="e.g. Quality rating"> Type name </TableCell>
		<TableCell title="e.g. Very good, Average, Nonsense"> Comma-separated values (order determines rendering order) </TableCell><TableCell></TableCell>
		</TableRow>
		</TableHead>
	       <TableBody>
	       {oldEnumsFun()}
		<TableRow>
		<TableCell><OutlinedInput type="text" name="newEnumName" value={this.state.newEnumName} onChange={this.changeEnumName}/></TableCell>
		<TableCell><OutlinedInput type="text" name="newEnumValues" value={this.state.newEnumValues} onChange={this.changeEnumValues}/></TableCell>
	       <TableCell>
	       <Button onClick={this.createEnum} variant="outlined" color="primary" size="small" disabled={(isEmpty(this.state.newEnumName)||isEmpty(this.state.newEnumValues))}>Define a new type</Button>
	      
	       </TableCell>
		</TableRow>
	       </TableBody></Table>
	       </Box>
	       </Paper>
	)
    }





    renderFieldCreator = (oldFieldsFun) => {

	let fieldTypeOptions = [];
	fieldTypeOptions.push(<MenuItem key="string" value="string">string</MenuItem>)
	fieldTypeOptions.push(<MenuItem key="text" value="text">text</MenuItem>)
	fieldTypeOptions.push(<MenuItem key="url" value="url">URL</MenuItem>)
	fieldTypeOptions.push(<MenuItem key="number" value="number">number</MenuItem>)
	for (let typeName in this.state.dbEnums) {
	    fieldTypeOptions.push(<MenuItem key={typeName} value={typeName}>{typeName}</MenuItem>)
	}
	

	return(
		<Paper elevation={5}>
	       <Box p={2} fontWeight="fontWeightBold">
	       
            Fields
               
	    </Box>
			       <Box p={2}>
	       <Table size="small">
				<TableHead>
		<TableRow>
		<TableCell title="What would you expect to input in a field called 'Field name'?"> Field name </TableCell>
		<TableCell title="Field type. Custom types you define will be added here."> Field type </TableCell>
				<TableCell> </TableCell>
		</TableRow>
		</TableHead>
		<TableBody>
		{oldFieldsFun()}
		<TableRow>
		<TableCell><OutlinedInput type="text" name="newFieldName" value={this.state.newFieldName} onChange={this.changeField}/></TableCell>
		<TableCell>
		<FormControl variant="outlined" style={{minWidth:"10em"}}>
		<Select name="newFieldType" value={this.state.newFieldType} onChange={this.changeField} >
		{fieldTypeOptions}
	    </Select>
		</FormControl>
		</TableCell>
		<TableCell><Button onClick={this.createField} variant="outlined" size="small" color="primary"
	    disabled={(isEmpty(this.state.newFieldName)||isEmpty(this.state.newFieldType))}
		>Add new field</Button>
		</TableCell>
		</TableRow>
		</TableBody></Table>
		</Box>
		</Paper>
	)
    }




    
    render() {

	console.log("PUUTE: omille tyypeille voi laittaa monta samaa arvoa, ei tarkista -- sanitoi backendissä?")

	//console.log("BEmsg=",this.props.appState.msgFromBackend)

	
	    return(
		    
		    <>
		    
		    

		
		    <p>
		    You work in admin mode now. No undos, no confirmation questions.
		    If you mess it up, cancel and start afresh.
		    </p>
		    <hr/>

				
		    <Typography variant="h6">Create a database</Typography>
		    <br/>


		    <Paper elevation={5}>

		       <Box p={2} fontWeight="fontWeightBold">
	       
		Description
               
		</Box>
		    <Box p={2}>


		    <Table size="small">
		    <TableHead>
		<TableRow>
		<TableCell title="Database name, preferably shortish."> Name </TableCell>
		<TableCell title="Free-form text that tells something about the contents or purpose of your database."> Description </TableCell>
		    <TableCell title="List users who, besides yourself, can access the database. Cannot be changed later. Leave empty for public databases."> Comma-separated user list (leave empty if anybody can use) </TableCell>
		</TableRow>
		</TableHead>
		<TableBody>
		<TableRow>
		<TableCell><OutlinedInput variant="outlined" type="text" name="dbName" value={this.state.dbName} onChange={this.changeField}/></TableCell>
		    <TableCell><OutlinedInput type="text" name="dbDescription" multiline={true} value={this.state.dbDescription} onChange={this.changeField}/></TableCell>
		    <TableCell><OutlinedInput type="text" name="dbUserList" value={this.state.dbUserList} onChange={this.changeUserList}/></TableCell>
		</TableRow>
		</TableBody></Table>
    			       </Box>
		  
		</Paper>

		<br/>
		

		    {this.renderEnumCreator(this.renderExistingEnums)}

		    <br/>


		    {this.renderFieldCreator(this.renderExistingFields)}
		    <Box mt={4} mb={4}>


		    <Grid container>
		    <Grid item xs={3}>
		    <Button color="primary" variant="contained" size="large" onClick={this.cancelCreateSchema}>Cancel</Button>
		    </Grid>
		    <Grid item xs={3}>
		    <Button color="primary" variant="contained" size="large"  disabled={isEmpty(this.state.dbFieldTypes)} onClick={this.createSchema}>Create database</Button>
		    </Grid>		    </Grid>

				</Box>


		    <Box mt={2}>
		    <Typography component="span" color="secondary">{this.props.appState.msgFromBackend}</Typography>
		    </Box>


		    <hr/>
		    
		    <Typography variant="h6">Delete a database</Typography>
		    <p>
		    Apologies, this is a course project work, not a full-scale application.<br/>
		    Databases can only be deleted by hand.
		    Contact a super-admin who can access the database server.
		    </p>
		    </>	  
	    )
	    

    } // render

    /*

*/
    
}

