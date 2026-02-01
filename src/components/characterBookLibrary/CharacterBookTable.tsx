import { IconButton, Tooltip } from '@mui/material'
import {
  DataGrid,
  type GridActionsColDef,
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridSortModel
} from '@mui/x-data-grid'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { type FC, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppDispatch from '@/hooks/useAppDispatch'
import {
  deleteCharacterBook,
  getAllCharacterBooks
} from '@/services/characterBooks'
import { setCharacterBookEditor } from '@/state/characterBookEditorSlice'
import { setAlert, setDialog } from '@/state/feedbackSlice'
import { type CharacterBookDatabaseData } from '@/types/lorebook'

const CharacterBookTable: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10
  })
  const [totalCharacterBooks, setTotalCharacterBooks] = useState(0)
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [characterBooks, setCharacterBooks] = useState<
    CharacterBookDatabaseData[]
  >([])
  const [refreshKey, setRefreshKey] = useState(0)

  // Function to refresh character books
  const refreshCharacterBooks = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  // Fetch character books from backend API
  useEffect(() => {
    const fetchCharacterBooks = async () => {
      setIsLoading(true)
      try {
        const allCharacterBooks = await getAllCharacterBooks()

        // Apply filtering
        let filtered = allCharacterBooks
        if (filterModel.items.length > 0) {
          const fieldToFilter = filterModel.items[0].field as
            | 'name'
            | 'description'
          const filterValue = (filterModel.items[0].value as string) ?? ''
          const operator = filterModel.items[0].operator

          filtered = allCharacterBooks.filter((characterBook) => {
            if (fieldToFilter === undefined || filterValue === undefined) {
              return true
            }
            switch (operator) {
              case 'contains':
                return (
                  characterBook[fieldToFilter]
                    ?.toLowerCase()
                    .includes(filterValue.toLowerCase()) ?? false
                )
              case 'startsWith':
                return (
                  characterBook[fieldToFilter]
                    ?.toLowerCase()
                    .startsWith(filterValue.toLowerCase()) ?? false
                )
              case 'endsWith':
                return (
                  characterBook[fieldToFilter]
                    ?.toLowerCase()
                    .endsWith(filterValue.toLowerCase()) ?? false
                )
              case 'equals':
                return (
                  characterBook[fieldToFilter]?.toLowerCase() ===
                  filterValue.toLowerCase()
                )
              case 'notEquals':
                return (
                  characterBook[fieldToFilter]?.toLowerCase() !==
                  filterValue.toLowerCase()
                )
              case 'is':
                return (
                  characterBook[fieldToFilter]?.toLowerCase() ===
                  filterValue.toLowerCase()
                )
              case 'isNot':
                return (
                  characterBook[fieldToFilter]?.toLowerCase() !==
                  filterValue.toLowerCase()
                )
              default:
                return true
            }
          })
        }

        // Apply sorting
        if (sortModel.length > 0) {
          const { field, sort } = sortModel[0]
          filtered.sort((a, b) => {
            const aValue = a[field as keyof CharacterBookDatabaseData]
            const bValue = b[field as keyof CharacterBookDatabaseData]
            if (aValue == null && bValue == null) return 0
            if (aValue == null) return sort === 'asc' ? 1 : -1
            if (bValue == null) return sort === 'asc' ? -1 : 1
            if (aValue < bValue) return sort === 'asc' ? -1 : 1
            if (aValue > bValue) return sort === 'asc' ? 1 : -1
            return 0
          })
        }

        setTotalCharacterBooks(filtered.length)
        setCharacterBooks(filtered)
      } catch (error) {
        console.error('Failed to fetch character books:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharacterBooks()
  }, [paginationModel, filterModel, sortModel, refreshKey])

  const renderActions: GridActionsColDef<CharacterBookDatabaseData>['getActions'] =
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
                      severity: 'success',
                      onClick: () => {
                        dispatch(setCharacterBookEditor(params.row))
                        navigate('/characterbook-editor?tab=characterbook-data')
                      }
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
                        deleteCharacterBook(params.row.id)
                          .then(() => {
                            refreshCharacterBooks()
                            dispatch(
                              setAlert({
                                title: 'Character deleted',
                                message: 'Character Book deleted',
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
                                  message:
                                    'Character Book could not be deleted',
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
            key={`edit-as-new-${params.row.id}`}
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
                      severity: 'success',
                      onClick: () => {
                        dispatch(
                          setCharacterBookEditor({
                            ...params.row,
                            id: undefined
                          })
                        )
                        navigate('/characterbook-editor?tab=characterbook-data')
                      }
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

  const columns: Array<GridColDef<CharacterBookDatabaseData>> = [
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
      sortable: true,
      filterable: true
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 120,
      type: 'string',
      filterable: true,
      sortable: true
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 120,
      type: 'string',
      filterable: false,
      sortable: false
    },
    {
      field: 'scan_depth',
      headerName: 'Scan Depth',
      flex: 0,
      minWidth: 40,
      type: 'number',
      filterable: false,
      sortable: false
    },
    {
      field: 'token_budget',
      headerName: 'Token Budget',
      flex: 0,
      minWidth: 40,
      type: 'number',
      filterable: false,
      sortable: false
    },
    {
      field: 'recursive_scanning',
      headerName: 'Recursive Scanning',
      flex: 0,
      minWidth: 40,
      type: 'boolean',
      filterable: false,
      sortable: false
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
              id: false
            }
          }
        }}
        loading={isLoading}
        rows={characterBooks ?? []}
        rowCount={totalCharacterBooks}
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

export default CharacterBookTable
