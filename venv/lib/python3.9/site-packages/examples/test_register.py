#!/usr/bin/env python3
#
# Copyright (c) 2023 eGauge Systems LLC
#
# See LICENSE file for details.
#
"""This test program demonstrates the use of class
egauge.webapi.device.Register to access the register data available
through the /register WebAPI.

When executed, it first fetches and outputs the current values (rates)
of each register.

Second, it calculates how much the registers have changed since the
start of the month and outputs the change both as the accrued value
and the average value since the beginning of the month.

Install egauge-python with a command of the form:

	pip install egauge-python[examples]

to ensure that pytz is installed on your system.

You can set environment variables:

	EGDEV - the URL of the meter to use (e.g., http://eGaugeXXX.local)
	EGUSR - the username to log in to the meter (e.g., "owner")
	EGPWD - the password for the username

Alternatively, you can edit examples/test_common.py to suit your needs.

"""

import argparse

from datetime import datetime

import pytz

import test_common

from egauge.webapi.device import Register, PhysicalQuantity, UnitSystem

parser = argparse.ArgumentParser(
    description="Demonstrate the use of class egauge.webapi.device.Register."
)
parser.add_argument(
    "--imperial",
    action="store_true",
    help="Output units in imperial units rather than metric units.",
)
args = parser.parse_args()

if args.imperial:
    PhysicalQuantity.set_unit_system(UnitSystem.IMPERIAL)

# Fetch the register data.  We want the current rates as well as the
# recorded rows for the current time ("now") and the start of
# the month ("som").
#
# The value for query parameter "rate" doesn't matter.  As long as
# that parameter is present, the rates will be included in the
# response.  We could set it to True or really anything else.  We use
# an empty string since that's the shortest possible value.
ret = Register(test_common.dev, {"rate": "", "time": "now,som"})

# Print the current time of the meter in human-readable form:
dt = datetime.fromtimestamp(round(ret.ts()), tz=pytz.utc)
time_str = dt.strftime("%Y-%m-%d %H:%M:%S")
print(f"\nRegister rates as of {time_str} (meter time):")

# Output the register rates, nicely formatted:
for regname in ret.regs:
    line = f"  {regname}"
    if len(line) < 32:
        line += (32 - len(line)) * " "
    rate = ret.pq_rate(regname)
    line += f" {rate.value:12.3f} {rate.unit}"
    print(line)

# Calculate the amount by which the registers changed between the two
# data rows (now and the start of the month):
delta = ret[0] - ret[1]

dt = datetime.fromtimestamp(round(ret[1].ts), tz=pytz.utc)
time_str = dt.strftime("%Y-%m-%d %H:%M:%S")
print(f"\nRegister change since {time_str} (start of month in meter time):")
print(34 * " " + f"{'Accumulated':18s}" + 14 * " " + "Average")

# Output the changes since the start of the month:
for regname in delta.regs:
    line = f"  {regname}"
    if len(line) < 32:
        line += (32 - len(line)) * " "

    accu = delta.pq_accu(regname)
    line += f" {accu.value:12.3f} {accu.unit}"

    if len(line) < 60:
        line += (60 - len(line)) * " "

    avg = delta.pq_avg(regname)
    line += f" {avg.value:12.3f} {avg.unit}"
    print(line)
