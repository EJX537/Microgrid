import React, { createContext, useState } from 'react';
import { MicrogridState, ProviderProps } from '../microgridTypes';

export const MicrogridContext = createContext<MicrogridState | undefined>(undefined);

const MicrogridProvider: React.FC<ProviderProps> = ({ children }) => {
  const [user, setUser] = useState('root');
  return (
    <MicrogridContext.Provider
      value={{ user, setUser }}>
      {children}
    </MicrogridContext.Provider>
  );
};

export default MicrogridProvider;
