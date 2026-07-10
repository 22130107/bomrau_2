"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      if (val.trim()) {
        router.push(`/?q=${encodeURIComponent(val.trim())}`);
      } else {
        router.push("/");
      }
    }, 500); // 500ms debounce
  };

  return (
    <div className="w-full max-w-[600px] mx-auto mb-8 animate-fade-in-up">
      <div className="relative flex items-center bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-xl overflow-hidden focus-within:border-[rgb(251,191,36)] transition-colors shadow-lg">
        <input 
          type="text" 
          value={query}
          onChange={handleChange}
          placeholder="Tìm kiếm sản phẩm, pet tím, sàn đấu, chưởng..."
          className="w-full bg-transparent border-none outline-none text-white px-4 py-3 text-[14px]"
        />
        {query && (
          <button 
            onClick={() => {
              setQuery("");
              router.push("/");
            }}
            className="pr-4 text-[rgba(238,238,238,0.5)] hover:text-white"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
