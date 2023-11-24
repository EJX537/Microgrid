#
# Copyright (c) 2020, 2022 eGauge Systems LLC
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
"""This module provides access to the eGauge WebAPI's /api/register
service."""
import decimal
import json

from deprecated import deprecated

from ..error import Error
from .physical_quantity import PhysicalQuantity
from .register_row import RegisterRow


class RegisterError(Error):
    """Raised if for any register related errors."""


def regnames_to_ranges(dev, regs):
    """Convert a list of register names to a register-ranges string."""
    indices = set()
    for name in regs:
        formula = dev.reg_formula(name)
        if formula is None:
            indices.add(dev.reg_idx(name))
        else:
            for phys_reg in formula.phys_regs:
                indices.add(dev.reg_idx(phys_reg))
    indices = sorted(list(indices))

    ranges = []
    idx = 0
    while idx < len(indices):
        start = stop = indices[idx]
        idx += 1
        while idx < len(indices) and indices[idx] == stop + 1:
            stop = indices[idx]
            idx += 1
        if start == stop:
            ranges.append(str(start))
        else:
            ranges.append(str(start) + ":" + str(stop))
    if len(ranges) < 1:
        return None
    return "+".join(ranges)


class Register:
    def __init__(self, dev, params=None, regs=None, **kwargs):
        """Fetch register data from device DEV.  PARAMS is a dictionary of
        query parameters that specify the data to return.  If REGS is
        None, all registers are returned.  If not None, it must be a
        list of register names for which data should be returned.
        Additional keyword arguments are passed along the
        requests.get()."""
        self.dev = dev
        # maps regname to index in "register"/"row" arrays:
        self.regorder = None
        self.iter_range_idx = None
        self.iter_row_idx = None
        self.iter_ts = None
        if params is None:
            params = {}
        self._requested_regs = regs
        if regs is not None:
            reg_ranges = regnames_to_ranges(dev, regs)
            if reg_ranges is not None:
                params["reg"] = reg_ranges
        self.raw = self.dev.get("/register", params=params, **kwargs)
        if self.raw is None:
            raise RegisterError("Failed to read register data.", params)
        if "error" in self.raw:
            raise RegisterError(
                "Error reading register data.", self.raw["error"]
            )

    def _create_regorder(self):
        """Create a dictionary mapping a register name to the index within
        the `registers' and `row' arrays which contain the info for
        that particular name."""
        self.regorder = {}
        for index, reg in enumerate(self.raw["registers"]):
            self.regorder[reg["name"]] = index

    def ts(self):
        """Return the timestamp of the register rates as a Decimal()."""
        if self.raw is None:
            return None
        return decimal.Decimal(self.raw["ts"])

    @property
    def regs(self):
        """The list of available register names."""
        if self._requested_regs:
            return self._requested_regs

        if self.regorder is None:
            self._create_regorder()
        return list(self.regorder.keys()) + self.dev.reg_virtuals()

    def have(self, reg):
        """Return True if register REG is available, False otherwise."""
        return reg in self.regs

    def _rate(self, reg) -> float:
        if self.raw is None:
            return None
        if self.regorder is None:
            self._create_regorder()

        row = self.raw["registers"]
        formula = self.dev.reg_formula(reg)
        if formula is not None:
            return formula.calc(lambda reg: row[self.regorder[reg]]["rate"])
        return row[self.regorder[reg]]["rate"]

    @deprecated(version="0.7.0", reason="use pq_rate() instead")
    def rate(self, reg) -> float:
        """Return the rate of change value of the register REG."""
        return self._rate(reg)

    def pq_rate(self, reg=None) -> PhysicalQuantity:
        """Return the rate of change value of the register REG."""
        rate = self._rate(reg)
        return PhysicalQuantity(rate, self.type_code(reg), is_cumul=False) \
            .to_preferred()

    def type_code(self, reg):
        """Return the type-code of register REG."""
        return self.dev.reg_type(reg)

    @deprecated(version="0.7.0", reason="use Device.reg_formula() instead")
    def formula(self, reg):
        """Return the formula of virtual register REG."""
        if self.raw is None:
            return None
        if self.regorder is None:
            self._create_regorder()
        return self.raw["registers"][self.regorder[reg]]["formula"]

    def index(self, reg):
        """Return the register index of register REG."""
        if self.raw is None:
            return None
        if self.regorder is None:
            self._create_regorder()
        return self.raw["registers"][self.regorder[reg]]["idx"]

    def database_id(self, reg):
        """Return the database-ID of register REG."""
        if self.raw is None:
            return None
        if self.regorder is None:
            self._create_regorder()
        return self.raw["registers"][self.regorder[reg]]["did"]

    def _make_row(self, ts, cumul_list):
        """Convert a "rows" array to a RegisterRow()."""
        row = RegisterRow(ts)

        # first, fill in the physical registers:
        phys = {}
        for idx, cumul in enumerate(cumul_list):
            ri = self.raw["registers"][idx]
            reg = ri["name"]
            cumul = int(cumul)
            phys[reg] = cumul
            if self._requested_regs and reg not in self._requested_regs:
                continue
            row.regs[reg] = cumul
            row.type_codes[reg] = self.type_code(reg)

        # second, fill in virtual registers (if any):
        for reg in self.dev.reg_virtuals():
            if self._requested_regs and reg not in self._requested_regs:
                continue
            formula = self.dev.reg_formula(reg)
            row.regs[reg] = formula.calc(lambda reg: phys[reg])
            row.type_codes[reg] = self.type_code(reg)
        return row

    def __getitem__(self, index):
        """Return the n-th row of cumulative register values as a
        RegisterRow.

        """
        range_idx = 0
        while True:
            curr_range = self.raw["ranges"][range_idx]
            ts = decimal.Decimal(curr_range["ts"])
            if index < len(curr_range["rows"]):
                ts -= index * decimal.Decimal(curr_range["delta"])
                return self._make_row(ts, curr_range["rows"][index])
            range_idx += 1
            index -= len(curr_range["rows"])

    def __iter__(self):
        """Iterate over cumulative register values.  Each iteration returns
        one row of data as a RegisterRow.

        """
        if self.raw is None:
            return None
        self.iter_range_idx = 0
        self.iter_row_idx = 0
        return self

    def __next__(self):
        if (
            self.raw is None
            or "ranges" not in self.raw
            or self.iter_range_idx >= len(self.raw["ranges"])
        ):
            raise StopIteration
        curr_range = self.raw["ranges"][self.iter_range_idx]

        if self.iter_row_idx == 0:
            self.iter_ts = decimal.Decimal(curr_range["ts"])

        row = self._make_row(
            self.iter_ts, curr_range["rows"][self.iter_row_idx]
        )

        self.iter_ts -= decimal.Decimal(curr_range["delta"])
        self.iter_row_idx += 1
        if self.iter_row_idx >= len(curr_range["rows"]):
            self.iter_row_idx = 0
            self.iter_range_idx += 1
        return row

    def __str__(self):
        return json.dumps(self.raw)
