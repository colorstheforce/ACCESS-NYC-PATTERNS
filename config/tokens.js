/**
 * Config
 */

const package = require('../package.json');

module.exports = {
  'output': '"./src/config/_tokens.scss"',
  'version': package.version,
  'cdn': '"https://cdn.jsdelivr.net/gh/CityOfNewYork/ACCESS-NYC-PATTERNS@v' + package.version + '/dist/"',
  'languages': ['default', 'ar', 'es', 'kr', 'ur', 'tc'],
  'rtl-languages': ['ar', 'ur'],
  'fonts': {
    'system': [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Oxygen-Sans',
      'Ubuntu',
      'Cantarell',
      '"Helvetica Neue"',
      'sans-serif'
    ],
    'default-sans': [
      '"Noto Sans"',
      'sans-serif'
    ],
    'default-serif': [
      '"Noto Serif"',
      'serif'
    ],
    'kr-sans': [
      '"Noto Sans CJK KR"',
      '"Noto Sans"',
      'sans-serif'
    ],
    'kr-serif': [
      '"Noto Sans CJK KR"',
      '"Noto Serif"',
      'serif'
    ],
    'tc-sans': [
      '"Noto Sans CJK TC"',
      '"Microsoft Yahei"',
      '"微软雅黑"',
      'STXihei',
      '"华文细黑"',
      '"Noto Sans"',
      'sans-serif'
    ],
    'tc-serif': [
      '"Noto Sans CJK TC"',
      '"Microsoft Yahei"',
      '"微软雅黑"',
      'STXihei',
      '"华文细黑"',
      '"Noto Serif"',
      'serif'
    ],
    'ar-sans': [
      '"Noto Naskh Arabic"',
      '"Noto Sans"',
      'sans-serif'
    ],
    'ar-serif': [
      '"Noto Naskh Arabic"',
      '"Noto Serif"',
      'serif'
    ],
    'ur-sans': [
      '"Noto Nastaliq Urdu"',
      '"Noto Sans"',
      'sans-serif'
    ],
    'ur-serif': [
      '"Noto Nastaliq Urdu"',
      '"Noto Serif"',
      'serif'
    ]
  },
  'font-weights': {
    'normal': 'normal',
    'bold': 'bold'
  },
  'em-base': 22,
  'font-sizes': {
    'font-size-xsmall': '0.54rem',
    'font-size-small': '0.72rem',
    'font-size-normal': '1rem',
    'font-size-medium': '1.09rem',
    'font-size-large': '1.25rem',
    'font-size-larger': '1.45rem',
    'font-size-largest': '1.81rem',
    'font-size-jumbo': '2.54rem',
    'font-size-print': '16px'
  },
  'leading': {
    'xsmall': '0.8',
    'small': '0.9',
    'normal': '1',
    'medium': '1.3',
    'large': '1.4',
    'larger': '1.5'
  },
  'colors': {
    'color-blue-light': '#E1EEFF',
    'color-blue-bright': '#118DF0',
    'color-blue': '#184E9E',
    'color-blue-dark': '#112E51',

    'color-yellow-light': '#FFE6A9',
    'color-yellow-access': '#FBB720',

    'color-green-light': '#D4FFE7',
    'color-green': '#05CE7C',
    'color-green-mid': '#0D6D3B',
    'color-green-dark': '#094727',

    'color-pink-light': '#F1B3bD',
    'color-pink': '#F1647C',
    'color-red': '#C6252b',

    'color-purple': '#4C2C92',

    'color-grey-light': '#D1D5D9',
    'color-grey-lightest': '#EEF3F7',
    'color-grey-mid': '#505C66',
    'color-grey-dark': '#172129',
    'color-black': '#000000',

    'color-white': '#ffffff',
    'color-transparent': 'rgba(255,255,255,0)',

    // https://en.wikipedia.org/wiki/New_York_City_Subway#Nomenclature
    'eighth-avenue': '#2850AD', // Vivid Blue, A C E
    'sixth-avenue': '#FF6319', // Bright Orange, B D F M
    'crosstown': '#6CBE45', // Lime Green, G
    'canarsie': '#A7A9AC', // Light Slate Grey, L
    'nassau': '#996633', // Terra Cotta Brown, J Z
    'broadway': '#FCCC0A', // Sunflower Yellow, N Q R W
    'broadway-seventh-avenue': '#EE352E', // Tomato Red, 1 2 3
    'lexington-avenue': '#00933C', // Apple Green, 4 5 6 6 Express
    'flushing': '#B933AD', // Raspberry, 7 7 Express
    'shuttles': '#808183' // Dark Slate Gray, S
  },
  'color-statuses': {
    'success': 'color-green-light',
    'info': 'color-blue-light',
    'warning': 'color-yellow-light',
    'urgent': 'color-pink-light'
  },
  'color-combinations': {
    'light-background': {
      'color': 'color-black',
      'headings': 'color-blue-dark',
      'color-alt': 'color-grey-mid',
      'hyperlinks': 'color-blue',
      'hyperlinks-underline': 'color-blue',
      'visited': 'color-purple',
      'hover': 'color-blue-dark',
      'background-color': 'color-white'
    },
    'mid-background': {
      'color': 'color-black',
      'headings': 'color-blue-dark',
      'color-alt': 'color-grey-mid',
      'hyperlinks': 'color-blue',
      'hyperlinks-underline': 'color-blue',
      'visited': 'color-purple',
      'hover': 'color-blue-dark',
      'background-color': 'color-grey-lightest'
    },
    'dark-background': {
      'color': 'color-white',
      'font-smooth': true,
      'headings': 'color-white',
      'color-alt': 'color-white',
      'hyperlinks': 'color-white',
      'hyperlinks-underline': 'color-white',
      'visited': 'color-white',
      'hover': 'color-white',
      'background-color': 'color-blue-dark'
    },
    'primary-button': {
      'color': 'color-white',
      'font-smooth': true,
      'background-color': 'color-blue'
    },
    'secondary-button': {
      'color': 'color-white',
      'font-smooth': true,
      'background-color': 'color-green-mid'
    }
  },
  'screens': {
    'screen-desktop': 960,
    'screen-tablet': 768,
    'screen-mobile': 480,
    'screen-sm-mobile': 400
  },
  'dimensions': {
    'grid-base': '8px',
    'spacing-base': '24px',
    'homepage-max-width': '800px',
    'site-max-width': '1200px',
    'site-margins': '24px',
    'site-margins-mobile': '16px',
    'site-min-width': '320px'
  },
  'animate': {
    'ease-in-quint': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
    'ease-out-quint': 'cubic-bezier(0.23, 1, 0.32, 1)',
    'animate-scss-speed': '0.75s',
    'animate-timing-function': 'cubic-bezier(0.23, 1, 0.32, 1)'
  },
  'border-widths': {
    0: '0',
    default: '1px',
    2: '2px',
    4: '4px',
    8: '8px'
  },
  'padding': {
    0: '0',
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px'
  },
  'margin': {
    0: '0',
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    auto: 'auto'
  },
  'icons': {
    // Logos
    'icon-logo-full': '180px 30px',
    'icon-logo-full--large': '270px 45px',
    'icon-logo-mark': '30px',
    'icon-logo-nyc': '48px 16px',
    // UI
    'icon-close': '20px',
    'icon-contact': '22px 20px',
    'icon-gear': '23px',
    'icon-minus': '32px 32px',
    'icon-plus': '32px 32px',
    'icon-screening': '30px',
    'icon-search': '16px',
    // Sizes weren't documented
    'icon-printer': '32px 32px',
    'icon-share': '32px 32px',
    'icon-eligibilitycheck': '32px 32px',
    'icon-checkmark': '32px 32px',
    'icon-arrow-down': '32px 32px',
    // Alert Icons
    'icon-info': '32px 32px',
    'icon-success': '32px 32px',
    'icon-urgent': '32px 32px',
    'icon-warning': '32px 32px',
    // Program Card Icons
    'icon-card-cash-expenses': '50px 50px',
    'icon-card-child-care': '50px 50px',
    'icon-card-city-id-card': '50px 50px',
    'icon-card-education': '50px 50px',
    'icon-card-enrichment': '50px 50px',
    'icon-card-expenses': '50px 50px',
    'icon-card-family-services': '50px 50px',
    'icon-card-food': '50px 50px',
    'icon-card-health': '50px 50px',
    'icon-card-housing': '50px 50px',
    'icon-card-people-with-disabilities': '50px 50px',
    'icon-card-work': '50px 50px',
    // Program Type Icons
    'icon-cash-expenses': '50px 50px',
    'icon-child-care': '50px 52px',
    'icon-city-id-card': '50px 50px',
    'icon-education': '50px 50px',
    'icon-enrichment': '50px 50px',
    'icon-family-services': '50px 50px',
    'icon-food': '50px 52px',
    'icon-health': '50px 50px',
    'icon-housing': '50px 50px',
    'icon-people-with-disabilities': '50px 50px',
    'icon-work': '50px 52px',
    // UI Icons
    'icon-ui-alert-octagon': '24px 24px',
    'icon-ui-alert-triangle': '24px 24px',
    'icon-ui-calendar': '24px 24px',
    'icon-ui-check-circle': '24px 24px',
    'icon-ui-check': '24px 24px',
    'icon-ui-chevron-down': '24px 24px',
    'icon-ui-chevron-left': '24px 24px',
    'icon-ui-chevron-right': '24px 24px',
    'icon-ui-chevron-up': '24px 24px',
    'icon-ui-info': '24px 24px',
    'icon-ui-mail': '24px 24px',
    'icon-ui-message-circle': '24px 24px',
    'icon-ui-minus-circle': '24px 24px',
    'icon-ui-plus-circle': '24px 24px',
    'icon-ui-printer': '24px 24px',
    'icon-ui-search': '24px 24px',
    'icon-ui-settings': '24px 24px',
    'icon-ui-user-check': '24px 24px',
    'icon-ui-x-circle': '24px 24px',
    'icon-ui-x': '24px 24px'
  },
  'icons-variants': [
    '--large'
  ],
  'icons-sizes': {
    '1': '8px 8px',
    '2': '16px 16px',
    '3': '24px 24px',
    '4': '32px 32px',
    '5': '40px 40px',
    '6': '48px 48px',
    '7': '56px 56px',
    '8': '64px 64px',
    '9': '72px 72px',
    '10': '80px 80px',
    '11': '88px 88px',
    '12': '96px 96px',
    'large': '136px 136px',
    'xlarge': '256px 256px'
  },
  'icons-program-category': [
    'icon-cash-expenses',
    'icon-child-care',
    'icon-city-id-card',
    'icon-education',
    'icon-enrichment',
    'icon-family-services',
    'icon-food',
    'icon-health',
    'icon-housing',
    'icon-people-with-disabilities',
    'icon-work'
  ],
  'icons-program-card': [
    'icon-card-cash-expenses',
    'icon-card-child-care',
    'icon-card-city-id-card',
    'icon-card-education',
    'icon-card-enrichment',
    'icon-card-expenses',
    'icon-card-family-services',
    'icon-card-food',
    'icon-card-health',
    'icon-card-housing',
    'icon-card-people-with-disabilities',
    'icon-card-work',
  ],
  'icons-checklist-size': '50px 50px',
  'icons-checklist': {
    'icon-application': '"headsup_application_25px-1.png"',
    'icon-badge': '"headsup_badge_30px-1.png"',
    'icon-calendar': '"headsup_calendar_25px-1.png"',
    'icon-flag': '"headsup_flag_30px-1.png"',
    'icon-generic': '"headsup_generic_30px-1.png"',
    'icon-check': '"icon-eligibilitycheck.png"'
  },
  'icons-logo': [
    'icon-logo-full',
    'icon-logo-full--large',
    'icon-logo-mark',
    'icon-logo-nyc',
  ],
  'icons-other': [
    'icon-close',
    'icon-contact',
    'icon-gear',
    'icon-minus',
    'icon-plus',
    'icon-screening',
    'icon-share',
    'icon-eligibilitycheck',
    'icon-checkmark',
    'icon-arrow-down',
    'icon-info',
    'icon-success',
    'icon-urgent',
    'icon-warning'
  ],
  'icons-ui': [
    'icon-ui-alert-octagon',
    'icon-ui-alert-triangle',
    'icon-ui-calendar',
    'icon-ui-check-circle',
    'icon-ui-check',
    'icon-ui-chevron-down',
    'icon-ui-chevron-left',
    'icon-ui-chevron-right',
    'icon-ui-chevron-up',
    'icon-ui-info',
    'icon-ui-mail',
    'icon-ui-message-circle',
    'icon-ui-minus-circle',
    'icon-ui-plus-circle',
    'icon-ui-printer',
    'icon-ui-search',
    'icon-ui-settings',
    'icon-ui-user-check',
    'icon-ui-x-circle',
    'icon-ui-x'
  ],
  'icons-subway': {
    'eighth-avenue': ['A', 'C', 'E'],
    'sixth-avenue': ['B', 'D', 'F', 'M'],
    'crosstown': ['G'],
    'canarsie': ['L'],
    'nassau': ['J', 'Z'],
    'broadway': ['N', 'Q', 'R', 'W'],
    'broadway-seventh-avenue': ['1', '2', '3'],
    'lexington-avenue': ['4', '5', '6', '6 Express'],
    'flushing': ['7', '7 Express'],
    'shuttles': ['S']
  },
  'inputs': {
    'checkbox-radius': '8px',
    'checkbox-size': '30px',
    'toggle-size': '25px'
  },
  'shadows': {
    'up': '0 3px 12px 2px rgba(0, 0, 0, 0.25)'
  }
};