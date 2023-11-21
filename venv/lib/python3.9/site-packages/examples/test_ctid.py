#!/usr/bin/env python3
#
# Copyright (c) 2023 eGauge Systems LLC
#
# See LICENSE file for details.
#
"""This test program demonstrates the use of class
egauge.webapi.device.CTidInfo to scan the information from a
CTid®-enabled sensor and/or to blink the locator LED on such a sensor.

Install egauge-python with a command of the form:

	pip install egauge-python[examples]

to ensure that the readchar module is installed on your system.

You can set environment variables:

	EGDEV - the URL of the meter to use (e.g., http://eGaugeXXX.local)
	EGUSR - the username to log in to the meter (e.g., "owner")
	EGPWD - the password for the username

Alternatively, you can edit examples/test_common.py to suit your needs.

"""

import sys

import readchar

import test_common

from egauge.webapi.device import CTidInfo, PortInfo


def ask_port():
    result = input("Port number (1-30): ")
    if result.startswith("q"):
        sys.exit(0)
    return int(result)


def print_port_info(port_info):
    port = port_info.port
    mfg = port_info.short_mfg_name()
    model = port_info.model_name()
    print(f"\tS{port}: {mfg} {model}")


ctid_info = CTidInfo(test_common.dev)
print("ports with existing CTid® info:")

for port_info in ctid_info:
    print_port_info(port_info)

port = None

while True:
    while port is None:
        port = ask_port()
    sys.stdout.write(
        "Press b (blink), s (scan), c (change port), d (delete), q (quit): "
    )
    sys.stdout.flush()
    ch = readchar.readchar()
    print()
    if ch == "s":
        print(f"  scanning port S{port}...")
        result = ctid_info.scan(port)
        if isinstance(result, PortInfo):
            if result.table:
                print("  detected sensor:")
                print_port_info(result)
            else:
                print("    no CTid® sensor detected")
        else:
            print(f" scan of port S{port} failed: {result}")
    elif ch == "b":
        print(f"  blinking port S{port}...")
        ctid_info.flash(port)
    elif ch == "c":
        port = None
    elif ch == "d":
        print(f"  deleting info saved for S{port}...")
        ctid_info.delete(port)
    elif ch == "q":
        print("Done.")
        break

ctid_info.stop()
