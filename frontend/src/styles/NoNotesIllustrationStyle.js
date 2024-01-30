import { makeStyles } from '@mui/styles'

export const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: theme.spacing(50), // Example usage
    position: 'relative',
    textAlign: 'center'
  },
  heading: {
    marginTop: '.5em',
    color: '#00000099',
    opacity: 0.6
  },
  illustration: {
    marginTop: '4em'
  },
  [theme.breakpoints.down('xs')]: {
    heading: {
      marginTop: '0',
      fontSize: '2em'
    }
  }
}))
