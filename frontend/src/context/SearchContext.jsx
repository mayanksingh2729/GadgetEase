import React, { createContext, useContext, useState, useCallback } from "react";
import API from "../api/axiosInstance";

const SearchContext = createContext();

export const useSearchContext = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const performSearch = useCallback(async (query, page = 1) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearchQuery("");
      setCurrentPage(1);
      setTotalPages(1);
      setTotal(0);
      return;
    }

    setSearchLoading(true);
    setSearchQuery(query);
    try {
      const { data } = await API.get(`/products/search?q=${encodeURIComponent(query.trim())}&page=${page}&limit=12`);
      setSearchResults(data.products);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotal(0);
  }, []);

  return (
    <SearchContext.Provider value={{
      searchQuery, searchResults, searchLoading,
      currentPage, totalPages, total,
      performSearch, clearSearch, setSearchQuery,
    }}>
      {children}
    </SearchContext.Provider>
  );
};
