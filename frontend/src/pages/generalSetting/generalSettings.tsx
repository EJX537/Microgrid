const GeneralSetting = () => {
	return (
		<div className="flex flex-col p-4">
			<h1 className="w-full bg-yellow-400 p-2 mb-4 rounded-sm text-red-600">WORK IN PROGRESS</h1>
			<div className='border-t border-gray-200 h-0.5 my-2' />
			<div className="flex flex-row justify-between p-2 w-full">
				<div className="flex flex-col max-w-[60%] w-full">
					<h1 className="text-xl font-bold">
						Notification Settings
					</h1>
					<h2 className="ml-2 mt-2 text-gray-400">
						Set the device permission in order to access the device.
						<br />
						This is required to access the device and update permission.
					</h2>
				</div>
			</div>

			<div className='border-t border-gray-200 h-0.5 my-2' />

			<div className="flex flex-row justify-between p-2 w-full">
				<div className="flex flex-col max-w-[60%] w-full">
					<h1 className="text-xl font-bold">
						Clone Database
					</h1>
					<h2 className="ml-2 mt-2 text-gray-400">
						Link to the dashboard of the device.
					</h2>
				</div>
				<div className='mx-4 flex flex-col items-center gap-y-4 mr-4 max-w-[40%] w-full p-2'>

				</div>
			</div>
			<div className='border-t border-gray-200 h-0.5 my-2' />
			<div className="flex flex-row justify-between p-2 w-full">
				<div className="flex flex-col max-w-[60%] w-full">
					<h1 className="text-xl font-bold">
						Clear Database
					</h1>
					<h2 className="ml-2 mt-2 text-gray-400">
						If you want to stop or start the device, click the button to the side.
					</h2>
				</div>
				<div className='mx-4 flex flex-col items-center justify-center mr-4 max-w-[40%] w-full'>

				</div>
			</div>
			<div className='border-t border-gray-200 h-0.5 my-2' />
		</div>
	);
};

export default GeneralSetting;
