import React from 'react';
import CategoryFilter from "./CategoricFilter";


const RegionFilter: React.FC = () => {
  return (
    <CategoryFilter categorys={["ar", "at", "au", "be", "br", "ca", "ch", "cl", "cn", "co", "cz", "de", "dk", "ee", "eg", "es", "fi", "fr", "gb", "gr", "hk", "hu", "id", "ie", "il", "in", "is", "it", "jp", "kr", "kw", "lk", "lt", "lv", "mx", "my", "nl", "no", "nz", "pe", "ph", "pk", "pl", "pt", "qa", "ro", "ru", "sa", "se", "sg", "sr", "sw", "th", "tr", "tw", "us", "ve", "vn", "za"]} category="Region" displayName = "Region"/>
  );
};

export default RegionFilter;