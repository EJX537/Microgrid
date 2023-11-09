interface DashboardLayoutProps {
	children: JSX.Element[];
}

// The way the dashboard is set up is that it is a grid of 12 columns.
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
	return (
		<div className='p-4 pt-6 h-full grid grid-cols-12 gap-2 w-full'>
			{children}
		</div>
	);
};

export default DashboardLayout;
