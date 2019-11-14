import React from 'react';
import './App.css';
//import OpenCloseArea from './comps/OpenCloseArea';

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
//import List from '@material-ui/core/List'
//import ListItem from '@material-ui/core/ListItem'
//import ListItemText from '@material-ui/core/ListItemText'
import Button from '@material-ui/core/Button'
import InputLabel from '@material-ui/core/InputLabel'
//import Input from '@material-ui/core/Input'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Box from '@material-ui/core/Box'
import {withStyles} from '@material-ui/core'
//import {makeStyles} from '@material-ui/core'

import {ExpansionPanel,ExpansionPanelSummary,ExpansionPanelDetails} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
//import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import {Select, MenuItem, FormControl} from '@material-ui/core';

const DEBUG = true;
const debugstyle = {color: "gray", fontSize: "0.8em", fontStyle:"italic"}


const OK = "ok";
const FORBIDDEN = "forbidden";
const CONFLICT = "conflict";
const NOT_FOUND = "not found";
const SOME_ERROR = "error";


function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


class ChooseDBarea extends React.Component {
    render() {
	return(
	    <div> ChooseDBarea </div>
	)
    }
}


class CreateDBarea extends React.Component {

    
        constructor(props) {
	super(props)

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


    createDB = () => {

	let info = { dbName: this.state.dbName,
		     dbDescription: this.state.dbDescription,
		     dbUserList: this.state.dbUserList,
		     dbTemplate: {
			 dbFieldTypes: this.state.dbFieldTypes,
			 dbEnums: this.state.dbEnums
		     }
		   }

	console.log("FE create DB ",info)	
	this.props.appFuns.createDB(info);
	this.zeroState();
	this.props.appFuns.consumeMsgFromBackend();
    }

    cancelCreateDB = () => {
	this.props.appFuns.cancelCreateDB();
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
	newState.newFieldType="";
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


	console.log("BEmsg=",this.props.appState.msgFromBackend)

	
	    return(
		    
		    <div>
		    
		    

		
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
		    <Button color="primary" variant="contained" size="large" onClick={this.cancelCreateDB}>Cancel</Button>
		    </Grid>
		    <Grid item xs={3}>
		    <Button color="primary" variant="contained" size="large"  disabled={isEmpty(this.state.dbFieldTypes)} onClick={this.createDB}>Create database</Button>
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
		    </div>	  
	    )
	    

    } // render

    /*

*/
    
}




class SettingsArea extends React.Component {
    render() {

	
	if (!this.props.appState.dbId) {
	    if (DEBUG) {
		return(<div style={debugstyle}> debug: SettingsArea ei näy koska tietokantaa ei ole valittu </div>)	    }	    
	    return([])	    
	}



	return(
	    <div> SettingsArea </div>
	)
    }

}

class AddRowArea extends React.Component {

    render() {

	if (!this.props.appState.dbId) {
	    if (DEBUG) {
		return(<div style={debugstyle}> debug: AddRowArea ei näy koska tietokantaa ei ole valittu </div>)	    }	    
	    return([])	    
	}
	
	
	if (this.props.appState.userRole!=="editor") {

	    if (DEBUG) {
		return(<div style={debugstyle}> debug: AddRowArea ei näy koska käyttäjä ei ole editor-roolissa vaan roolissa {this.props.appState.userRole} </div>)
	    }
	    
	    return([])
	}

	return(
		<div> AddRowArea </div>
	)
	

	}
}

class ContentsArea extends React.Component {
    render() {
	
	if (!this.props.appState.dbId) {
	    if (DEBUG) {
		return(<div style={debugstyle}> debug: ContentsArea ei näy koska tietokantaa ei ole valittu </div>)	    }	    
	    return([])	    
	}

	
	return(
	    <div> ContentsArea </div>
	)
    }

}


const DDTinputLabel= withStyles({
  root: {
      color: "text.secondary",
      fontSize: "0.8em"
  },
})(InputLabel);


// color and variant cannot be set here
const DDTbutton= withStyles({
  root: {
      margin: "1.5em"
  },
})(Button);

/*
const DDTerrorBox= withStyles({
  root: {
      color: "error.main",
      fontSize: "0.7em",
      padding: "1em",
  },
  label: {
    textTransform: 'none',
  },
})(Box);
*/


/*
const acceptDiscardButtons = (cancelText, cancelFun, acceptText, acceptFun, disableCond) => {
    return(		<Box m={2}>
			<DDTbutton color="primary" variant="contained" size="large" onClick={cancelFun}>{cancelText}</DDTbutton>
			<DDTbutton color="primary" variant="contained" size="large"  disabled={disableCond} onClick={acceptFun}>{acceptText}</DDTbutton>
			</Box>)
}
*/

class LoginPage extends React.Component {

