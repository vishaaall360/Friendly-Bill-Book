export const DOCUMENT_THEMES = [
  {
    id: 'ember-red',
    name: 'Ember Red',
    description: 'Confident red with warm amber accents',
    theme: {
      primary: '#E53935',
      secondary: '#FF7043',
      accent: '#FFB300',
      dark: '#8E1B1B',
      background: '#FFF8F6',
      border: '#F2B8B5',
      tableHeader: '#E53935',
      total: '#8E1B1B',
      button: '#E53935',
      text: '#4A1C1C',
      headerText: '#FFFFFF',
      borderStyle: 'solid',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Clear blue with fresh cyan accents',
    theme: {
      primary: '#1976D2',
      secondary: '#29B6F6',
      accent: '#80DEEA',
      dark: '#0D47A1',
      background: '#F4FAFF',
      border: '#B6D7F5',
      tableHeader: '#1976D2',
      total: '#0D47A1',
      button: '#1976D2',
      text: '#123A5C',
      headerText: '#FFFFFF',
      borderStyle: 'solid',
    },
  },
  {
    id: 'sky-cyan',
    name: 'Sky Cyan',
    description: 'Bright cyan with airy light-blue accents',
    theme: {
      primary: '#00ACC1',
      secondary: '#4DD0E1',
      accent: '#B2EBF2',
      dark: '#006064',
      background: '#F5FCFD',
      border: '#A9E2E8',
      tableHeader: '#00ACC1',
      total: '#006064',
      button: '#00ACC1',
      text: '#164B52',
      headerText: '#FFFFFF',
      borderStyle: 'solid',
    },
  },
  {
    id: 'earth-green',
    name: 'Earth Green',
    description: 'Grounded green with soft natural accents',
    theme: {
      primary: '#558B2F',
      secondary: '#7CB342',
      accent: '#A5D66A',
      dark: '#33691E',
      background: '#F8FBF5',
      border: '#C7DDB7',
      tableHeader: '#558B2F',
      total: '#33691E',
      button: '#558B2F',
      text: '#304A22',
      headerText: '#FFFFFF',
      borderStyle: 'solid',
    },
  },
]

export const DEFAULT_DOCUMENT_THEME = DOCUMENT_THEMES[0]

export const getDocumentTheme = (themeId) => (
  DOCUMENT_THEMES.find((theme) => theme.id === themeId) || DEFAULT_DOCUMENT_THEME
)
