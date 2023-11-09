import schedule
import time
import subprocess

def job(latitude, longitude):
	subprocess.call(["python3", "./weather.py", latitude, longitude])
		
def main():
	latitude = "36.97076"
	longitude = "-121.96891"

	# Schedule job every 12 hours
	schedule.every(12).hours.do(lambda: job(latitude, longitude))

	while True:
		schedule.run_pending()
		time.sleep(1)

if __name__ == "__main__":
	main()