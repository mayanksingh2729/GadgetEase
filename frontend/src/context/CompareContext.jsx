import React, { createContext, useContext, useState, useCallback } from "react";
import { showWarning } from "../components/ToastMessage";

const CompareContext = createContext();

export const useCompareContext = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("compareItems")) || [];
    } catch { return []; }
  });

  const save = (items) => {
    setCompareItems(items);
    localStorage.setItem("compareItems", JSON.stringify(items));
  };

  const addToCompare = useCallback((product) => {
    setCompareItems((prev) => {
      if (prev.find((p) => p._id === product._id)) return prev;
      if (prev.length >= 3) {
        showWarning("You can compare up to 3 products at a time");
        return prev;
      }
      const updated = [...prev, product];
      localStorage.setItem("compareItems", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromCompare = useCallback((productId) => {
    setCompareItems((prev) => {
      const updated = prev.filter((p) => p._id !== productId);
      localStorage.setItem("compareItems", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearCompare = useCallback(() => {
    save([]);
  }, []);

  const isInCompare = useCallback((productId) => {
    return compareItems.some((p) => p._id === productId);
  }, [compareItems]);

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
