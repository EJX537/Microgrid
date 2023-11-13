const DeviceManagement = () => {
	return (
		<div className="w-full h-full p-4 flex flex-col">
			<div className="w-full flex flex-row justify-evenly">
				<div className="flex border w-full mx-4 p-4 bg-green-200 rounded-xl h-32">
					<div className="flex flex-col gap-2">
						<h1 className="text-base font-semibold">Device Active</h1>
						<h2 className="flex gap-2 text-gray-700">
							<span className="bg-green-500 h-5 w-5 rounded-sm block" />
							<span>
								Running
							</span>
							<span>
								- 2
							</span>
						</h2>
						<h2 className="flex gap-2 text-gray-700">
							<span className="bg-red-500 h-5 w-5 rounded-sm block" />
							<span>
								Offline
							</span>
							<span>
								- 0
							</span>
						</h2>
					</div>
				</div>
				<div className="flex border w-full mx-4 p-4 bg-green-200 rounded-xl h-32">
					<div className="flex flex-col gap-1">
						<h1 className="text-base font-semibold">Device Status</h1>
						<h2 className="flex gap-2 text-gray-700">
							<span className="bg-green-500 h-5 w-5 rounded-sm block" />
							<span>
								Normal
							</span>
							<span>
								- 2
							</span>
						</h2>
						<h2 className="flex gap-2 text-gray-700">
							<span className="bg-yellow-500 h-5 w-5 rounded-sm block" />
							<span>
								Warning
							</span>
							<span>
								- 0
							</span>
						</h2>
						<h2 className="flex gap-2 text-gray-700">
							<span className="bg-red-500 h-5 w-5 rounded-sm block" />
							<span>
								Critical
							</span>
							<span>
								- 0
							</span>
						</h2>
					</div>
				</div>
			</div>
			<div className="w-full p-4 flex flex-wrap justify-start items-start gap-2">
				<div className="border p-4 rounded-md h-72 w-64 flex flex-col items-center">
					<div className="bg-blue-400 h-1/3 aspect-square rounded-full flex justify-center text-white text-7xl">+</div>
					<h1 className="mt-4 text-lg text-gray-600">Enroll Device</h1>
				</div>
				<div className="border p-4 rounded-md h-72 w-64 flex flex-col items-center">
					<div className="h-1/2 w-full flex justify-center items-center">
						<img src="" alt="" className="h-full w-1/2" />
					</div>
					<h1>Device Name</h1>
					<h2>Short Description</h2>
					<h2 className="mt-auto text-green-500">Status</h2>
				</div>
				<div className="border p-4 rounded-md h-72 w-64 flex flex-col items-center">
					<div className="h-1/2 w-full flex justify-center items-center">
						<img src="" alt="" className="h-full w-1/2" />
					</div>
					<h1>Device Name</h1>
					<h2>Short Description</h2>
					<h2 className="mt-auto text-green-500">Status</h2>
				</div>
			</div>
		</div>
	);
};

export default DeviceManagement;
