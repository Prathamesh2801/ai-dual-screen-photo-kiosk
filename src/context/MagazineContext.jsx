import { createContext, useContext, useMemo, useReducer, useRef } from 'react'
import { DEFAULT_PERSON, DEFAULT_TEXT } from '../utils/constants'



const initialState = {
  name: '',
  original: null,
  file: null,

  person: null,

  layout: {
    person: { ...DEFAULT_PERSON },
    text: { ...DEFAULT_TEXT, content: '' },
  },

  finalDataUrl: null,
  finalMeta: null,

  remote: {
    status: 'idle',
    imagePath: null,
    downloadUrl: null,
    error: null,
  },
}

const initialRemote = initialState.remote

function reducer(state, action) {
  switch (action.type) {
    case 'SET_UPLOAD':
      return {
        ...state,
        file: action.file,
        original: { dataUrl: action.dataUrl },
      }
    case 'SET_NAME':
      return {
        ...state,
        name: action.name,
        layout: {
          ...state.layout,
          text: { ...state.layout.text, content: action.name },
        },
      }
    case 'SET_PERSON':
      return {
        ...state,
        person: {
          dataUrl: action.dataUrl,
          aspect: action.aspect,
          processed: action.processed,
        },
      }
    case 'UPDATE_PERSON_LAYER':
      return {
        ...state,
        layout: {
          ...state.layout,
          person: { ...state.layout.person, ...action.patch },
        },
      }
    case 'UPDATE_TEXT_LAYER':
      return {
        ...state,
        layout: {
          ...state.layout,
          text: { ...state.layout.text, ...action.patch },
        },
      }
    case 'SET_FINAL':
      return { ...state, finalDataUrl: action.url, finalMeta: action.meta }
    case 'SET_REMOTE':
      return { ...state, remote: { ...state.remote, ...action.patch } }
    case 'RESET':
      return {
        ...initialState,
        layout: {
          person: { ...DEFAULT_PERSON },
          text: { ...DEFAULT_TEXT, content: '' },
        },
        remote: { ...initialRemote },
      }
    default:
      return state
  }
}

const MagazineContext = createContext(null)

export function MagazineProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const finalUrlRef = useRef(null)

  const actions = useMemo(
    () => ({
      setUpload: (file, dataUrl) => dispatch({ type: 'SET_UPLOAD', file, dataUrl }),
      setName: (name) => dispatch({ type: 'SET_NAME', name }),
      setPerson: (dataUrl, aspect, processed) =>
        dispatch({ type: 'SET_PERSON', dataUrl, aspect, processed }),
      updatePersonLayer: (patch) => dispatch({ type: 'UPDATE_PERSON_LAYER', patch }),
      updateTextLayer: (patch) => dispatch({ type: 'UPDATE_TEXT_LAYER', patch }),
      setFinal: (url, meta) => {
        if (finalUrlRef.current && finalUrlRef.current !== url) {
          URL.revokeObjectURL(finalUrlRef.current)
        }
        finalUrlRef.current = url
        dispatch({ type: 'SET_FINAL', url, meta })
      },
      setRemote: (patch) => dispatch({ type: 'SET_REMOTE', patch }),
      reset: () => {
        if (finalUrlRef.current) {
          URL.revokeObjectURL(finalUrlRef.current)
          finalUrlRef.current = null
        }
        dispatch({ type: 'RESET' })
      },
    }),
    [],
  )

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions])

  return <MagazineContext.Provider value={value}>{children}</MagazineContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMagazine() {
  const ctx = useContext(MagazineContext)
  if (!ctx) throw new Error('useMagazine must be used within a MagazineProvider')
  return ctx
}
