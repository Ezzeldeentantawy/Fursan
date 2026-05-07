/**
 * Icon Pack Dynamic Import Map
 *
 * Maps each iconType string to a lazy dynamic import function.
 * NEVER import these statically — always use the dynamic import
 * via IconRegistry to enable code splitting.
 */
export const ICON_PACK_MAP = {
  lucide: () => import('lucide-react'),
  fa:     () => import('react-icons/fa'),
  md:     () => import('react-icons/md'),
  io:     () => import('react-icons/io'),
  io5:    () => import('react-icons/io5'),
  bs:     () => import('react-icons/bs'),
  hi:     () => import('react-icons/hi'),
  hi2:    () => import('react-icons/hi2'),
  ai:     () => import('react-icons/ai'),
  fi:     () => import('react-icons/fi'),
  gi:     () => import('react-icons/gi'),
  ri:     () => import('react-icons/ri'),
  si:     () => import('react-icons/si'),
  ti:     () => import('react-icons/ti'),
  vsc:    () => import('react-icons/vsc'),
  tb:     () => import('react-icons/tb'),
  ci:     () => import('react-icons/ci'),
};

/**
 * Human-readable labels for each pack.
 */
export const PACK_LABELS = {
  lucide: 'Lucide',
  fa:     'Font Awesome',
  md:     'Material Design',
  io:     'Ion Icons 4',
  io5:    'Ion Icons 5',
  bs:     'Bootstrap',
  hi:     'Hero Icons',
  hi2:    'Hero Icons 2',
  ai:     'Ant Design',
  fi:     'Feather',
  gi:     'Game Icons',
  ri:     'Remix Icons',
  si:     'Simple Icons',
  ti:     'Typicons',
  vsc:    'VS Code Icons',
  tb:     'Tabler Icons',
  ci:     'Circum Icons',
};

/**
 * Naming prefix for each pack used to filter icon components
 * from the module namespace. Lucide uses PascalCase without prefix,
 * react-icons packs use a prefix (Fa, Md, Io, etc.).
 */
export const PACK_PREFIXES = {
  lucide: '',       // PascalCase component names, no prefix
  fa:  'Fa',
  md:  'Md',
  io:  'Io',
  io5: 'Io5',
  bs:  'Bs',
  hi:  'Hi',
  hi2: 'Hi2',
  ai:  'Ai',
  fi:  'Fi',
  gi:  'Gi',
  ri:  'Ri',
  si:  'Si',
  ti:  'Ti',
  vsc: 'Vsc',
  tb:  'Tb',
  ci:  'Ci',
};

/**
 * Packs shown as top-level tabs in the IconPicker.
 * Remaining packs are accessed via a "More" dropdown.
 */
export const POPULAR_PACKS = ['lucide', 'fa', 'md', 'io', 'bs', 'hi', 'ai', 'fi'];

/**
 * All known pack keys.
 */
export const ALL_PACKS = Object.keys(ICON_PACK_MAP);
