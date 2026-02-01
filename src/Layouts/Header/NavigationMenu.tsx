import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
  Tooltip
} from '@mui/material'
import {
  Book,
  BookOpen,
  Database,
  Home,
  Menu,
  PenTool,
  Users
} from 'lucide-react'
import { type FC, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface MenuLink {
  label: string
  url: string
  icon: FC
}

const MenuLinks: MenuLink[] = [
  { label: 'Home', url: '/', icon: Home },
  { label: 'Character Editor', url: '/character-editor', icon: PenTool },
  {
    label: 'Character Library',
    url: '/character-library',
    icon: Users
  },
  { label: 'CharacterBook Editor', url: '/characterbook-editor', icon: Book },
  {
    label: 'CharacterBook Library',
    url: '/characterbook-library',
    icon: BookOpen
  },
  { label: 'Manage Database', url: '/manage-database', icon: Database }
]

const NavigationMenu: FC = () => {
  const [openDrawer, setOpenDrawer] = useState(false)
  const location = useLocation()
  return (
    <>
      <Tooltip title="Menu">
        <IconButton
          onClick={() => {
            setOpenDrawer(true)
          }}
        >
          <Menu size={16} />
        </IconButton>
      </Tooltip>
      <SwipeableDrawer
        anchor="right"
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false)
        }}
        onOpen={() => {
          setOpenDrawer(true)
        }}
      >
        <Box
          sx={(theme) => ({
            minWidth: '100%',
            width: '100lvw',
            [theme.breakpoints.up('sm')]: {
              maxWidth: '250px'
            }
          })}
          role="presentation"
          onClick={() => {
            setOpenDrawer(false)
          }}
        >
          <Box
            sx={(theme) => ({
              height: '78px',
              borderBottom: `1px solid ${theme.palette.divider}`
            })}
          />
          <List disablePadding>
            {MenuLinks.map((menuLink, index) => (
              <ListItem
                disableGutters
                disablePadding
                key={`menu-link-${index}`}
              >
                <ListItemButton
                  component={Link}
                  to={menuLink.url}
                  selected={location.pathname === menuLink.url}
                >
                  <ListItemIcon>
                    <menuLink.icon />
                  </ListItemIcon>
                  <ListItemText primary={menuLink.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>
    </>
  )
}

export default NavigationMenu
