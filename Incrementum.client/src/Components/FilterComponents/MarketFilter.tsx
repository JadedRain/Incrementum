import React, { useEffect, useState } from "react";
import CategoryFilter from "./CategoricFilter";


const MarketFilter: React.FC = () => {
  return (
            <CategoryFilter categorys={["BUE", "VIE", "ASX", "BRU", "SAO", "CNQ", "NEO", "TOR", "VAN", "EBS", "SGO", "SHH", "SHZ", "BVC", "PRA", "BER", "DUS", "FRA", "GER", "HAM", "MUN", "STU", "CPH", "TAL", "CAI", "MCE", "HEL", "PAR", "AQS", "IOB", "LSE", "ATH", "HKG", "BUD", "JKT", "ISE", "TLV", "BSE", "NSI", "ICE", "MIL", "FKA", "JPX", "SAP", "KOE", "KSC", "KUW", "LIT", "RIS", "MEX", "KLS", "AMS", "OSL", "NZE", "PHP", "PHS", "WSE", "LIS", "DOH", "BVB", "SAU", "STO", "SES", "EBS", "SET", "IST","TAI", "TWO","ASE", "BTS", "CXI", "NCM", "NGM", "NMS", "NYQ", "OEM", "OQB", "OQX", "PCX", "PNK", "YHD","CCS","JNB"]} category="Exchange" displayName = "Exchange"/>
  );
};

export default MarketFilter;