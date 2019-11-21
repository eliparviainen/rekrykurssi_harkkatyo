import {withStyles} from '@material-ui/core'
import InputLabel from '@material-ui/core/InputLabel'
import Button from '@material-ui/core/Button'

export function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}



export const DDTinputLabel= withStyles({
  root: {
      color: "text.secondary",
      fontSize: "0.8em"      
  },
})(InputLabel);




// color and variant cannot be set here
export const DDTbutton= withStyles({
  root: {
      margin: "1.5em"
  },
})(Button);
