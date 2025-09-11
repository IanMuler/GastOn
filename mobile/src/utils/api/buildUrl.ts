import { ApiPaths } from '@/types/api';

/**
 * Builds a complete URL from a path and parameters
 * 
 * @param path - The API path with optional path parameters in {braces}
 * @param params - Parameters object containing path and query parameters
 * @param baseUrl - Base API URL (defaults to environment variable)
 * @returns Complete URL string
 * 
 * @example
 * buildUrl('/api/categories/{id}', { id: 1, limit: 10 })
 * // Returns: 'http://localhost:3000/api/categories/1?limit=10'
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const buildUrl = (
  path: keyof ApiPaths,
  params: Record<string, string | number | boolean | undefined> = {},
  baseUrl: string = API_BASE_URL
): string => {
  let finalPath = `${baseUrl}${path}`;
  const queryParams = { ...params };

  // Replace path parameters (e.g., {id} -> 123)
  const pathParamMatches = path.match(/{(\w+)}/g);
  if (pathParamMatches) {
    for (const match of pathParamMatches) {
      const paramKey = match.slice(1, -1); // Remove { and }
      if (queryParams[paramKey] !== undefined) {
        finalPath = finalPath.replace(
          match,
          encodeURIComponent(String(queryParams[paramKey]))
        );
        delete queryParams[paramKey];
      } else {
        // If path param is missing, remove the placeholder
        finalPath = finalPath.replace(match, '');
      }
    }
  }

  // Build query string from remaining parameters
  const queryString = Object.entries(queryParams)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => 
      `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return queryString ? `${finalPath}?${queryString}` : finalPath;
};