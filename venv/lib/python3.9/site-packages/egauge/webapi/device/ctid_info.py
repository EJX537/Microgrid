#
# Copyright (c) 2020-2021 eGauge Systems LLC
#       1644 Conestoga St, Suite 2
#       Boulder, CO 80301
#       voice: 720-545-9767
#       email: davidm@egauge.net
#
# All rights reserved.
#
# MIT License
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
"""This module provides access to the eGauge WebAPI's /api/ctid
service."""

import datetime
import os
import secrets
import time

from egauge import ctid
from egauge import webapi

from ..error import Error

SCAN_TIMEOUT = 2.5  # scan timeout in seconds


def ctid_info_to_table(reply):
    """Convert a ctid service REPLY to a CTid table."""
    t = ctid.Table()
    t.version = reply.get("version")
    t.mfg_id = reply.get("mfgid")
    t.model = reply.get("model")
    t.serial_number = reply.get("sn")
    t.sensor_type = reply.get("k")
    t.r_source = reply.get("rsrc")
    t.r_load = reply.get("rload")

    params = reply.get("params", {})
    t.size = params.get("size")
    t.rated_current = params.get("i")
    t.voltage_at_rated_current = params.get("v")
    t.phase_at_rated_current = params.get("a")
    t.voltage_temp_coeff = params.get("tv")
    t.phase_temp_coeff = params.get("ta")
    t.cal_table = {}
    cal_table = params.get("cal", {})
    for l_str in cal_table:
        l = float(l_str)
        t.cal_table[l] = [
            cal_table[l_str].get("v", 0),
            cal_table[l_str].get("a", 0),
        ]
    t.bias_voltage = params.get("bias_voltage", 0)
    t.scale = params.get("scale")
    t.offset = params.get("offset")
    t.delay = params.get("delay")
    t.threshold = params.get("threshold")
    t.hysteresis = params.get("hysteresis")
    t.debouce_time = params.get("debounce_time")
    t.edge_mask = params.get("edge_mask")
    t.ntc_a = params.get("ntc_a")
    t.ntc_b = params.get("ntc_b")
    t.ntc_c = params.get("ntc_c")
    t.ntc_m = params.get("ntc_m")
    t.ntc_n = params.get("ntc_n")
    t.ntc_k = params.get("ntc_k")
    return t


class CTidInfoError(Error):
    """Raised if for any CTid info related errors."""


class PortInfo:
    """Encapsulates the port number on which a CTid table was read, the
    polarity which is was read with, and the table itself.

    """

    def __init__(self, port, polarity, table):
        self.port = port
        self.polarity = polarity
        self.table = table

    def port_name(self):
        """Return the canonical port name."""
        return "S%d" % self.port

    def short_mfg_name(self):
        """Return the short (concise) name of the manufacturer of the sensor
        or `-' if unknown.

        """
        if self.table is None or self.table.mfg_id is None:
            return "-"
        return ctid.mfg_short_name(self.table.mfg_id)

    def model_name(self):
        """Return the model name of the sensor attached to the port.  If
        unknown `-' is returned.

        """
        if self.table is None or self.table.model is None:
            return "-"
        return self.table.model

    def mfg_model_name(self):
        """Return a "fully qualified" model name, which consists of the short
        version of the manufacter's name, a dash, and the model
        name.

        """
        return "%s-%s" % (self.short_mfg_name(), self.model_name())

    def sn(self):
        """Return the serial number or None if unknown."""
        if self.table is None or self.table.serial_number is None:
            return None
        return self.table.serial_number

    def serial_number(self):
        """Return the serial number of the sensor attached to the port as a
        decimal string.  If unknown, '-' is returned.

        """
        if self.table is None or self.table.serial_number is None:
            return "-"
        return str(self.table.serial_number)

    def unique_name(self):
        """Return a sensor's unique name, which is a string consisting of the
        manufacturer's short name, the model name, and the serial
        number, all separated by dashes..

        """
        return "%s-%s" % (self.mfg_model_name(), self.serial_number())

    def sensor_type(self):
        """Return the sensor type of the sensor attached to the port or None
        if unknown.

        """
        if self.table is None or self.table.sensor_type is None:
            return None
        return self.table.sensor_type

    def sensor_type_name(self):
        """Return the name of the sensor type of the sensor attached to the
        port or '-' if unknown.

        """
        st = self.sensor_type()
        if st is None:
            return "-"
        return ctid.get_sensor_type_name(st)

    def as_dict(self):
        """Return CTid info as a serializable dictionary."""
        if self.table is None:
            return None
        params = {}
        p = {
            "port": self.port,
            "polarity": self.polarity,
            "version": self.table.version,
            "mfgid": self.table.mfg_id,
            "model": self.table.model,
            "sn": self.table.serial_number,
            "k": self.table.sensor_type,
            "rsrc": self.table.r_source,
            "rload": self.table.r_load,
            "params": params,
        }
        if self.table.sensor_type in [
            ctid.SENSOR_TYPE_AC,
            ctid.SENSOR_TYPE_DC,
            ctid.SENSOR_TYPE_RC,
        ]:
            params["size"] = self.table.size
            params["i"] = self.table.rated_current
            params["v"] = self.table.voltage_at_rated_current
            params["a"] = self.table.phase_at_rated_current
            params["tv"] = self.table.voltage_temp_coeff
            params["ta"] = self.table.phase_temp_coeff
            params["bias_voltage"] = self.table.bias_voltage
            cal_table = {}
            for l, row in self.table.cal_table.items():
                cal_table[l] = {"v": row[0], "a": row[1]}
            params["cal"] = cal_table
        elif self.table.sensor_type == ctid.SENSOR_TYPE_VOLTAGE:
            params["scale"] = self.table.scale
            params["offset"] = self.table.offset
            params["delay"] = self.table.delay
        elif self.table.sensor_type == ctid.SENSOR_TYPE_TEMP_LINEAR:
            params["scale"] = self.table.scale
            params["offset"] = self.table.offset
        elif self.table.sensor_type == ctid.SENSOR_TYPE_TEMP_NTC:
            params["ntc_a"] = self.table.ntc_a
            params["ntc_b"] = self.table.ntc_b
            params["ntc_c"] = self.table.ntc_c
            params["ntc_m"] = self.table.ntc_m
            params["ntc_n"] = self.table.ntc_n
            params["ntc_k"] = self.table.ntc_k
        elif self.table.sensor_type == ctid.SENSOR_TYPE_PULSE:
            params["threshold"] = self.table.threshold
            params["hysteresis"] = self.table.hysteresys
            params["debounce_time"] = self.table.debounce_time
            params["edge_mask"] = self.table.edge_mask
        return p

    def __str__(self):
        return "(port=%d,polarity=%s,table=%s)" % (
            self.port,
            self.polarity,
            self.table,
        )


