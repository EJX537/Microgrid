import React from 'react';
import { Widget, WidgetComponent } from '../interfaces/JSXTypes';

interface WidgetLayoutProps {
	widgets: React.ReactElement<Widget, WidgetComponent>[];
	className?: string;
}

const WidgetLayout: React.FC<WidgetLayoutProps> = ({ widgets, className = 'col-start-1 col-span-full' }) => {
	return (
		<div className={`${className} h-[500px] rounded-lg col-span-full shadow-sm flex flex-col p-4 justify-evenly pointer-events-none transition-all duration-300 ease-in-out transform group`}>
			{
				widgets.map((widget, index) => (
					<React.Fragment key={index}>
						{widget}
					</React.Fragment>
				))
			}
		</div>
	);
};

export default WidgetLayout;
