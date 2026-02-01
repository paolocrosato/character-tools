import { SpeedDial, SpeedDialAction } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { ArrowDown, ArrowUp, Code, User, Wrench } from 'lucide-react'
import useAppDispatch from '@/hooks/useAppDispatch'
import useAppSelector from '@/hooks/useAppSelector'
import { updateCharacterEditor } from '@/state/characterEditorSlice'
import replaceChar from '@/utilities/character/replaceChar'
import replaceName from '@/utilities/character/replaceName'

const useStyles = makeStyles(() => ({
  tooltips: {
    width: 'max-content',
    maxWidth: '50vw',
    fontSize: '1rem'
  }
}))

const ToolbarDial = () => {
  const characterEditorState = useAppSelector((state) => state.characterEditor)
  const dispatch = useAppDispatch()

  const classes = useStyles()
  return (
    <SpeedDial
      ariaLabel="Character Data Toolbar"
      sx={{ position: 'fixed', bottom: 72 + 16, right: 16 }}
      FabProps={{ size: 'large' }}
      icon={<Wrench size={20} />}
    >
      <SpeedDialAction
        classes={{ staticTooltipLabel: classes.tooltips }}
        tooltipTitle="Replace Name to {{char}}"
        tooltipOpen
        FabProps={{ size: 'medium' }}
        icon={
          <>
            <User size={16} />
            <ArrowUp size={20} />
            <Code size={16} />
          </>
        }
        onClick={() => {
          const newEditorState = replaceName(characterEditorState)
          dispatch(updateCharacterEditor(newEditorState))
        }}
      />
      <SpeedDialAction
        classes={{ staticTooltipLabel: classes.tooltips }}
        tooltipTitle="Replace {{char}} to Name"
        tooltipOpen
        FabProps={{ size: 'medium' }}
        icon={
          <>
            <User size={16} />
            <ArrowDown size={20} />
            <Code size={16} />
          </>
        }
        onClick={() => {
          const newEditorState = replaceChar(characterEditorState)
          dispatch(updateCharacterEditor(newEditorState))
        }}
      />
    </SpeedDial>
  )
}

export default ToolbarDial