    constructor(props) {
	super(props);
	this.state = {userName: "", password: "",buttonDisabled:true}
    }
  
    change = (event) => {
        let state = this.state;
        state[event.target.name] = event.target.value;
        this.setState(state);
	let hasData = (this.state.userName !== "" && this.state.password !== "");
	this.setState({buttonDisabled: !hasData});
	this.props.appFuns.consumeMsgFromBackend();
    }

    // field changed clear msgFromBackend, but
    // buttons must clear it also since after an error a new login
    // can be attempted without changing the fields  
    clickOk = () => {
	let buttonFun = (this.props.action==="signup")?this.props.appFuns.finalizeSignUp:this.props.appFuns.finalizeSignIn;
	this.props.appFuns.consumeMsgFromBackend();
	buttonFun(this.state.userName, this.state.password);
    }


    clickCancel = () => {
	this.props.appFuns.consumeMsgFromBackend();
	this.props.appFuns.cancelSignUpIn();
    }

    render() {
	let buttonName = (this.props.action==="signup")?"Sign up":"Sign in";

	return(
		<div>
		<Typography component="div" align="center">

		<Box m={2} color="error.main" fontSize="0.7em">
		<p>{this.props.appState.msgFromBackend}</p>
		</Box>
		<Box m={2}>
		<DDTinputLabel>Username</DDTinputLabel>
			    	<Box m={1}>
		<OutlinedInput m={2} type="string" margin="dense" name="userName" value={this.state.userName} onChange={this.change}/>
		</Box>		</Box>

		
	    	<Box m={2}>
		<DDTinputLabel>Password</DDTinputLabel>
					    	<Box m={1}>
		<OutlinedInput type="password" margin="dense" name="password" value={this.state.password} onChange={this.change}/>
		</Box>		</Box>

	    <Box m={2}>
		<DDTbutton color="primary" variant="contained" size="large" onClick={this.clickCancel}>Cancel</DDTbutton>
		<DDTbutton color="primary" variant="contained" size="large"  disabled={this.state.buttonDisabled} onClick={this.clickOk}>{buttonName}</DDTbutton>
		</Box>
		</Typography>

	    </div>
	)
    }   
}

    /*
		<Box m={2}>
		<DDTbutton color="primary" variant="outlined" onClick={this.props.appFuns.cancelSignUpIn}>Cancel</DDTbutton>
		<DDTbutton color="primary" variant="outlined" disabled={this.state.buttonDisabled} onClick={()=>{buttonFun(this.state.userName, this.state.password)}}>{buttonName}</DDTbutton>

*/

class NavBar extends React.Component {

    signInOptions = () => {
	if ((this.props.appState.userRole !== "editor") && (this.props.appState.userRole !== "owner")) {

	    return(<div>
		   <Button color="inherit" onClick={this.props.appFuns.initiateSignUp}>Sign-up</Button>
		   <Button color="inherit" onClick={this.props.appFuns.initiateSignIn}>Sign-in</Button>
		   </div>
		  )

	} else {
	    return(
		    <Button color="inherit" onClick={this.props.appFuns.signOut}>Sign-out</Button>
		   )
	    
	}
    }
    render() {
	return(
		<div>
		<AppBar position="static">
		<Toolbar>
                <Typography type="title" style={{ flex: 1 }}>
		<span className="logo">DDT</span> 
		<span>Databases for Daily Tasks</span>
		</Typography>		
		{this.signInOptions()}	           
            </Toolbar>
        </AppBar>
        </div>
	)
    }   
}



/*
const accordeonStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
})); 

const accordeonClasses = accordeonStyles();
*/

class App extends React.Component {


