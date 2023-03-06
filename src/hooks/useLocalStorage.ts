import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

export default function useLocalStorage<T>(
  key: string,
  fallbackValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(fallbackValue);

  useEffect(() => {
    const valueStored: string = localStorage.getItem(key);
    setValue(valueStored ? (JSON.parse(valueStored) as T) : fallbackValue);
  }, [fallbackValue, key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
