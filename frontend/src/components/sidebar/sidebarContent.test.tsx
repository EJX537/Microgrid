import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import SidebarContent from './sidebarContent';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useNavigate: jest.fn(),
}));

describe('SidebarContent', () => {
	test('renders the component with default props', async () => {
		await act(async () => {
			render(
				<BrowserRouter>
					<SidebarContent collapsed={false} />
				</BrowserRouter>
			);
		});

		// Assert that the component renders the Microgrid Manager text
		expect(screen.getByText('Microgrid Manager')).toBeInTheDocument();

		// Assert that the component renders the menu items
		expect(screen.getByText('Dashboard')).toBeInTheDocument();
		expect(screen.getByText('Sol-Ark')).toBeInTheDocument();
		expect(screen.getByText('eGauge')).toBeInTheDocument();
		expect(screen.getByText('Add Device')).toBeInTheDocument();
		expect(screen.getByText('Backup Cloud')).toBeInTheDocument();
		expect(screen.getByText('Log')).toBeInTheDocument();
		expect(screen.getByText('Settings')).toBeInTheDocument();
	});

	test('selects the active menu item based on the current pathname', async () => {
		render(
			<BrowserRouter>
				<SidebarContent collapsed={false} />
			</BrowserRouter>
		);

		await act(async () => {
			fireEvent.click(screen.getByText('Sol-Ark'));
		});

		// Assert that the 'Data View' menu item is selected
		expect(screen.getByText('Data View')).toBeInTheDocument();
	});

	test('calls navigate function when a menu item is clicked', async () => {
		const navigateMock = jest.fn();
		(useNavigate as jest.Mock).mockReturnValue(navigateMock);

		render(
			<BrowserRouter>
				<SidebarContent collapsed={false} />
			</BrowserRouter>
		);

		// Simulate a click on the 'Configure' menu item
		await act(async () => {
			fireEvent.click(screen.getByText('Sol-Ark'));
			fireEvent.click(screen.getByText('Configure'));
		});

		// Assert that the navigate function is called with the correct path
		expect(navigateMock).toHaveBeenCalledWith('/sol-ark/config');
	});
});
