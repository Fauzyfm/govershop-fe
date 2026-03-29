"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SearchContextType {
    search: string;
    setSearch: (value: string) => void;
    isHomePage: boolean;
    setIsHomePage: (value: boolean) => void;
}

const SearchContext = createContext<SearchContextType>({
    search: "",
    setSearch: () => {},
    isHomePage: false,
    setIsHomePage: () => {},
});

export function SearchProvider({ children }: { children: ReactNode }) {
    const [search, setSearch] = useState("");
    const [isHomePage, setIsHomePage] = useState(false);

    return (
        <SearchContext.Provider value={{ search, setSearch, isHomePage, setIsHomePage }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    return useContext(SearchContext);
}
