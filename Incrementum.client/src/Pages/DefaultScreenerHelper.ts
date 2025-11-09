type RangeFilter = { high: number | null; low: number | null };
type StringListFilter = string[] | null;
type NumberFilter = number | null;

type FilterValue = RangeFilter | StringListFilter | NumberFilter;
type FilterDict = Record<string, FilterValue>;

// --- Default filter templates ---
const defaultFilterTemplates: Record<string, FilterDict> = {
  "day_gainers": {
    "%change": 3,
    "category": ["us"],
    "MarketCapFilter": { high: null, low: 2000000000 },
    "shareprice": { high: null, low: 5 },
    "nowvolume": { high: null, low: 15000 },
  },
  "day_losers": {
    "%change": -2.5,
    "region": ["us"],
    "MarketCapFilter": { high: null, low: 2000000000 },
    "shareprice": { high: null, low: 5 },
    "nowvolume": { high: null, low: 20000 },
  },
  "most_actives": {
    "category": ["us"],
    "MarketCapFilter": { high: null, low: 2000000000 },
    "nowvolume": { high: null, low: 5000000 },
  },
};

// --- Helper function ---
export function getDefaultFilterDict(key: string): FilterDict | null {
    console.log("searching "+ key)
  if (key in defaultFilterTemplates) {
    console.log("getting "+ key)
    // Return a *new* cloned object to avoid shared state
    const template = defaultFilterTemplates[key];
    return structuredClone(template) as FilterDict;
  }

  // Fallback: return a minimal structure
  return null;
}