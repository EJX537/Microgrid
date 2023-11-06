import React, {  Dispatch, ReactNode } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export interface MicrogridState {
	user: string;
	setUser: Dispatch<React.SetStateAction<string>>;
	collapsed: boolean;
	toggleCollapsed: () => void;
	windowSize: WindowSize;
}

export interface ProviderProps {
	children: ReactNode;
}
