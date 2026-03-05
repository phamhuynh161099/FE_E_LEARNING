// https://claude.ai/chat/a9f06c55-7bf2-41ed-9de7-2e0164397b87
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

type ParamValue = string | string[] | null;

export function useQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get a param (returns string, string[], or null)
  const getParam = useCallback(
    (key: string): ParamValue => {
      const values = searchParams.getAll(key);
      if (values.length === 0) return null;
      if (values.length === 1) return values[0];
      return values;
    },
    [searchParams]
  );

  // Set one or more params (merges with existing)
  const setParams = useCallback(
    (updates: Record<string, ParamValue>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        params.delete(key); // clear existing values for this key

        if (value === null) continue; // delete the param

        const values = Array.isArray(value) ? value : [value];
        values.forEach((v) => params.append(key, v));
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // Replace all params (wipes existing)
  const replaceParams = useCallback(
    (updates: Record<string, ParamValue>) => {
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(updates)) {
        if (value === null) continue;
        const values = Array.isArray(value) ? value : [value];
        values.forEach((v) => params.append(key, v));
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  // Remove specific param keys
  const removeParams = useCallback(
    (...keys: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      keys.forEach((k) => params.delete(k));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return { getParam, setParams, replaceParams, removeParams, searchParams };
}