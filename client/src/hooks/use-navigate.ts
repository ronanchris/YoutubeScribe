import { useCallback } from 'react';
import { useLocation } from 'wouter';

/**
 * A custom hook to provide navigation functionality
 * This wraps the useLocation hook from wouter to provide a simple navigate function
 */
export function useNavigate() {
  const [, setLocation] = useLocation();

  const navigate = useCallback((to: string) => {
    setLocation(to);
  }, [setLocation]);

  return navigate;
}