import cache from 'memory-cache';

export const cached = async <T>(
  key: string,
  fn: () => Promise<T>,
  durationMs = 10 * 60 * 1000
): Promise<T> => {
  const cachedResult: Promise<T> | null = cache.get(key);
  if (cachedResult) {
    console.log(`[Cache] Cache hit for key: ${key}`);
    return cachedResult;
  } else {
    console.log(`[Cache] Cache miss for key: ${key}`);
    const result = fn();
    cache.put(key, result, durationMs);
    return result;
  }
};
