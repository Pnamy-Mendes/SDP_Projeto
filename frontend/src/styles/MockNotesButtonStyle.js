import { makeStyles } from '@mui/styles'

export const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: theme.spacing(50), // Example usage
    position: 'absolute',
    right: '33%',
    bottom: '3%'
  },
  [theme.breakpoints.down('xs')]: {
    root: {
      right: '13%'
    }
  }
}))
