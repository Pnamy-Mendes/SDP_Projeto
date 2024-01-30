import { makeStyles } from '@mui/styles'

export const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: theme.spacing(50), // Example usage
    color: '#fff',
    float: 'right',
    backgroundColor: theme.palette.primary.dark
  },
  [theme.breakpoints.down('xs')]: {
    root: {
      width: '100%',
      padding: '12px 8px'
    }
  }
}))
