import { Button } from 'antd';
import { Link } from 'react-router-dom';

const Page404 = () => {
	return (
		<div className="flex justify-center w-full h-full items-center flex-col">
			<span className='mb-4 text-2xl font-extrabold'>
				Page Not Found
			</span>
			<Button>
				<Link to="/">
					Click to Return to Dash Board
				</Link>
			</Button>
		</div>
	);
};

export default Page404;
