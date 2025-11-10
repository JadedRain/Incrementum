export type RangeFilter = { high: number | null; low: number | null };
type StringListFilter = string[] | null;
type NumberFilter = number | null;

type FilterValue = RangeFilter | StringListFilter | NumberFilter | string;
type FilterDict = Record<string, FilterValue>;

// --- Default filter templates ---
const defaultFilterTemplates: Record<string, FilterDict> = {
  "day_gainers": {
    "%change": 3,
    "category": ["us"],
    "MarketCapFilter": { high: null, low: 2000000000 },
    "shareprice": { high: null, low: 5 },
    "nowvolume": { high: null, low: 15000 },
    "sortValue": "percentchange",
    "sortBool": "false",

  },
  "day_losers": {
    "%change": -2.5,
    "region": ["us"],
    "MarketCapFilter": { high: null, low: 2000000000 },
    "shareprice": { high: null, low: 5 },
    "nowvolume": { high: null, low: 20000 },
    "sortValue": "percentchange",
    "sortBool": "true",
  },
  "most_actives": {
    "category": ["us"],
    "MarketCapFilter": { high: null, low: 2000000000 },
    "nowvolume": { high: null, low: 5000000 },
    "sortValue": "dayvolume",
    "sortBool": "false",
  },  
  "undervalued_growth_stocks": {
    "notimplemented": ["peratio.lasttwelvemonths", "pegratio_5y", "epsgrowth.lasttwelvemonths"],
    "peratio.lasttwelvemonths": {low: 0, high: 20},
    "pegratio_5y": {low: null, high: 1},
    "epsgrowth.lasttwelvemonths": {low: 25, high: null},
    "sortValue": "eodvolume",
    "sortBool": "false",
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