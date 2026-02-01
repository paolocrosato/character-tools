import { IconButton, Tooltip } from '@mui/material'
import {
  DataGrid,
  type GridActionsColDef,
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridRenderCellParams,
  type GridSortModel,
  getGridStringOperators
} from '@mui/x-data-grid'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { type FC, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppDispatch from '@/hooks/useAppDispatch'
import { deleteCharacter, getAllCharacters } from '@/services/character'
import { setCharacterEditor } from '@/state/characterEditorSlice'
import { setAlert, setDialog } from '@/state/feedbackSlice'
import { type CharacterDatabaseData } from '@/types/character'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const renderImage = (
  params: GridRenderCellParams<CharacterDatabaseData>
): React.ReactNode => {
  const imagePath = params.value
  const imageUrl = imagePath?.startsWith('http')
    ? imagePath
    : imagePath
      ? `${API_URL.replace('/api', '')}/${imagePath}`
      : undefined

  return (
    <div
      css={{
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        width: '100%',
        aspectRatio: '1'
      }}
    >
      {imageUrl && (
        <img
          css={{
            objectFit: 'cover'
          }}
          src={imageUrl}
          alt={params.row.name}
        />
      )}
    </div>
  )
}

const filterOperators = getGridStringOperators().filter(
  (operator) => operator.value !== 'isAnyOf'
)

const CharacterTable: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 0
  })
  const [totalCharacters, setTotalCharacters] = useState(0)
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [characters, setCharacters] = useState<CharacterDatabaseData[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  // Function to refresh characters
  const refreshCharacters = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  // Fetch characters from backend API
  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true)
      try {
        const allCharacters = await getAllCharacters()

        // Apply filtering
        let filtered = allCharacters
        if (filterModel.items.length > 0) {
          const fieldToFilter = filterModel.items[0].field as
            | 'name'
            | 'description'
            | 'personality'
            | 'creator'
            | 'creator_notes'
            | 'character_version'
            | 'tags'
            | 'system_prompt'
            | 'post_history_instructions'
          const filterValue = (filterModel.items[0].value as string) ?? ''
          const operator = filterModel.items[0].operator

          filtered = allCharacters.filter((character) => {
            if (fieldToFilter === undefined || filterValue === undefined) {
              return true
            }
            switch (operator) {
              case 'equals':
                if (fieldToFilter === 'tags') {
                  return character[fieldToFilter].some(
                    (tag) => tag === filterValue
                  )
                }
                return character[fieldToFilter] === filterValue
              case 'startsWith':
                if (fieldToFilter === 'tags') {
                  return character[fieldToFilter].some((tag) =>
                    tag.startsWith(filterValue)
                  )
                }
                return character[fieldToFilter].startsWith(filterValue)
              case 'endsWith':
                if (fieldToFilter === 'tags') {
                  return character[fieldToFilter].some((tag) =>
                    tag.endsWith(filterValue)
                  )
                }
                return character[fieldToFilter].endsWith(filterValue)
              case 'isEmpty':
                if (fieldToFilter === 'tags') {
                  return character[fieldToFilter].length === 0
                }
                return character[fieldToFilter] === ''
              case 'isNotEmpty':
                if (fieldToFilter === 'tags') {
                  return character[fieldToFilter].length > 0
                }
                return character[fieldToFilter] !== ''
              case 'contains':
              default:
                if (fieldToFilter === 'tags') {
                  return character[fieldToFilter].some((tag) =>
                    tag.includes(filterValue)
                  )
                }
                return character[fieldToFilter].includes(filterValue)
            }
          })
        }

        // Apply sorting
        if (sortModel.length > 0) {
          const { field, sort } = sortModel[0]
          filtered.sort((a, b) => {
            const aValue = a[field as keyof CharacterDatabaseData]
            const bValue = b[field as keyof CharacterDatabaseData]
            if (aValue == null && bValue == null) return 0
            if (aValue == null) return sort === 'asc' ? 1 : -1
            if (bValue == null) return sort === 'asc' ? -1 : 1
            if (aValue < bValue) return sort === 'asc' ? -1 : 1
            if (aValue > bValue) return sort === 'asc' ? 1 : -1
            return 0
          })
        }

        setTotalCharacters(filtered.length)
        setCharacters(filtered)
      } catch (error) {
        console.error('Failed to fetch characters:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharacters()
  }, [paginationModel, sortModel, filterModel, refreshKey])

  const renderActions: GridActionsColDef<CharacterDatabaseData>['getActions'] =
    useCallback(
      (params) => [
        <Tooltip
          key={`edit-${params.row.id}`}
          title="Edit"
        >
          <IconButton
            size="small"
            onClick={() => {
              dispatch(
                setDialog({
                  title: 'Edit character?',
                  content:
                    'if you have unsaved information in the editor it will be lost.',
                  actions: [
                    {
                      label: 'Cancel',
                      severity: 'inherit'
                    },
                    {
                      label: 'Edit',
                      onClick: () => {
                        // Convert image_path to full URL for editor
                        const imageUrl = params.row.image_path
                          ? `${API_URL.replace('/api', '')}/${params.row.image_path}`
                          : undefined
                        dispatch(
                          setCharacterEditor({
                            ...params.row,
                            image: imageUrl
                          })
                        )
                        navigate('/character-editor?tab=character-data')
                      },
                      severity: 'success'
                    }
                  ]
                })
              )
            }}
          >
            <Pencil size={16} />
          </IconButton>
        </Tooltip>,
        <Tooltip
          key={`delete-${params.row.id}`}
          title="Delete"
        >
          <IconButton
            size="small"
            onClick={() => {
              dispatch(
                setDialog({
                  title: 'Delete character?',
                  content: 'This action cannot be undone.',
                  actions: [
                    {
                      label: 'Cancel',
                      severity: 'inherit'
                    },
                    {
                      label: 'Delete',
                      severity: 'error',
                      onClick: () => {
                        deleteCharacter(params.row.id)
                          .then(() => {
                            refreshCharacters()
                            dispatch(
                              setAlert({
                                title: 'Character deleted',
                                message: `Character ${params.row.name} deleted`,
                                severity: 'success'
                              })
                            )
                          })
                          .catch((error) => {
                            if (error instanceof Error) {
                              dispatch(
                                setAlert({
                                  title: 'Error deleting character',
                                  message: error.message,
                                  severity: 'error'
                                })
                              )
                            } else {
                              dispatch(
                                setAlert({
                                  title: 'Error deleting character',
                                  message: `Character ${params.row.name} could not be deleted`,
                                  severity: 'error'
                                })
                              )
                            }
                          })
                      }
                    }
                  ]
                })
              )
            }}
          >
            <Trash2 size={16} />
          </IconButton>
        </Tooltip>,
        <Tooltip
          key={`edit-as-new-${params.row.id}`}
          title="Edit as new"
        >
          <IconButton
            size="small"
            onClick={() => {
              dispatch(
                setDialog({
                  title: 'Edit as new character?',
                  content:
                    'if you have unsaved information in the editor it will be lost.',
                  actions: [
                    {
                      label: 'Cancel',
                      severity: 'inherit'
                    },
                    {
                      label: 'Edit',
                      onClick: () => {
                        // Convert image_path to full URL for editor
                        const imageUrl = params.row.image_path
                          ? `${API_URL.replace('/api', '')}/${params.row.image_path}`
                          : undefined
                        dispatch(
                          setCharacterEditor({
                            ...params.row,
                            id: undefined,
                            image: imageUrl
                          })
                        )
                        navigate('/character-editor?tab=character-data')
                      },
                      severity: 'success'
                    }
                  ]
                })
              )
            }}
          >
            <Plus size={16} />
          </IconButton>
        </Tooltip>
      ],
      []
    )

  const columns: Array<GridColDef<CharacterDatabaseData>> = [
    {
      field: 'actions',
      type: 'actions',
      hideable: false,
      sortable: false,
      minWidth: 120,
      getActions: renderActions,
      filterable: false
    },
    {
      field: 'id',
      headerName: 'ID',
      width: 150,
      sortable: false,
      filterable: false
    },
    {
      field: 'image_path',
      headerName: 'Image',
      width: 75,
      sortable: false,
      renderCell: renderImage,
      filterable: false
    },
    { field: 'name', headerName: 'Name', width: 200, filterOperators },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      sortable: false,
      filterOperators
    },
    {
      field: 'personality',
      headerName: 'Personality',
      flex: 1,
      sortable: false,
      filterOperators
    },
    {
      field: 'mes_example',
      headerName: 'Messages Example',
      flex: 1,
      sortable: false,
      filterable: false
    },
    {
      field: 'scenario',
      headerName: 'Scenario',
      flex: 1,
      sortable: false,
      filterOperators
    },
    {
      field: 'first_mes',
      headerName: 'First Message',
      flex: 1,
      sortable: false,
      filterOperators
    },
    {
      field: 'alternate_greetings',
      headerName: 'Alternate Greetings',
      flex: 1,
      sortable: false,
      filterable: false
    },
    { field: 'creator', headerName: 'Creator', flex: 0, filterOperators },
    {
      field: 'creator_notes',
      headerName: 'Creator Notes',
      flex: 1,
      sortable: false,
      filterOperators
    },
    { field: 'character_version', headerName: 'Version', width: 100 },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1,
      valueGetter: (_, row) => row.tags.join(', '),
      sortable: false,
      filterOperators
    },
    {
      field: 'system_prompt',
      headerName: 'System Prompt',
      flex: 1,
      sortable: false,
      filterOperators
    },
    {
      field: 'post_history_instructions',
      headerName: 'Post History Instructions',
      flex: 1,
      sortable: false,
      filterOperators
    }
  ]

  return (
    <div
      css={{
        height: 'calc(100vh - 210px)',
        minHeight: 'calc(75vh)'
      }}
    >
      <DataGrid
        initialState={{
          columns: {
            columnVisibilityModel: {
              id: false,
              description: false,
              personality: false,
              mes_example: false,
              scenario: false,
              first_mes: false,
              alternate_greetings: false,
              creator_notes: false,
              system_prompt: false,
              post_history_instructions: false
            }
          }
        }}
        loading={isLoading}
        rows={characters ?? []}
        rowCount={totalCharacters}
        columns={columns}
        rowSelection={false}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        filterMode="server"
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        autoPageSize={true}
      />
    </div>
  )
}
export default CharacterTable
