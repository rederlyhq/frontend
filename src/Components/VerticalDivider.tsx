import { Divider, withStyles } from '@material-ui/core';

export const VerticalDivider = withStyles({
    vertical: {
        '&$middle': {
            marginTop: '5px',
            marginBottom: '5px',
        }
    },
    // Middle has to be specified for the correct styles to be generated.
    middle: { }
})(Divider);
