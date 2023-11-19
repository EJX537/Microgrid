import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import HeaderComponent from './header';
import MicrogridProvider from '../../context/microgridProvider';

describe('headerContent', () => {
	test('renders the component with default props', async () => {
		render(
			<MicrogridProvider>
				<HeaderComponent />
			</MicrogridProvider>
		);
		// Find the button
		const button = screen.getByTestId('collapse-button');
		expect(button).toBeInTheDocument();

		// Make sure that the correct icon is being displayed
		const notCollapseHeaderIcon = screen.getByTestId('Header-Icon-Not-Collapsed');
		expect(notCollapseHeaderIcon).toBeInTheDocument();
		
		await act(async () => {
			if (button) fireEvent.click(button);
		});
		
		const collapseHeaderIcon = screen.getByTestId('Header-Icon-Collapsed');
		expect(collapseHeaderIcon).toBeInTheDocument();
	});
});
