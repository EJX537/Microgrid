import React, {  Dispatch, ReactNode } from 'react';

export interface MicrogridState {
	user: string;
	setUser: Dispatch<React.SetStateAction<string>>;
}

export interface WindowSizeContextProps {
  width: number;
  height: number;
}

export interface ProviderProps {
	children: ReactNode;
}
