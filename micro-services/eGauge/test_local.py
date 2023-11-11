#This is based off the test_local.py file from the eGauge repo

import os
import sys
from datetime import datetime

from egauge import webapi
# import test_common

from egauge.webapi.device import Local
from egauge.webapi.device.physical_quantity import PhysicalQuantity
from typing import List

meter_dev = os.getenv("EGDEV", "http://egauge18646.egaug.es")
meter_user = os.getenv("EGUSR", "ppridge1")
meter_password = os.getenv("EGPWD", "ppridge")

dev = webapi.device.Device(
    meter_dev, webapi.JWTAuth(meter_user, meter_password)
)

def format_measurements(sensor_name: str, pq_list: List[PhysicalQuantity]):
    """Format a SENSOR_NAME and a list of physical quantities PQ_LIST such
    that each has a fixed width of 18 characters.
    """
    ret = f"{sensor_name:18s}"
    for pq in pq_list:
        formatted = f"{pq.value:14.3f} {pq.unit}"
        if len(formatted) < 18:
            formatted = (18 - len(formatted)) * " " + formatted
        ret += formatted
    return ret

# Request values for all available sensors: built-in environmental
# sensors, all line inputs, and all sensors.  Note that, except for
# environmental sensors, sensor values are measured only if there is
# at least one register using it.  Thus, you may need to configure
# some registers to see the desired sensors.
sensors = ["env=all", "l=all", "s=all"]

# Request all available sections: the sensor values themselves as well
# as derived real energy and apparent energy sections.
sections = [Local.SECTION_VALUES, Local.SECTION_ENERGY, Local.SECTION_APPARENT]

# Request all available metrics for each sensor/energy: the rate
# (e.g., power), the accumulated value (e.g., energy), as well as the
# sensor's type (physical unit).
metrics = [Local.METRIC_RATE, Local.METRIC_CUMUL, Local.METRIC_TYPE]

# Request all available sensor measurements: normal (RMS value), mean,
# and frequency:
measurements = ["normal", "mean", "freq"]

query_string = "&".join(sensors + sections + metrics + measurements)

# Fetch the sensor values from the meter:
local = Local(dev, query_string)

# Now output them to the terminal:

dt = datetime.fromtimestamp(round(local.ts()))
print(f"\nMeasuremets as of {dt.strftime('%Y-%m-%d %H:%M:%S')} (meter time)\n")



row = local.row(Local.METRIC_RATE, section=Local.SECTION_ENERGY)
for sensor in sorted(row):
    pq = row.pq_rate(sensor)
    line = format_measurements(sensor, [pq])
    print("      " + line)

print("\n    Value:")

row = local.row(Local.METRIC_CUMUL, section=Local.SECTION_ENERGY)
for sensor in sorted(row):
    pq = row.pq_accu(sensor)
    line = format_measurements(sensor, [pq])
    print("      " + line)


