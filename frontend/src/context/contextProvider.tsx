import React, { createContext, useEffect, useState } from 'react';
import { MicrogridState, ProviderProps } from '../interfaces/microgridContextTypes';

export const MicrogridContext = createContext<MicrogridState | undefined>(undefined);

const MicrogridProvider: React.FC<ProviderProps> = ({ children }) => {
	const [user, setUser] = useState('root');

	const [collapsed, setCollapsed] = useState(JSON.parse(localStorage.getItem('collapsed') ?? 'false'));

	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	const toggleCollapsed = () => {
		setCollapsed(!collapsed);
		localStorage.setItem('collapsed', JSON.stringify(!collapsed));
	};

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
		<MicrogridContext.Provider
			value={{ user, setUser, collapsed, toggleCollapsed, windowSize }}>
			{children}
		</MicrogridContext.Provider>
	);
};

export default MicrogridProvider;
