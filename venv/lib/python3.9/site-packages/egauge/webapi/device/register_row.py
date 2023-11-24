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
"""This module provides a helper class for a row of time-stamped
register data."""
import copy
import json

from deprecated import deprecated

from .register_type import Units
from .physical_quantity import PhysicalQuantity

from ..error import Error


class RegRowError(Error):
    """All errors in this module raise this exception."""


class RegisterRow:
    """A row of register data contains a timestamp and the signed 64-bit
    register values for that timestamp.  Subtracing one row from
    another creates a difference row.  On a difference row,
    RegisterRow.pq_accu() can be called to get the amount by which a
    register changed between the two rows.

    Similarly, RegisterRow.pq_avg() can be called to calculate the
    average register value that was in effect between the two rows."""

    def __init__(self, ts, regs=None, type_codes=None, is_diff=False):
        self.ts = ts
        self.is_diff = is_diff
        if regs is None:
            self.regs = {}
        else:
            self.regs = copy.copy(regs)
        if type_codes is None:
            self.type_codes = {}
        else:
            self.type_codes = copy.copy(type_codes)

    @deprecated(version="0.7.0", reason="use pq_avg() instead")
    def avg(self, regname) -> float:
        """Return the time-average of the register value."""
        self._assert(self.is_diff)
        return self.regs[regname] / self.ts

    def pq_rate(self, regname) -> PhysicalQuantity:
        """Return register rate of change as a physical quantity in the
        preferred unit of the default unit system (see
        PhysicalQuantity.set_unit_system()).

        """
        self._assert(self.is_diff)
        val = self.regs[regname]
        return PhysicalQuantity(
            val, self.type_codes[regname], is_cumul=False
        ).to_preferred()

    def pq_avg(self, regname) -> PhysicalQuantity:
        """Return the time-average of the register value as a physical
        quantity in the preferred unit of the default unit system
        (see PhysicalQuantity.set_unit_system())."""
        self._assert(self.is_diff)
        ute = Units.table[self.type_codes[regname]]
        val = self.regs[regname] / ute.fix_scale / self.ts
        return PhysicalQuantity(
            val, self.type_codes[regname], is_cumul=False
        ).to_preferred()

    def pq_accu(self, regname):
        """Return the accumulated register value as a physical quantity in the
        preferred unit of the default unit system (see
        PhysicalQuantity.set_unit_system())."""
        ute = Units.table[self.type_codes[regname]]
        val = self.regs[regname] * ute.cumul_scale

        # If the row is not a difference row, we cannot convert
        # between units with additive constants (e.g., °C·d to °F·d).
        # Set `dt` to None in that case, so those conversions will
        # fail visibily:
        dt = self.ts if self.is_diff else None
        return PhysicalQuantity(
            val, self.type_codes[regname], is_cumul=True
        ).to_preferred(dt=dt)

    def __sub__(self, subtrahend):
        """Subtract two register rows from each other and return the result.
        The SUBTRAHEND must have values for all of the registers in
        the minuend row.

        """
        self._assert(not self.is_diff)
        subtrahend._assert(not self.is_diff)

        ret = RegisterRow(self.ts, self.regs, self.type_codes)
        ret.ts = float(ret.ts - subtrahend.ts)
        ret.is_diff = True
        for name in self.regs:
            ret.regs[name] -= subtrahend.regs[name]
        return ret

    def _assert(self, cond: bool):
        if cond:
            return
        if self.is_diff:
            raise RegRowError("Cannot subtract a difference row.")
        raise RegRowError("The row must be a difference.")

    def __str__(self):
        return f"{self.ts}: {json.dumps(self.regs)}"

    def __iter__(self):
        """Iterate over cumulative register values.  Each iteration returns
        one row of data as a RegisterRow.

        """
        return iter(self.regs)