    //======================================================================
    constructor(props) {
	super(props)

	// create variables
	this.state = {
	    pageState: "",
	    userId: "",
	    userName: "",
	    sessionToken: "",
	    userRole: "",
	    dbId: "",
	    dbName: "",
	    dbRows: [],
	    dbTemplate: {},
	    msgFromBackend: ""
	}

    } // constr

    //======================================================================


    componentDidMount = () => {
    	// set initial values
	this.zeroState();
    }


    zeroState = () => {this.setState(
	{
	    pageState: "browse",
	    userId: "",
	    userName: "",
	    sessionToken: "",
	    userRole: "visitor",
	    dbId: "",
	    dbName: "",
	    dbRows: [],
	    dbTemplate: {},
	    msgFromBackend: ""
	})};
    
    appToBrowseState = () => { this.setState({pageState: "browse"}) }
    appToSignUpState = () => { this.setState({pageState: "signup"}) }
    appToSignInState = () => { this.setState({pageState: "signin"}) }


    userIntoVisitor = () => { this.setState({userRole: "visitor",
					   userId: "",
					   userName: "",
					   sessionToken: "",
					  }) }
    userIntoEditor = () => { this.setState({userRole: "editor"}) }

    // owner role does not currently differ from editor role
    // as database edit and delete have not been implemented
    userIntoOwner = () => { this.setState({userRole: "owner"}) }


    
    setMsgFromBackend = (msg) => {
	this.setState({msgFromBackend:msg});
    }

    consumeMsgFromBackend = (msg) => {
	this.setState({msgFromBackend:""});
    }
    

  //======================================================================
    fetchAndProcess = (path, req, logname, gotDataFun) => {

	console.log("fetch req",req)
	if (req.mode==="cors")
	{
	    console.log("fetchAndProcess: "+logname+" HUOM cors-moodi päällä");
	}

	fetch(path,req)          
            .then( (response) => {

		switch (response.status) {
		case 200:
                    response.json().then( (data) => { gotDataFun(data, OK) } )
			.catch( (error) => {
			    console.log(logname+": Failed to handle JSON: "+error);
			    gotDataFun([], SOME_ERROR)
			})
		    break
		case 409:
		    console.log(logname+": Server says non-ok status: "+response.status);
		    gotDataFun([], CONFLICT)
		    break
		case 403:
		    console.log(logname+": Server says non-ok status: "+response.status);
		    gotDataFun([], FORBIDDEN)
		    break
		case 404:
		    console.log(logname+": Server says non-ok status: "+response.status);
		    gotDataFun([], NOT_FOUND)
		    break		    
		default:
		    gotDataFun([], SOME_ERROR)
		    break;
		}
            }) // then		 
            .catch( (error) =>
                    {
			console.log(logname+": Server says error: "+error);
			gotDataFun([], SOME_ERROR)
		    }
                  ); 
    }

    //======================================================================
    
    makeReq = () => {
	let req = {
	    mode: "cors",
	    headers: {"Content-type":"application/json",
		      "token":this.state.sessionToken}
	}
	return(req)
    }
    
    makeGetReq = () => {
	let req = this.makeReq();
	req["method"]="GET";
	return req;
    }

    makeDeleteReq = () => {
	let req = this.makeReq();
	req["method"]="DELETE";
	return req;
    }

    makePutReq = (info) => {
	let req = this.makeReq();
	req["method"]="PUT";
	req["body"]=JSON.stringify(info);
	return req
    }

    makePostReq = (info) => {
	console.log("makePostReq ",info)
	let req = this.makeReq();
	req["method"]="POST";
	req["body"]=JSON.stringify(info);
	return req
    }

    
    
