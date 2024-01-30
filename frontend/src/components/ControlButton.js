import Button from '@mui/material/Button'
import { useStyles } from './../styles/ControlButtonsStyle'
import theme from './../styles/theme'

export default function ControlButtons({
  name,
  type,
  active,
  displayIndicator = true,
  onClick
}) {
  const classes = useStyles()
  const color = theme.palette[type].main

  return (
    <>
      <Button
        className={classes.button}
        variant={active ? 'contained' : 'text'}
        style={{ backgroundColor: active ? color : 'transparent' }}
        onClick={() => onClick(name)}
        disableElevation
      >
        <span>{name}</span>
        {!active && displayIndicator && (
          <span className={classes.indicator} style={{ color: color }}>
            •
          </span>
        )}
      </Button>
    </>
  )
}
