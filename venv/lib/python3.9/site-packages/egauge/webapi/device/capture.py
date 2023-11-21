#
# Copyright (c) 2022-2023 eGauge Systems LLC
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
"""This module provides access to the eGauge WebAPI's /api/capture
service."""
from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Union

import time


from .device import Device
from ..error import Error


class CaptureError(Error):
    """Base exception for all errors raised by this module."""


@dataclass
class ChannelSamples:
    """Each sample is stored as a pair (t,y) where t is the time the
    sample was captured and y is value of the channel at that time.

    The time t is in seconds relative to the trigger point.  If the
    sample occurred before the trigger point, t will be negative.  If
    there is no trigger point (i.e., the capture was initated
    immediately or automatically), the time is relative to the first
    sample.

    The value y is in the physical unit of the channel it was captured
    on.  The physical unit of a channel can be obtained with method
    Capture.channel_unit().  For ease of further processing, the
    samples are stored as two lists of equal length: ts for the time
    stamps and ys for the y values.

    """

    ts: List[float] = field(default_factory=list)
    ys: List[float] = field(default_factory=list)


@dataclass
class TriggerPoint:
    """A trigger point identifies the sample that first satisfied the
    trigger condition.  `channel` stores the name of the channel that
    was the trigger channel and `index` stores the index of the sample
    of that channel that stores the trigger sample.

    """

    channel: str
    index: int


@dataclass
class CaptureResult:
    """A CaptureResult stores all data for a single capture.

    `unix_ts` is the Unix timestamp of the sample that triggered the
    capture, or the timestamp of the first captured sample, if the
    capture was triggered immediately or automatically.

    `samples` stores the samples for each channel that was captured,
    indexed by channel name.  Note that, even though each channel has
    the same number of samples, the timestamps in those samples are
    generally distinct.  Use interpolation methods such as
    scipy.interpolate.interp1d() to interpolate channel data to a
    common point in time.

    The relative time stamps stored in the samples can be converted to
    absolute time stamps by adding them to `unix_ts`.  To avoid loss
    of precision, you may want to consider using Decimal() numbers for
    this purpose: UNIX timestamps may take up 32 bits or more and
    microsecond granularity requires another 20 bits, quickly
    approaching the precision limits of a double-precision IEEE754
    floating point number.

    `trigger_point` identifies the first sample that satisfied the
    trigger condition.  If there was no such sample, it is None.  Note
    that it is possible to trigger on a channel that is not captured,
    in which case the trigger sample is not actually stored in the
    CaptureResult.

    """

    unix_ts: Decimal = None
    samples: Dict[str, ChannelSamples] = field(default_factory=dict)
    trigger_point: TriggerPoint = None


class TriggerMode(Enum):
    """The trigger mode determines how the trigger condition is
    evaluated:

    `ANY` triggers immediately.

    `RISING` triggers when the trigger channel has a rising edge that
    crosses the trigger level.

    `FALLING` triggers when the trigger channel has a falling edge that
    crosses the trigger level.

    `ABOVE` triggers if the trigger channel has a value that is greater
    than the trigger level.

    `BELOW` triggers if the trigger channel has a value that is less the
    trigger level.

    """

    ANY = "any"
    RISING = "rise"
    FALLING = "fall"
    ABOVE = "gt"
    BELOW = "lt"


