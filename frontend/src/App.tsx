import MicrogridProvider from './context/microgridProvider';

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import {CoreLayout } from './layouts/index';

const App: React.FC = () => {
	return (
		<Router>
			<MicrogridProvider>
				<CoreLayout />
			</MicrogridProvider>
		</Router>
	);
};

export default App;
