export const helpSetFilters = (
  selected: string[], 
  sname: string, 
  setFilters: React.Dispatch<React.SetStateAction<{filter_name: string, value: string}[]>>
) => {            
  setFilters(prevFilters => {
    const newFilters = [...prevFilters];
    const filtersValues = prevFilters.map(p => p.value);
    for (const p of selected) {
      if (!filtersValues.includes(p)) {
        newFilters.push({filter_name: sname, value: p});
      }
    }
    return newFilters;
  });
};