class Capture:
    """Objects of this class are used to setup the capture of waveform
    data for one or more channels, capture data synchronously
    or asynchronously, and to provide access to captured data in a
    convenient fashion.

    Properties:
        channels: set(str)
            The name of the channel that should be the trigger source
            or None if the capture should be triggered immediately.

        trigger_channel: str
            The channel used to trigger the capture or None if
            the capture should be triggered immediately.

        trigger_mode: TriggerMode
            The trigger mode or None if no the capture should be
            triggered immediately.

        trigger_level: float
            The trigger level or None if no trigger level should be
            set.  The level is in the physical unit of the trigger
            channel, as provided by Capture.channel_unit().

        trigger_timeout: float
            This is a timeout in seconds.  An automatic trigger is
            generated if the trigger condition does not occur within
            this timeout.

        trigger_pretrigger: float
            This defines how much data is captured stored ahead of the
            trigger point.  It is a duration in seconds.  A value of 0
            causes the first sample to be the trigger point.  A value
            of 2 would mean that 2 seconds of data are captured before
            the trigger point.

    """

    def __init__(self, dev: Device):
        """Create a capture object for meter DEV."""
        self.channels: set[str] = {}
        self.trigger_channel: str = None
        self.trigger_level: float = None
        self.trigger_mode: TriggerMode = None
        self.trigger_timeout: float = None
        self.pretrigger: float = None

        # private state:
        self._dev = dev
        self._ch_map = None

    @property
    def available_channels(self) -> List[str]:
        """Return the list of available channel names."""
        return list(self._dev.channel_info().keys())

    def channel_unit(self, channel_name: str) -> str:
        """Return the physical unit of the channel with name
        `channel_name`.

        """
        cinfo = self._dev.channel_info().get(channel_name)
        if cinfo is None:
            raise CaptureError("Unknown channel.", channel_name)
        return cinfo.unit

    def start(self, duration: float = None, **kwargs) -> int:
        """Initiate capturing data for a duration of `duration` seconds.  If
        `duration` is None or unspecified, as much data as possible is
        captured.  Additional keyword arguments are passed along to
        requests.get().  This method returns an integer "cookie" which
        uniquely identifies the pending capture.  In the case of an
        error, an exception is raised.

        """
        params = "n"

        if duration is not None:
            params += f"&d={duration}"

        for name in self.channels:
            ch = self._ch_number(name)
            params += f"&c={ch}"

        if self.trigger_channel is not None:
            ch = self._ch_number(self.trigger_channel)
            params += f"&C={ch}"

        if self.trigger_mode is not None:
            params += f"&M={self.trigger_mode.value}"

        if self.trigger_level is not None:
            params += f"&L={self.trigger_level}"

        if self.trigger_timeout is not None:
            params += f"&T={1000 * self.trigger_timeout}"

        if self.pretrigger is not None:
            params += f"&p={self.pretrigger}"

        ret = self._dev.get(f"/capture?{params}", **kwargs)
        if ret.get("error"):
            raise CaptureError(ret.get("error"))

        if ret["state"] == "available":
            raise CaptureError("Failed to start capture.", ret["state"])
        return ret["cookie"]

    def result(
        self, cookie: int, raw=False, **kwargs
    ) -> Union[float, CaptureResult]:
        """Return the result of the capture identified by `cookie`, which must
        be a cookie previously returned by a call to Capture.start().
        The method returns a number if the capture is still in
        progress.  If so, the number is from 0 and 1, giving the
        fraction of the total amount of data captured so far.  If all
        the data has been captured, an object of class CaptureResult
        is returned.  If any error occurs, an exception is raised.

        """
        params = f"n={cookie}"

        if raw:
            params += "&r=True"

        ret = self._dev.get(f"/capture?{params}", **kwargs)
        if ret.get("error"):
            raise CaptureError(ret.get("error"))

        if ret["state"] == "available":
            raise CaptureError("Capture aborted.")  # somebody interfered?
        if ret["state"] == "armed":
            return 0.0
        if ret["state"] == "capturing":
            return ret["count"] / ret["max_count"]
        if ret["state"] != "full":
            raise CaptureError("Unknown capture state.", ret["state"])

        ch_mask = 0
        for n, w in enumerate(ret["ch_mask"]):
            ch_mask |= w << (n * 32)

        channel_names = []
        result = CaptureResult()
        ch = 0
        m = 1
        while ch_mask != 0:
            if (ch_mask & m) != 0:
                ch_mask &= ~m
                name = self._ch_name(ch)
                channel_names.append(name)
                if name in self.channels:
                    # this is data we're interested in:
                    result.samples[name] = ChannelSamples()
            ch += 1
            m <<= 1

        result.unix_ts = Decimal(ret["first_sample"])
        tick_period = 1 / ret["ts_freq"]
        dt = None
        ci = 0  # cycles through the channels
        sample_count = 0
        for r in ret["r"]:
            name = channel_names[ci]

            if dt is None:
                dt = 0
            else:
                dt += r["t"] * tick_period

            if r.get("trigger"):
                # update t for the pretrigger data:
                for cs in result.samples.values():
                    for i, _ in enumerate(cs.ts):
                        cs.ts[i] -= dt
                dt = 0

                result.trigger_point = TriggerPoint(
                    channel=name, index=sample_count
                )

            for d in r["d"]:
                cs = result.samples.get(name, None)
                ci += 1
                if ci >= len(channel_names):
                    ci = 0
                    sample_count += 1
                name = channel_names[ci]
                if cs is None:
                    continue  # we're not interested in this channel
                cs.ts.append(dt)
                cs.ys.append(d)
        return result

    def acquire(self, duration: float = None, **kwargs) -> CaptureResult:
        """This method synchronously captures waveform data by first calling
        Capture.start(duration) and then repeatedly calling
        Capture.result() until all the data has been captured.  The
        method returns the captured data or raises an exception in
        case of an error.

        """
        cookie = self.start(duration, **kwargs)
        while True:
            time.sleep(100e-3)
            result = self.result(cookie)
            if isinstance(result, CaptureResult):
                return result

    def reset(self, cookie: Optional[int] = None, **kwargs):
        """Cancel a pending capture and reset the capture service state so it
        is available again.  If `cookie` is not None, only the capture
        identified by the `cookie` is canceled (assuming it is still
        pending).  This method raises an exception if the reset fails
        for any reason.  Additional keyword arguments are passed along
        to requests.get().

        """
        params = "R"
        if cookie is not None:
            params = f"n={cookie}"
        ret = self._dev.get(f"/capture?{params}", **kwargs)
        if ret.get("error"):
            raise CaptureError(ret.get("error"))

        state = ret.get("state")
        if state != "available":
            raise CaptureError("Unexpected capture state.", state)

    def _ch_number(self, name: str) -> int:
        """Get the channel number of the channel named `name` or raise an
        exception if the channel name is not known.

        """
        cinfo = self._dev.channel_info().get(name)
        if cinfo is None:
            raise CaptureError("Unknown channel.", name)
        return cinfo.chan

    def _ch_name(self, ch: int) -> str:
        """Get the name of the channel with number `ch` or None if there is no
        name for the specified channel number.

        """
        if self._ch_map is None:
            self._ch_map = {}
            for name, cinfo in self._dev.channel_info().items():
                self._ch_map[int(cinfo.chan)] = name
        return self._ch_map.get(ch)
