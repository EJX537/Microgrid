import React, { createContext, useEffect, useState } from 'react';
import { ProviderProps, WindowSizeContextProps } from '../microgridTypes';

// Create the context
export const WindowSizeContext = createContext<WindowSizeContextProps>({
  width: window.innerWidth,
  height: window.innerHeight,
});

// Create the provider component
export const WindowSizeProvider: React.FC<ProviderProps> = ({ children }) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <WindowSizeContext.Provider value={windowSize}>
      {children}
    </WindowSizeContext.Provider>
  );
};

export default WindowSizeProvider;
