#!/usr/bin/env python3
#
# Copyright (c) 2023 eGauge Systems LLC
#
# See LICENSE file for details.
#
"""This test program demonstrates the use of class
egauge.webapi.device.Local to access the meter-local measurements
available through the /local WebAPI.  When executed, it fetches all
available sensor values and derived quantities and outputs them to to
the terminal.

You can set environment variables:

	EGDEV - the URL of the meter to use (e.g., http://eGaugeXXX.local)
	EGUSR - the username to log in to the meter (e.g., "owner")
	EGPWD - the password for the username

Alternatively, you can edit examples/test_common.py to suit your needs.
"""

from datetime import datetime

import test_common

from egauge.webapi.device import Local
from egauge.webapi.device.physical_quantity import PhysicalQuantity


def format_measurements(sensor_name: str, pq_list: list[PhysicalQuantity]):
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
local = Local(test_common.dev, query_string)

# Now output them to the terminal:

dt = datetime.fromtimestamp(round(local.ts()))
print(f"\nMeasuremets as of {dt.strftime('%Y-%m-%d %H:%M:%S')} (meter time)\n")

print(
    "  Sensors:\n    Rate:\n      "
    f"{'Sensor Name':18s}{'Normal (RMS)':>18s}{'Mean':>18s}{'Frequency':>18s}"
)

# First the sensor section:

normal = local.row(Local.METRIC_RATE)
mean = local.row(Local.METRIC_RATE, Local.MEASUREMENT_MEAN)
freq = local.row(Local.METRIC_RATE, Local.MEASUREMENT_FREQ)
all_sensors = sorted(set(normal) | set(mean) | set(freq))
for sensor in all_sensors:
    pq_n = pq_m = pq_f = None
    if sensor in normal:
        pq_n = normal.pq_rate(sensor)
    if sensor in mean:
        pq_m = mean.pq_rate(sensor)
    if sensor in freq:
        pq_f = freq.pq_rate(sensor)
    line = format_measurements(sensor, [pq_n, pq_m, pq_f])
    print("      " + line)

print("\n    Value:")

normal = local.row(Local.METRIC_CUMUL)
mean = local.row(Local.METRIC_CUMUL, Local.MEASUREMENT_MEAN)
freq = local.row(Local.METRIC_CUMUL, Local.MEASUREMENT_FREQ)
all_sensors = sorted(set(normal) | set(mean) | set(freq))
for sensor in all_sensors:
    pq_n = pq_m = pq_f = None
    if sensor in normal:
        pq_n = normal.pq_accu(sensor)
    if sensor in mean:
        pq_m = mean.pq_accu(sensor)
    if sensor in freq:
        pq_f = freq.pq_accu(sensor)
    line = format_measurements(sensor, [pq_n, pq_m, pq_f])
    print("      " + line)

# Second the real energy section:

print("\n  Energy:")

print("    Rate:")

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

# Third the apparent energy section:

print("\n  Apparent Energy:")

print("    Rate:")

row = local.row(Local.METRIC_RATE, section=Local.SECTION_APPARENT)
for sensor in sorted(row):
    pq = row.pq_rate(sensor)
    line = format_measurements(sensor, [pq])
    print("      " + line)

print("\n    Value:")

row = local.row(Local.METRIC_CUMUL, section=Local.SECTION_APPARENT)
for sensor in sorted(row):
    pq = row.pq_accu(sensor)
    line = format_measurements(sensor, [pq])
    print("      " + line)
