import React from 'react';
import './App.css';
import OpenCloseArea from './comps/OpenCloseArea';

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
//import List from '@material-ui/core/List'
//import ListItem from '@material-ui/core/ListItem'
//import ListItemText from '@material-ui/core/ListItemText'
import Button from '@material-ui/core/Button'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import Box from '@material-ui/core/Box'


//import MainLayout from './comps/MainLayout';
//import Login from './comps/Login';
//import StateHelper from './comps/StateHelper';

const DEBUG = true;
const debugstyle = {color: "gray", fontSize: "0.8em", fontStyle:"italic"}




class ChooseDBarea extends OpenCloseArea {
    render() {
	return(
	    <div> ChooseDBarea </div>
	)
    }
}


class CreateDBarea extends OpenCloseArea {
    render() {
	if (this.props.appState.userRole!=="editor") {

	if (DEBUG) {
	    return(<div style={debugstyle}> debug: CreateDBarea ei näy koska käyttäjä ei ole editor-roolissa vaan roolissa {this.props.appState.userRole} </div>)
	}
	return([])
	}

		return(
		<div> CreateDBarea </div>
	)
    }

}


class SettingsArea extends OpenCloseArea {
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

class AddRowArea extends OpenCloseArea {

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

class ContentsArea extends OpenCloseArea {
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
    }


    
    render() {
	let buttonName = (this.props.action==="signup")?"Sign up":"Sign in";
	let buttonFun = (this.props.action==="signup")?this.props.appFuns.finalizeSignUp:this.props.appFuns.finalizeSignIn;
	return(
		<div>
		<Typography component="div" align="center">
		<Box m={2}>
		<InputLabel>Username</InputLabel>
			    	<Box m={1}>
		<Input m={2} type="string" margin="none" name="userName" value={this.state.userName} onChange={this.change}></Input>
		</Box>		</Box>

		
	    	<Box m={2}>
		<InputLabel>Password</InputLabel>
					    	<Box m={1}>
		<Input type="password" margin="dense" name="password" value={this.state.password} onChange={this.change}></Input>
		</Box>		</Box>
	    
			    	<Box m={2}>
		<Button disabled={this.state.buttonDisabled}color="primary" variant="outlined" onClick={()=>{buttonFun(this.state.userName, this.state.password)}}>{buttonName}</Button>
		</Box>
		</Typography>

	    </div>
	)
    }   
}


class NavBar extends React.Component {

