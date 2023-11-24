#
# Copyright (c) 2020, 2022-2023 eGauge Systems LLC
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
"""Module to provide access to a device's JSON WebAPI."""

from dataclasses import dataclass
from types import SimpleNamespace
from typing import List

from .. import json_api
from ..error import Error
from .virtual_register import VirtualRegister


class DeviceError(Error):
    """Raised if for device related errors."""


@dataclass
class ChannelInfo:
    chan: int  # the channel number
    unit: str  # the physical unit of the channel data


class Device:
    """This class provides access to an eGauge device's JSON WebAPI.
    See "Web API Design" document for details."""

    def __init__(self, dev_uri, auth=None, verify=True):
        """Return a device object that can be used to access the device a
        address DEV_URI.  An example DEV_URI would be
        "http://eGaugeHQ.egauge.io".  AUTH should be an authentication
        object that provides the credentials to access the device.
        Typically, this should be a JWTAuth object.  VERIFY can be set
        to False to turn off certificate verification.  It may also be
        set to the path of a file that holds the certificate the
        server should be validated against.

        """
        self.api_uri = dev_uri + "/api"
        self.auth = auth
        self._reg_info = None  # cached register info
        self._chan_info = None  # cached channel info
        self._verify = verify

    def get(self, resource, **kwargs):
        """Issue GET request for /api resource RESOURCE and return the parsed
        JSON data or None if the request failed or returned invalid
        JSON data.  Additional keyword arguments are passed on to
        requests.get().

        """
        if "verify" not in kwargs:
            kwargs["verify"] = self._verify
        return json_api.get(self.api_uri + resource, auth=self.auth, **kwargs)

    def put(self, resource, json_data, **kwargs):
        """Issue PUT request with JSON_DATA as body to /api resource RESOURCE
        and return parsed JSON reply or None if the request failed or
        returned invalid JSON data.  Additional keyword arguments are
        passed on to requests.put().

        """
        if "verify" not in kwargs:
            kwargs["verify"] = self._verify
        return json_api.put(
            self.api_uri + resource, json_data, auth=self.auth, **kwargs
        )

    def post(self, resource, json_data, **kwargs):
        """Issue POST request with JSON_DATA as body to /api resource RESOURCE
        and return parsed JSON reply or None if the request failed or
        returned invalid JSON data.  Additional keyword arguments are
        passed on to requests.post().

        """
        if "verify" not in kwargs:
            kwargs["verify"] = self._verify
        return json_api.post(
            self.api_uri + resource, json_data, auth=self.auth, **kwargs
        )

    def delete(self, resource, **kwargs):
        """Issue DELETE request for /api resource RESOURCE and return parsed
        JSON reply or None if the request failed or returned invalid
        JSON data.  Additional keyword arguments are passed on to
        requests.post().

        """
        if "verify" not in kwargs:
            kwargs["verify"] = self._verify
        return json_api.delete(
            self.api_uri + resource, auth=self.auth, **kwargs
        )

    def _fetch_reg_info(self):
        """Fetch register info, including type and virtual register
        formulas."""
        reply = self.get("/register", params={"virtual": "formula"})
        if reply is None or "registers" not in reply:
            raise DeviceError("Failed to fetch register info.", reply)
        self._reg_info = {}
        for reg in reply["registers"]:
            ri = SimpleNamespace(idx=reg["idx"], tc=reg["type"], formula=None)
            formula = reg.get("formula")
            if formula is not None:
                ri.formula = VirtualRegister(formula)
            self._reg_info[reg["name"]] = ri

    def reg_idx(self, regname):
        """Return the register index for the register with name REGNAME.  This
        information is cached in the device since it is relatively
        expensive to get (requires a separate call to /api/register).

        """
        if self._reg_info is None:
            self._fetch_reg_info()
        return self._reg_info[regname].idx

    def reg_type(self, regname):
        """Return the type code of the register with name REGNAME.  This
        information is cached in the device since it is relatively
        expensive to get (requires a separate call to /api/register).

        """
        if self._reg_info is None:
            self._fetch_reg_info()
        return self._reg_info[regname].tc

    def reg_virtuals(self):
        """Return the list of virtual register names."""
        if self._reg_info is None:
            self._fetch_reg_info()
        virts = []
        for reg, ri in self._reg_info.items():
            if ri.formula:
                virts.append(reg)
        return virts

    def reg_formula(self, regname):
        """Return the register formula for the register with name REGNAME or
        None if the register is not a virtual register.  This
        information is cached in the device since it is relatively
        expensive to get (requires a separate call to /api/register).

        """
        if self._reg_info is None:
            self._fetch_reg_info()
        return self._reg_info[regname].formula

    def _fetch_chan_info(self):
        """Fetch channel info from /capture."""
        reply = self.get("/capture", params={"i": ""})
        if reply is None or "channels" not in reply:
            raise DeviceError("Failed to channel register info.", reply)
        self._chan_info = {}
        for chan, info in reply["channels"].items():
            ci = ChannelInfo(chan=int(chan), unit=info["unit"])
            self._chan_info[info["name"]] = ci

    def channel_info(self) -> List[ChannelInfo]:
        """Return the cached channel info as provided by /api/cap?i."""
        if self._chan_info is None:
            self._fetch_chan_info()
        return self._chan_info

    def clear_cache(self):
        """Clear the cached contents for this device."""
        self._reg_info = None
        self._chan_info = None