    //======================================================================
    
    initiateSignUp = () => {
	this.appToSignUpState();
    }

    initiateSignIn = () => {
	this.appToSignInState();
    }

    cancelSignUpIn = () => {
	this.appToBrowseState();
    }

    signOut = () => {

	let req = this.makePostReq({"userId": this.state.userId}); 

	console.log("sigout, req", req);
	this.fetchAndProcess('/epdb/editor/signout/'+this.state.userId, req, "App.js/signOut",
			     (data, status)=>{
				 console.log("signed out with status", status);
				 // In principle, a user could continue using a public database after signout,
				 // but keeping track of this is complicated. Always start from an initial state.
				 this.zeroState();
			     }) // fetch	
	this.userIntoVisitor();	
	this.appToBrowseState();
    }


    finalizeSignUp = (userName, password) => {	
        let req = this.makePostReq({"userName": userName, "password":password});

	console.log("finalizeSignUp, req", req);
	this.fetchAndProcess('/epdb/visitor/signup', req, "App.js/finalizeSignIn",
			     (data, status)=>{
				 switch (status) {				 
				 case OK: 
				     console.log("finalizeSignUp onnistui, logataan sisään");
				     this.finalizeSignIn(userName, password);
				     break;
				 case CONFLICT:				     				     
				     this.setMsgFromBackend("Username is taken. Please choose another one.");
				     break;
				 default:
				     this.setMsgFromBackend("Could not sign up. We don't know why.");
				     break;
				 } // switch
			     }) // fetch	
    }

    
    finalizeSignIn = (userName, password) => {

	console.log("KESKEN: mikä vain reload loggaa ulos koska tila ei säily, lisää sessionstorage");
	
        let req = this.makePostReq({"userName": userName, "password":password});

	console.log("finalizeSignIn, req", req);
	this.fetchAndProcess('/epdb/visitor/signin', req, "App.js/finalizeSignIn",
			     (data, status)=>{
				 switch (status) {				 
				 case OK:
				     this.getDBlist();
				     this.setState({userId:data.userId, sessionToken:data.sessionToken})
				     this.userIntoEditor();
				     console.log("KESKEN: toteuta editor/owner-valinta tietokantaa valitessa")
				     this.appToBrowseState();

				 console.log("signed in "+userName+", id="+this.state.userId+"m token="+this.state.sessionToken)
				     break;
				 case FORBIDDEN:				     				     
				     this.setMsgFromBackend("Wrong username or password.");
				     break;
				 default:
				     this.setMsgFromBackend("Could not sign in. We don't know why.");
				     break;
				 } // switch

				 
			     }) // fetch
    } 



        //======================================================================

    createDB = (dbinfo) => {
	console.log("KESKEN: tietokannan luonti puuttuu");

	let req = this.makePostReq(dbinfo);

	console.log("createDB, req", req);
	console.log("createDB, osote",'/epdb/owner/list/'+this.state.userId)
	this.fetchAndProcess('/epdb/owner/list/'+this.state.userId, req, "App.js/createDB",
			     (data, status)=>{
				 switch (status) {				 
				 case OK:
				     this.setMsgFromBackend("Database '"+data.dbName+"' succesfully created.");
				     
				     console.log("createDB onnistui");
				     // 
				     console.log("KESKEN: kun dblistanhaku valmis, pitää hakea uusi lista jotta nykykantakin on siinä")
				     console.log("KESKEN: kun dbvalinta valmis, just luotu tietokanta pitää samalla valita");

				     break;
				 default:
				     this.setMsgFromBackend("Could not create database. We don't know why.");
				     break;
				 } // switch
			     }) // fetch	

    }


    cancelCreateDB = (dbinfo) => {
	console.log("KESKEN: tietokannan luonnin peruminen puuttuu");
    }

        //======================================================================



getDBlist = () => {
    console.log("KESKEN: getDBlist");
}


    
    
