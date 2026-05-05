import { useState } from "react";

export function useFilters() {
  const [marketFilter, setMarketFilter] = useState("1X2");
  const [leagueFilter, setLeagueFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("TODAY_TOMORROW");
  const [minValue, setMinValue] = useState(0.1);
  const [minOdd, setMinOdd] = useState(1.5);

  return {
    marketFilter,
    setMarketFilter,
    leagueFilter,
    setLeagueFilter,
    dateFilter,
    setDateFilter,
    minValue,
    setMinValue,
    minOdd,
    setMinOdd,
  };
}