    signInOptions = () => {
	if (this.props.appState.userRole === "visitor") {

	    return(<div>
		   <Button color="inherit" onClick={this.props.appFuns.initiateSignUp}>Sign-up</Button>
		   <Button color="inherit" onClick={this.props.appFuns.initiateSignIn}>Sign-in</Button>
		   </div>
		  )

	} else {
	    return(
		    <Button color="inherit" onClick={this.props.appFuns.initiateSignOut}>Sign-out</Button>
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

class App extends React.Component {


    //======================================================================
    constructor(props) {
	super(props)
	this.state = {
	    pageState: "browse",
	    userId: "",
	    userName: "",
	    sessionToken: "",
	    userRole: "visitor",
	    dbId: "",
	    dbName: "",
	    dbRows: [],
	    dbTemplate: {}
	}
    } // constr

        //======================================================================
    appToBrowseState = () => { this.setState({pageState: "browse"}) }
    appToSignUpState = () => { this.setState({pageState: "signup"}) }
    appToSignInState = () => { this.setState({pageState: "signin"}) }


    userToVisitor = () => { this.setState({userRole: "visitor",
					   userId: "",
					   userName: "",
					   sessionToken: "",
					  }) }
    userToEditor = () => { this.setState({userRole: "editor"}) }
    userToOwner = () => { this.setState({userRole: "owner"}) }



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
                    response.json().then( (data) => { gotDataFun(data) } )
			.catch( (error) => { console.log(logname+": Failed to handle JSON: "+error); })
		    break
		case 409:
		    console.log(logname+": Server says non-ok status: "+response.status);
		    gotDataFun([], 409)
		    break
		default:
		    gotDataFun([], error)
		    break;
		}
            }) // then		 
            .catch( (error) =>
                    { console.log(logname+": Server says error: "+error);
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

    initiateSignOut = () => {
	console.log("KESKEN: signout");

	/*
	KESKEN
	liian mutkikasta valvoa frontendissä tietokantaan pääsyä,
	pyydä BE:ltä uusi tilanne (esim nykykanta voi olla täysin kielletty tai osin auki nyt)
*/

	this.userToVisitor();	
	this.appToBrowseState();
    }


    finalizeSignUp = (userName, password) => {	
        let req = this.makePostReq({"userName": userName, "password":password});

	console.log("finalizeSignUp, req", req);
	this.fetchAndProcess('/epdb/visitor/signup', req, "App.js/finalizeSignIn",
			     (data, status)=>{
				 if (!status) {
				 console.log("finalizeSignUp onnistui, logataan sisään");
				     this.finalizeSignIn(userName, password);
				 } else {
				     console.log("PUUTTUU: finalizeSignUp epäonnistui, sano käyttäjälle jotain tai tee jotain järkevää");
				     KESKEN
				 }
			     }) // fetch	
    }

    finalizeSignIn = (userName, password) => {

        let req = this.makePostReq({"userName": userName, "password":password});

	console.log("finalizeSignIn, req", req);
	this.fetchAndProcess('/epdb/visitor/signin', req, "App.js/finalizeSignIn",
			     (data)=>{
				 this.getDBlist();
				 this.setState({userId:data.userId, sessionToken:data.sessionToken})
				 this.userToEditor();
				 console.log("KESKEN: toteuta editor/owner-valinta tietokantaa valitessa")
				 this.appToBrowseState();

				 console.log("signed in "+this.state.userName+", id="+this.state.userId+"m token="+this.state.sessionToken)
			     }) // fetch
    } 



getDBlist = () => {
    console.log("KESKEN: getDBlist");
}

    render() {
	const functionList = {initiateSignUp:this.initiateSignUp,
			      initiateSignIn:this.initiateSignIn,
			      initiateSignOut:this.initiateSignOut,
			      finalizeSignUp:this.finalizeSignUp,
			      finalizeSignIn:this.finalizeSignIn,
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
		<ChooseDBarea appState={this.state} appFuns={functionList}/>
		<CreateDBarea appState={this.state} appFuns={functionList}/>
		<SettingsArea appState={this.state} appFuns={functionList}/>
		<AddRowArea appState={this.state} appFuns={functionList}/>
		<ContentsArea appState={this.state} appFuns={functionList}/>
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

        //======================================================================
    handleLogout = () => {
	let isAdmin=false;	
	this.setUserIdentity("_nobody",isAdmin);
    }

        //======================================================================
    createDB = (info) => {
	//	info.dbTemplate
	//	info.dbName


        let req = {
            method: "POST",
            mode: "cors",
            headers: {"Content-type":"application/json"},
	    body: JSON.stringify(info)
        }

	console.log("FE, App ",info)
	console.log("FE, App jsonstr", JSON.stringify(info))
	this.fetchAndProcess('/epdb/meta/'+this.state.userId, req, "App.js/createDB", ()=>{
	    this.getDBlist();
	});

    }
    
    //======================================================================
    render() {


	
	console.log("KORJAA: staten kanssa ei tartte hölmöä copya aina, setState osaa ")
	
	if (this.state.userName === "_nobody") {
	    return(
		    <Login
		//sendUpUserId = {this.setUserIdentity}
		//sendUpDBid = {this.chooseDB}
		dbNames={this.state.dbNames}
		sendUpLogin={this.handleLogin}
		    />
	    )}


        return(
                <div className="App">
		<MainLayout
	    dbNames={this.state.dbNames}
	    dbId={this.props.dbId}	    
	    userId={this.state.userId}
	    userIsAdmin={this.state.userIsAdmin}
	    currentDBname = {this.state.currentDBname}
	    dbRows={this.state.dbRows}
	    dbTemplate={this.state.dbTemplate}	    
	    sendUpDBchange={this.changeDBState}
	    sendUpDBid = {this.chooseDB}
	    sendUpLogout={this.handleLogout}
	    sendUpDBcreate={this.createDB}
		/>
                </div>      
        )
    }
}

*/

export default App;
