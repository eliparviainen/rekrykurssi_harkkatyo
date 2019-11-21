import React from 'react';
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

export default class NavBar extends React.Component {

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
		<span>Databases for Daily Topics</span>
		</Typography>		
		{this.signInOptions()}	           
            </Toolbar>
        </AppBar>
        </div>
	)
    }   
}