    render() {

	console.log("userRole", this.state.userRole)
	
	const functionList = {initiateSignUp:this.initiateSignUp,
			      initiateSignIn:this.initiateSignIn,
			      signOut:this.signOut,
			      finalizeSignUp:this.finalizeSignUp,
			      finalizeSignIn:this.finalizeSignIn,
			      cancelSignUpIn:this.cancelSignUpIn,
			      consumeMsgFromBackend:this.consumeMsgFromBackend,
			      createDB:this.createDB,
			      cancelCreateDB:this.cancelCreateDB,
			     };

	switch (this.state.pageState) {
	case "signup":
		    	return(
			<div className="App">
			<LoginPage action="signup" appState={this.state} appFuns={functionList}/>
			</div>
		)

	case "signin":
	    	return(
			<div className="App">
			<LoginPage action="signin" appState={this.state} appFuns={functionList}/>
			</div>
		)
	default:
	return(
		<div className="App">
		<NavBar appState={this.state} appFuns={functionList}/>

		<Box m={2}>
	    <ExpansionPanel>
		<ExpansionPanelSummary
	    expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
		>
		<Typography color="primary" >Choose a database</Typography>
		</ExpansionPanelSummary>
		<ExpansionPanelDetails>
		<Typography component="div">
		<ChooseDBarea appState={this.state} appFuns={functionList}/>				
	       </Typography>
		</ExpansionPanelDetails>

	    </ExpansionPanel>
		
		<ExpansionPanel disabled={(this.state.userRole!=="editor")}
	    onChange={this.consumeMsgFromBackend}
		>

		<ExpansionPanelSummary
	    expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
		>
		<Typography color="primary">Manage databases</Typography>
		
		</ExpansionPanelSummary>
		<ExpansionPanelDetails>
		<Typography component="div">
		<CreateDBarea appState={this.state} appFuns={functionList}/>
	       </Typography>
		</ExpansionPanelDetails>

	    	    </ExpansionPanel>
		<ExpansionPanel disabled={(!this.state.dbId)}>

	    <ExpansionPanelSummary
	    expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3a-content"
            id="panel3a-header"
		>
		<Typography color="primary" >Settings</Typography>
		</ExpansionPanelSummary>
		<ExpansionPanelDetails>
		<Typography component="div">
		<SettingsArea appState={this.state} appFuns={functionList}/>
	       </Typography>
		</ExpansionPanelDetails>

	    	    </ExpansionPanel>
		<ExpansionPanel disabled={(!this.state.dbId)}>

	    <ExpansionPanelSummary
	    expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4a-content"
            id="panel4a-header"
		>
		<Typography color="primary" >Add new data</Typography>
		</ExpansionPanelSummary>
		<ExpansionPanelDetails>
		<Typography component="div">
		<AddRowArea appState={this.state} appFuns={functionList}/>
		
	       </Typography>
		</ExpansionPanelDetails>
	    </ExpansionPanel>
		<ExpansionPanel disabled={(!this.state.dbId)}>

	    <ExpansionPanelSummary
	    expandIcon={<ExpandMoreIcon />}
            aria-controls="panel5a-content"
            id="panel5a-header"
		>
		
		<Typography color="primary" >Database contents</Typography>
		</ExpansionPanelSummary>
		<ExpansionPanelDetails>
		<Typography component="div">
		<ContentsArea appState={this.state} appFuns={functionList}/>
	       </Typography>
		</ExpansionPanelDetails>

	    </ExpansionPanel>
	
</Box>
	    
		</div>
	)
	} // switch
    }
}
/*

    // ######################################################################
    // SIIVOTTAVAA
    // ######################################################################
    


  

    //======================================================================
    getDBlist = () =>{	
            let req = makeGetReq();
	console.log("getDBlist alota ");

	this.fetchAndProcess('/epdb/meta/', req, "App.js/getDBlist", (data) => {

	    console.log("getDBlist data ",data.dbNames)
	    
	    let newState = StateHelper.copyStateWithMods(this.state, "dbNames", data.dbNames);
	    //let newState = this.state;
	    //console.log("xxx=",data.dbNames.map((name)=>{return(name)}))
	    //newState.dbNames = data.dbNames.map((name)=>{return(name)});
	    this.setState(newState);
	    //console.log("getDBlist/tila ",this.state)
	} );     
    } // get content

    
    //======================================================================
    getDBinfo = () => {

        let req = {
            method: "GET",
            mode: "cors",
            headers: {"Content-type":"application/json"}
        }

	
	this.fetchAndProcess('/epdb/meta/'+this.state.dbId, req, "App.js/getDBinfo", (data) => {
	    let newState = StateHelper.copyStateWithMods(this.state, "currentDBname", data.currentDBname);
	    newState = StateHelper.copyStateWithMods(newState, "dbTemplate", data.dbTemplate);
	    this.setState(newState);


	} );     
    } // get content


    //======================================================================
    getDBcontent = () => {

        let req = {
            method: "GET",
            mode: "cors",
            headers: {"Content-type":"application/json"}
        }

	this.fetchAndProcess('/epdb/content/'+this.state.userId+"/"+this.state.dbId, req, "App.js/getDBcontent", (data) => {

	    //	    console.log('S1',this.state)
	    let newState = StateHelper.copyStateWithMods(this.state, "dbRows", data);
	    this.setState(newState);
	    //	    	    console.log('S2',this.state)
	    
	} );     
    } // get content


    //======================================================================
    // elinkaaren osa
    componentDidMount() {
	this.getDBlist();
    }

    //======================================================================
    changeDBState = (cmd, info) => {
	switch (cmd) {
	case 'create':
	    {  // suluissa jotta let req:lle block scope
		let req = makePostReq(info)
		{
		    method: "POST",
		    mode: "cors",
		    headers: {"Content-type":"application/json"},
		    body: JSON.stringify(info)
		}
		this.fetchAndProcess('/epdb/content/'+this.state.userId+"/"+this.state.dbId, req, "App.js/changeDBState/create", ()=>{});

		this.getDBcontent();		
	    }
	    break;
	case 'delete':
	    {
		console.log("App.js/del",info)
		let req = {
		    method: "DELETE",
		    mode: "cors",
		    headers: {"Content-type":"application/json"},
		}
		this.fetchAndProcess('/epdb/content/'+this.state.userId+"/"+this.state.dbId+"/"+info, req, "App.js/changeDBState/delete", ()=>{});
		
		this.getDBcontent();
		

	    }
	    break;
	case 'update':

	    console.log("appjs",info)
	    
	    {  // suluissa jotta let req:lle block scope
		let req = makePutReq(info)
		
		this.fetchAndProcess('/epdb/content/'+this.state.userId+"/"+this.state.dbId+"/"+info._id, req, "App.js/changeDBState/update", ()=>{});

    		this.getDBcontent();		
	    }
	    
	    
	    break;
	default:
	    console.log("VIRHE. Tuntematon kannanpäivityskäsky.");
	}
    }

    //======================================================================
    setUserIdentity = (userName, userId) => {
//	let newState = this.state;
//	newState.userName = userName;
//	newState.userName = userName;
	this.setState({userName: userName, userId: userId});
	console.log("user "+this.state.userName+" = "+this.state.userId);
	console.log("PUUTTUU: sessionstorageen tallennus ettei reload tuhoa tilaa");
    }

    //======================================================================
    chooseDB = (dbId) => {

	// oletustietokanta on valittava täällä koska:
	// tätä kutsutaaan myös login-tilassa jossa on
	// pakko tehä joku valinta (myöhemmin tänne päätyy
	// vain jos jotain oikeasti muuttuu)

	if (dbId === "") {
	    dbId = this.state.dbNames[0].id;
	}
	
	
	//console.log("App ", dbId)
	
	let newState = this.state;
	newState.dbId = dbId;
	this.setState(newState, () => {
	    // tapahtuu vasta kun tila muuttunut
	    this.getDBinfo();
            this.getDBcontent();
	});
	//console.log("dbid ",this.state.dbId);
	
    }

*/

export default App;
