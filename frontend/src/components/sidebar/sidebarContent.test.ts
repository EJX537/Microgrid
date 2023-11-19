import { render, screen } from '@testing-library/react';
import SidebarContent from './sidebarContent';

test('renders Microgrid Manager text', () => {
  render(<SidebarContent collapsed={false} />);
  const contentElement = screen.getByText(/Microgrid Manager/i);
  expect(contentElement).toBeInTheDocument();
});