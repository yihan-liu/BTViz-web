// src/hooks/useDailyCounts.ts
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection, query, orderBy, startAt, endAt,
  getDocs, documentId
} from "firebase/firestore";
import { subDays, format } from "date-fns";
import { db } from "@/app/utils/firebaseConfig";

interface Row { date: string; count: number }

const CACHE_KEY = "dailyCountsCache";
const ONE_DAY   = 86_400_000;                              // 24 h ms
const buildZeroRows = (): Row[] =>
  Array.from({ length: 30 }, (_, i) => ({
    // oldest first so Firestore startAt/endAt work as written
    date: format(subDays(new Date(), 29 - i), "yyyy-MM-dd"),
    count: 0,
  }));

export default function useDailyCounts(): Row[] {
  /* scaffold */
  console.log("[hook] zeroRows built");
    const zeroRows = useMemo(buildZeroRows, []);

  /* ---------- lazy-init state ---------- */
  const [rows, setRows] = useState<Row[]>(() => {
    console.log("[hook] lazy init");
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(CACHE_KEY);
    console.log("[hook] cache raw =", raw);
    try {
      const cached = JSON.parse(raw ?? "null");
      if (cached) {
        console.log(
          "[hook] cache age",
          (Date.now() - Date.parse(cached.when)) / 1e3,
          "sec"
        );
      }
      if (cached && Date.now() - Date.parse(cached.when) < ONE_DAY) {
        console.log("[hook] using cached rows");
        return cached.rows;
      }
    } catch (e) {
      console.warn("[hook] cache parse error", e);
    }
    console.log("[hook] no cache → zeroRows");
    return null;
  });

  /* ---------- side-effect ---------- */
  useEffect(() => {
    console.log("[hook] useEffect ran (first paint OK)");
    const fetchRows = async () => {
      console.log("[hook] fetching from Firestore …");
      try {
        const snap = await getDocs(
          query(
            collection(db, "dailyCounts"),
            orderBy(documentId()),
            startAt(zeroRows[0].date),
            endAt(zeroRows[29].date)
          )
        );
        console.log("[hook] docs size =", snap.size);

        const lookup: Record<string, number> = {};
        snap.forEach((d) => {
          console.log("[hook] doc", d.id, d.data());
          lookup[d.id] = (d.data() as any).cnt ?? 0;
        });

        const fresh = zeroRows.map((r) => ({
          ...r,
          count: lookup[r.date] || 0,
        }));
        console.log("[hook] fresh rows", fresh);
        setRows(fresh);

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ when: new Date().toISOString(), rows: fresh })
        );
        console.log("[hook] cache updated");
      } catch (err) {
        console.error("[hook] Firestore error", err);
      }
    };

    fetchRows();
  }, [zeroRows]);

  console.log("[hook] returning rows", rows);
  return rows;
}


