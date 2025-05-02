import { AnyRoute,Router, type RouterEvents } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';


export const useExtendedRouter = (baseRouter: Router<AnyRoute, any, any>) => {
  // Use useMemo to ensure the router is cloned only once
  const extendedRouter = useMemo(() => {
    console.log("Cloning base router...");

    return baseRouter; 
  }, [baseRouter]);

  useEffect(() => {
    console.log("Subscribing to router events...");
    const unsubscribe = extendedRouter.subscribe('onBeforeNavigate', (event: RouterEvents['onBeforeNavigate']) => {
      const { fromLocation, toLocation } = event;
      console.log(`[Router] Navigating from ${fromLocation?.pathname ?? 'N/A'} to ${toLocation.pathname}`);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("Unsubscribing from router events...");
      unsubscribe();
    };
  }, [extendedRouter]); // Re-run effect if the router instance changes

  return extendedRouter;
}