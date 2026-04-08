import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

interface OrientationState {
  isLandscape: boolean
  isNarrow: boolean
  isMobileLandscape: boolean
  isMobilePortrait: boolean
}

const OrientationContext = createContext<OrientationState>({
  isLandscape: false,
  isNarrow: false,
  isMobileLandscape: false,
  isMobilePortrait: false,
})

export function useOrientation() {
  return useContext(OrientationContext)
}

export function OrientationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OrientationState>(() =>
    computeOrientation(),
  )

  useEffect(() => {
    function update() {
      setState(computeOrientation())
    }

    const landscape = window.matchMedia('(orientation: landscape)')
    const narrow = window.matchMedia('(max-width: 767px)')

    landscape.addEventListener('change', update)
    narrow.addEventListener('change', update)
    window.addEventListener('resize', update)

    return () => {
      landscape.removeEventListener('change', update)
      narrow.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <OrientationContext.Provider value={state}>
      {children}
    </OrientationContext.Provider>
  )
}

function computeOrientation(): OrientationState {
  if (typeof window === 'undefined') {
    return {
      isLandscape: false,
      isNarrow: false,
      isMobileLandscape: false,
      isMobilePortrait: false,
    }
  }
  const isLandscape = window.matchMedia('(orientation: landscape)').matches
  const isNarrow = window.matchMedia('(max-width: 767px)').matches
  return {
    isLandscape,
    isNarrow,
    isMobileLandscape: isNarrow && isLandscape,
    isMobilePortrait: isNarrow && !isLandscape,
  }
}
