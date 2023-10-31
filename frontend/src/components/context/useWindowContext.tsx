import { useContext } from 'react';
import { WindowSizeContextProps } from '../microgridTypes';
import { WindowSizeContext } from './windowContext';

export const useWindow = (): WindowSizeContextProps => {
  const windowState = useContext(WindowSizeContext);
  if (windowState === undefined) {
    throw new Error('useWindowContext must be used within a WindowProvider');
  }
  return windowState;
};
