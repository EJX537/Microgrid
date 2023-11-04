import MicrogridProvider from './context/contextProvider';

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import {Core } from './layouts/index';

const App: React.FC = () => {
	return (
		<Router>
			<MicrogridProvider>
				<Core />
			</MicrogridProvider>
		</Router>
	);
};

export default App;
