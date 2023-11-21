#!/usr/bin/env python3
#
# Copyright (c) 2023 eGauge Systems LLC
#
# See LICENSE file for details.
#
"""This test program demonstrates the use of class
egauge.webapi.device.Capture to capture waveform data via the /capture
WebAPI.  When executed, it captures 34ms of waveform data for up to
the first three channels, then creates a timeplot of the data using
matplotlib.

Install egauge-python with a command of the form:

	pip install egauge-python[examples]

to ensure that matplotlib is installed on your system.

You can set environment variables:

	EGDEV - the URL of the meter to use (e.g., http://eGaugeXXX.local)
	EGUSR - the username to log in to the meter (e.g., "owner")
	EGPWD - the password for the username

Alternatively, you can edit examples/test_common.py to suit your needs.

"""

import sys

from matplotlib import pyplot

import test_common

from egauge.webapi.device import Capture, TriggerMode

cap = Capture(test_common.dev)
print(f"available channels: {cap.available_channels}")

# capture samples for (up to) the first three channels:
if len(cap.available_channels) < 1:
    print(
        "The meter has no channels configured - waveform cannot be acquired."
    )
    sys.exit(1)
elif len(cap.available_channels) > 3:
    cap.channels = cap.available_channels[0:3]
else:
    cap.channels = cap.available_channels

# these settings are only needed for triggered captures:
cap.trigger_mode = TriggerMode.RISING
cap.trigger_channel = "L1"
cap.trigger_level = 0
cap.pretrigger = 0.0083  # how many seconds of data to keep ahead of trigger
cap.trigger_timeout = 1  # number of seconds before auto triggering

data = cap.acquire(duration=0.034)

# show the trigger point sample (if any):
if data.trigger_point is None:
    print("Capture was auto-triggered.")
else:
    print(data.trigger_point)

# plot the data:
_, axis = pyplot.subplots()
for chan in cap.channels:
    axis.plot(data.samples[chan].ts, data.samples[chan].ys, label=chan)
    axis.set(
        xlabel="time [s]",
        ylabel="[" + cap.channel_unit(chan) + "]",
        title="captured waveform data",
    )
axis.grid()
pyplot.legend(loc="upper right")
print("Plotting the waveform - close the plot window when done")
pyplot.show()
