import { useContext } from 'react';
import { MicrogridContext } from './microgridProvider';
import { MicrogridState } from '../interfaces/microgridContextTypes';

export const useMicrogrid = (): MicrogridState => {
	const microgridState = useContext(MicrogridContext);
	if (microgridState === undefined) {
		throw new Error('useMicrogrid must be used within a MicrogridProvider');
	}
	return microgridState;
};
