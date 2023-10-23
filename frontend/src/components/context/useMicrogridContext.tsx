import { useContext } from 'react';
import { MicrogridContext } from './contextProvider';
import { MicrogridState } from '../microgridTypes';

export const useResume = (): MicrogridState => {
  const microgridState = useContext(MicrogridContext);
  if (microgridState === undefined) {
    throw new Error('useMicrogrid must be used within a MicrogridProvider');
  }
  return microgridState;
};
