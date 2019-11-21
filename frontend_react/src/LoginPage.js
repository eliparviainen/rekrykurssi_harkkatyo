import React from 'react';
import Box from '@material-ui/core/Box';
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Typography from '@material-ui/core/Typography'

import {DDTinputLabel,DDTbutton} from './helperfuns';

export default class LoginPage extends React.Component {

    constructor(props) {
	super(props);
	this.props.appFuns.consumeMsgFromBackend();
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