class CTidInfo:
    def __init__(self, dev):
        """Create an object which can be used to access the CTid service of
        device DEV.  The service allows reading CTid info from a
        particular port, scan for such info, flash the attached
        sensor's indicator LED, or iterate over all the ports with
        CTid information.

        """
        self.dev = dev
        self.tid = None
        self.info = None
        self.index = None
        self.polarity = None
        self.port_number = None

    def _make_tid(self):
        """Create a random transaction ID."""
        self.tid = secrets.randbits(32)
        if self.tid < 1:
            self.tid += 1

    def stop(self):
        """Stop pending CTid operation, if any."""
        if self.tid is not None:
            self.dev.post("/ctid/stop", {})
        self.tid = None

    def scan_start(self, port_number, polarity):
        """Initiate a CTid scan of PORT_NUMBER with POLARITY.  POLARITY must
        be either "+" or "-".

        """
        if port_number < 1:
            raise CTidInfoError("Invalid port number.", port_number)
        if self.tid is not None:
            self.stop()
        self._make_tid()
        self.polarity = polarity
        self.port_number = port_number
        data = {"op": "scan", "tid": self.tid, "polarity": polarity}
        resource = "/ctid/%d" % port_number
        last_e = None
        for _ in range(3):
            try:
                reply = self.dev.post(resource, data)
                if reply.get("status") == "OK":
                    return
            except Error as e:
                last_e = e
        raise CTidInfoError(
            "Failed to initiate CTid scan", port_number, polarity
        ) from last_e

    def scan_result(self):
        """Attempt to read result from a CTid scan initiated with a call to
        scan_start().  If the result is not available, None is
        returned.  If None is returned, the caller should wait a
        little and then retry the request again for up to SCAN_TIMEOUT
        seconds.

        """
        resource = "/ctid/%d" % self.port_number
        reply = self.dev.get(resource, params={"tid": self.tid})
        if (
            reply.get("port") == self.port_number
            and reply.get("tid") == self.tid
        ):
            return PortInfo(
                self.port_number, self.polarity, ctid_info_to_table(reply)
            )
        return None

    def scan(self, port_number, polarity=None, timeout=SCAN_TIMEOUT):
        """Scan the CTid information from the sensor attached to the specified
        PORT_NUMBER and return a PortInfo object as a result.  If no
        CTid info could be read from the port, the returned object's
        table member will be None.  If POLARITY is unspecifed, normal
        (positive) polarity will be attempted first and, if that
        fails, negative polarity will be attempted second.  If
        POLARITY is specified, it should be '+' to scan with normal
        polarity only or '-' to scan with reversed polarity only.  If
        TIMEOUT is unspecified, the operation will time out after
        SCAN_TIMEOUT seconds.  Otherwise, TIMEOUT should be a positive
        number specifying the number of seconds after which to time
        out the operation.

        """
        polarity_list = ["+", "-"] if polarity is None else [polarity]
        for pol in polarity_list:
            self.scan_start(port_number, pol)

            start_time = datetime.datetime.now()
            while True:
                time.sleep(0.25)
                result = self.scan_result()
                if result is not None:
                    return result
                elapsed = (
                    datetime.datetime.now() - start_time
                ).total_seconds()
                if elapsed > timeout:
                    break
            self.stop()
        return PortInfo(port_number, None, None)

    def flash(self, port_number, polarity="-"):
        """Flash the indicator LED on the sensor attached to the specified
        PORT_NUMBER using the specified POLARITY.  Flashing will
        continue until stop() is called (or until a timeout occurs
        after about 30 minutes).

        """
        if port_number < 1:
            raise CTidInfoError("Invalid port number.", port_number)
        if self.tid is not None:
            self.stop()
        self._make_tid()
        data = {"op": "flash", "tid": self.tid, "polarity": polarity}
        resource = "/ctid/%d" % port_number
        for _ in range(3):
            try:
                reply = self.dev.post(resource, data)
                if reply.get("status") == "OK":
                    break
            except Error:
                pass

    def delete(self, port_number):
        """Delete the CTid information stored for the specified port
        number.

        """
        if port_number < 1:
            raise CTidInfoError("Invalid port number.", port_number)
        resource = "/ctid/%d" % port_number
        reply = self.dev.delete(resource)
        if reply is None or reply.get("status") != "OK":
            reason = reply.get("error") if reply is not None else "timed out"
            raise CTidInfoError(
                "Failed to delete CTid info.", port_number, reason
            )

    def get(self, port_number):
        """Get the CTid information stored for the specified PORT_NUMBER (if
        any).

        """
        if port_number < 1:
            raise CTidInfoError("Invalid port number.", port_number)
        resource = "/ctid/%d" % port_number
        reply = self.dev.get(resource)
        if reply is None:
            raise CTidInfoError("Failed to read CTid info.", port_number)
        if len(reply) == 0:
            return None
        if reply.get("port") != port_number:
            raise CTidInfoError(
                "CTid info has incorrect port number.",
                reply.get("port"),
                port_number,
            )
        return PortInfo(
            port_number, reply.get("polarity"), ctid_info_to_table(reply)
        )

    def put(self, port_info):
        """Replace the existing CTid info with the one specified by PORT_INFO,
        which may be a single PortInfo() object or an array of
        PortInfo() objects.

        """
        if isinstance(port_info, list):
            resource = "/ctid"
            data = {"info": [pi.as_dict() for pi in port_info]}
        else:
            resource = "/ctid/%d" % port_info["port"]
            data = port_info.as_dict()
        reply = self.dev.put(resource, json_data=data)
        if reply is None:
            raise CTidInfoError("PUT of CTid info failed.")
        if reply.get("status") != "OK":
            raise CTidInfoError("Failure saving CTid info.", data, reply)

    def __iter__(self):
        """Iterate over all available CTid information."""
        reply = self.dev.get("/ctid")
        self.info = reply.get("info", [])
        self.index = 0
        return self

    def __next__(self):
        if self.index >= len(self.info):
            raise StopIteration
        info = self.info[self.index]
        t = ctid_info_to_table(info)
        self.index += 1
        return PortInfo(info["port"], info["polarity"], t)


if __name__ == "__main__":
    from . import device

    dut = os.getenv("EGAUGE_DUT") or "http://1608050004.lan"
    usr = os.getenv("EGAUGE_USR") or "owner"
    pwd = os.getenv("EGAUGE_PWD") or "default"
    ctid_info = CTidInfo(device.Device(dut, auth=webapi.JWTAuth(usr, pwd)))
    print("SCANNING")
    port_info = ctid_info.scan(port_number=3)
    print("  port_info[%d]" % port_info.port, port_info.table)
    print("-" * 40)
    print("ITERATING")
    for t in ctid_info:
        print("  port %d%s:" % (t.port, t.polarity), t.table)

    print("DELETING")
    ctid_info.delete(port_number=3)
    port_info = ctid_info.get(port_number=3)
    if port_info is None:
        print("  no CTid info for port 3")
    else:
        print("  port_info[%d]" % port_info.port, port_info.table)

    print("FLASHING")
    ctid_info.flash(port_number=3)
    time.sleep(5)
    ctid_info.stop()
