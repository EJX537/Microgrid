#
# Copyright (c) 2022 eGauge Systems LLC
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
from typing import List, Union

import re

from .physical_units import PhysicalValue
from .register_type import RegisterType, Units, UnitSystem


UNIT_PATTERN = re.compile(r"(.*)/(.*)$")


class Error(Exception):
    """Base class for all exceptions raised by this module."""


class PhysicalQuantity:
    """A physical quantity is a measurement that is expressed as a value
    and a a unit, for example, 10 kW has a value of 10 and a unit of
    "kW"."""

    # The currency symbol/string to use for the monetary units:
    _currency: str = "***call set_currency()***"

    # The unit system PhysicalQuantity.to_preferred() should use by default.
    _default_unit_system = UnitSystem.METRIC

    @staticmethod
    def is_preferred(unit_system: UnitSystem, unit: str) -> bool:
        """Check if UNIT is a preferred unit in the unit system UNIT_SYSTEM."""
        return unit in Units.preferred[unit_system.value]

    @staticmethod
    def time_integrated_unit(unit: str) -> str:
        """Given a quantity with unit UNIT, derive the unit which results when
        integrating the quantity over time.  This basically adds '·s'
        to the unit name, except this method knows to simplify certain
        units.  For example, 'm^3/s·s' is simplified to 'm^3'."""
        m = UNIT_PATTERN.match(unit)
        if m and m.lastindex >= 2:
            prefix = m.group(1)
            suffix = m.group(2)
            if suffix == "s":
                # ${prefix}/s·s cancels out:
                return prefix
            if prefix == "":
                # "/${suffix}" => "s/${suffix}"
                return "s/" + suffix
            return prefix + "·s/" + suffix
        if unit == "":
            return "s"
        return unit + "·s"

    @classmethod
    def available_units(cls, type_code: str, is_cumul: bool) -> List[str]:
        entry = Units.table[type_code]
        unit = entry.cumul_unit if is_cumul else entry.rate_unit
        return Units.units.alternate_units(unit)

    @classmethod
    def scales(cls, unit: str) -> List[str]:
        return Units.units.scaled_units(unit)

    def __init__(
        self,
        value: Union[float, PhysicalValue],
        type_code: str = None,
        is_cumul: bool = False,
        unit: str = None,
        diff: bool = False,
    ):
        """Create a PhysicalQuantity object given a VALUE and a register
        TYPE_CODE or a UNIT.  In the first case, IS_CUMUL must be True
        if VALUE is a cumulative value (rather than a rate-of-change
        value).  In the second case, DIFF must be True if the created
        object should represent a change in value (i.e., a
        difference).  DIFF is relevant only for unit conversions that
        involve an additive term, as is the case, e.g., when
        converting temperature from celsius to fahrenheit or kelvin.
        For example, 0°C equals 32°F as an absolute temperature, but a
        temperature change of 0°C corresponds to a temperature change
        of 0°F, so for the second case, DIFF would have to be set to
        True to yield correct unit conversions.

        VALUE may also be a PhysicalValue object, in which case DIFF
        also needs to be set to True if the PhysicalQuantity object is to
        represent a change in value rather than an absolute value."""
        if isinstance(value, PhysicalValue):
            self.pv = value
            self.diff = diff
        else:
            if unit is None:
                ute = Units.table[type_code]
                unit = ute.cumul_unit if is_cumul else ute.rate_unit
                self.diff = type_code == RegisterType.TEMP_DIFF
            else:
                self.diff = diff
            self.pv = PhysicalValue(value, unit)

    def __str__(self):
        return self.pv.__str__()

    @property
    def value(self):
        """Return the value (magnitude) of the quantity."""
        return self.pv.value

    @property
    def unit(self):
        """Return the unit of the quantity.  When outputting a quantity to
        the user, PhysicalQuantity.locale_unit() should be used."""
        return self.pv.unit

    def to(self, unit: str, dt: float = None) -> float:
        """Return the quantity's value in the unit given by `unit`.  If the
        conversion is not possible an exception is raised.  If the
        quantity is a cumulative value `dt` needs to specify the time
        over which the quantity was measured.

        """
        x = self._to_unit(unit, dt)
        if x is None:
            raise Error("Conversion not possible.", self.pv.unit, unit)
        return x

    @property
    def locale_unit(self):
        """Return the localized unit.  This should be used when outputting a
        quantity to the user.  For most units, this is identical to
        PhysiqlQuantity.unit().  However, for monetary values this
        method replaces the string "${currency}" in units with the
        string established with PhysicalQuantity.set_currency().  Note
        that once a unit is localized, it cannot be converted to other
        units anymore, so this should be used for display purposes only."""
        return self.pv.unit.replace("${currency}", self._currency)

    @classmethod
    def set_currency(cls, currency: str):
        """Set the symbol/string to use as the local currency."""
        cls._currency = currency

    @classmethod
    def set_unit_system(cls, default_unit_system: UnitSystem):
        """Select which unit system to use by default (metric or imperial)."""
        cls._default_unit_system = default_unit_system

    def to_unit(self, unit: str, dt: float = None) -> "PhysicalQuantity":
        """Convert this quantity to the specified UNIT.  DT indicates the
        time-duration over which the quantity was measured.  This is
        needed because some conversions (e.g., °C·s to °K·s or °F·s)
        require a time-dependent adjustment."""
        x = self._to_unit(unit, dt)
        if x is not None:
            self._set(x, unit)
        return self

    def to_preferred(
        self, unit_system: UnitSystem = None, dt: float = None
    ) -> "PhysicalQuantity":
        """Convert this quantity to the preferred unit of unit system
        UNIT_SYSTEM.  DT is the time-duration over which the quantity
        was measured.  This is needed only for certain type
        conversions (e.g., °C·s to °K·s or F·s) that require a
        time-dependent adjustment.  If UNIT_SYSTEM is None, the
        unit system set with PhysicalQuantity.set_unit_system()
        is used."""

        if unit_system is None:
            unit_system = self._default_unit_system

        available = Units.units.alternate_units(self.pv.unit)
        for unit in available:
            preferred_unit = None
            if PhysicalQuantity.is_preferred(unit_system, unit):
                preferred_unit = unit
            else:
                for scaled in Units.units.scaled_units(unit):
                    if PhysicalQuantity.is_preferred(unit_system, scaled):
                        preferred_unit = scaled
                        break
            if preferred_unit is not None:
                x = Units.units.convert(
                    self.pv.value, self.pv.unit, preferred_unit, self.diff, dt
                )
                if x is not None:
                    return self._set(x, preferred_unit)
                break
        # could not find preferred unit; leave quantity unchanged
        return self

    def to_cumul(self, dt: float) -> "PhysicalQuantity":
        """Convert this physical quantity, which must represent an average
        rate over time-period DT, to the corresponding cumulative value."""
        # first, convert the unit to the primary unit, since the primary
        # units are most easily simplified by time_integrated_unit():
        primary_unit = Units.units.primary_unit(self.pv.unit)
        if primary_unit is not None and primary_unit != self.pv.unit:
            self.to_unit(primary_unit, dt)

        cumul_unit = PhysicalQuantity.time_integrated_unit(self.pv.unit)
        return self._set(dt * self.pv.value, cumul_unit)

    def auto_scale(self) -> "PhysicalQuantity":
        """If the measurement unit (e.g., 'W') has scaled units available
        (e.g., 'mW' or 'kW'), convert this quantity to a scaled unit
        such that the value is either zero or in the range from 1 to
        1000."""
        self.pv = Units.units.auto_scale(self.pv)
        return self

    def _to_unit(self, unit: str, dt: float = None) -> Union[float, None]:
        """Try to convert this quantity to `unit`.  If the conversion is not
        possible, None is returned.  Otherwise, the value in the
        desired unit is returned.

        """
        x = Units.units.convert(
            self.pv.value, self.pv.unit, unit, self.diff, dt
        )
        if x is not None:
            return x

        primary_unit = Units.units.primary_unit(self.pv.unit) or ""
        if primary_unit[-2:] == "·s" and unit[-2:] == "·s":
            if self.pv.unit != primary_unit:
                x = Units.units.convert(
                    self.pv.value, self.pv.unit, primary_unit, self.diff, dt
                )
            else:
                x = self.pv.value

            if x is not None:
                # If the conversion between two rate-units involves a
                # simple scale-factor, then the time-integrated
                # (cumulative) units of those rate-units can be
                # converted using the same factor.  This only works as
                # long as the rate-conversion is linear.  Fortunately,
                # we don't have any crazy units using non-linear
                # conversions so far.
                x = Units.units.convert(
                    x, primary_unit.slice[:-2], unit[:-2], self.diff, dt
                )
                if x is not None:
                    return x
        # conversion failed - leave the quantity unchanged
        return None

    def _set(self, val: float, unit: str) -> "PhysicalQuantity":
        """Establish the new value VAL and UNIT for the quantity."""
        self.pv.value = val
        self.pv.unit = unit
        return self


if __name__ == "__main__":
    pq = PhysicalQuantity(3.1415, "P")
    print(pq)
    print(pq.to_preferred(UnitSystem.METRIC), pq)
    pq.auto_scale()
    print("auto-scaled", pq)
    print(pq.to_unit("kW"), pq)
    pq.to_cumul(3600)
    print(pq)
    print(pq.to_preferred(UnitSystem.METRIC), pq)

    pq = PhysicalQuantity(24, "T")
    print(pq)
    print(pq.to_unit("°F"), pq)

    pq = PhysicalQuantity(24, "T")
    print(pq.to_preferred(UnitSystem.IMPERIAL), pq)

    pq = PhysicalQuantity(24 * (24 * 3600), "T", is_cumul=True)
    print(pq)
    print(pq.to_unit("°F·d", dt=24 * 3600), pq)

    print(PhysicalQuantity.available_units("P", False))
    print(PhysicalQuantity.available_units("P", True))
    print(PhysicalQuantity.scales("W"))
    print(PhysicalQuantity.scales("Wh"))
    print(PhysicalQuantity.available_units("T", False))
    print(PhysicalQuantity.available_units("T", True))
