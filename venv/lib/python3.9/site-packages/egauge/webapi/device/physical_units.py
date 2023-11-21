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
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional, Union


class Error(Exception):
    """Base class for any error raised by this module."""


@dataclass
class PhysicalValue:
    """A physical value has a unit attached to its numeric value."""

    value: float
    unit: str

    def __str__(self):
        return f"{self.value}{self.unit}"


@dataclass
class PhysicalUnitConversion:
    """An object of this class handles conversion from one unit to another
    and back."""

    #
    # True if the conversion requires specifying the time parameters
    # to `calc` and `inverse`.  This is necessary, for example to
    # convert from C*s (celsius-seconds) to F*s (Fahrenheit-seconds).
    #
    time_dependent: bool
    #
    # Given a primary unit value, calculate the equivalent value in
    # this unit.
    #
    # First argument is the primary-unit value to convert.  Second
    # argument is is the number of seconds over which the value was
    # measured.  This argument is only needed if `time_dependent` is
    # True.
    calc: Callable[[float, Optional[float]], float]
    #
    # Given a value in this unit, convert it back to a primary-unit value.
    #
    # First argument is the value to convert.  Second argument is the
    # number of seconds over which the value was measured.  This
    # argument is only needed if `time_dependent` is True.
    inverse: Callable[[float, Optional[float]], float]
    #
    # Given a primary-unit change (difference) in value, calculate the
    # equivalent difference in this unit.  This is defined only if the
    # formula is not the same as `calc`.
    #
    # The first argument is the measured difference to convert.  The
    # second argument is the number of seconds over which the
    # difference was measured.  This argument is only needed if
    # `time_dependent` is True.
    diff_calc: Callable[[float, Optional[float]], float] = None
    #
    # Given a difference in this unit, convert it back to a difference
    # in the primary unit.  This is defined only if the formula is not
    # the same as `inverse`.
    #
    # First argument is the difference to convert.  The second
    # argument is the number of seconds over which the difference was
    # measured.  This argument is only needed if `time_dependent` is
    # True.
    diff_inverse: Callable[[float, Optional[float]], float] = None


class PhysicalUnit:
    """Each physical unit object has a unit name and may have one or more
    scaled version of this unit."""

    def __init__(self, name: str, description: Optional[str]):
        self.name = name
        self.description = description
        # Dictionary of scaled units or None if there aren't any.  The
        # index is the name of the scaled unit, the value is the scale
        # factor to use when converting to that scaled unit.
        self.scaled: Dict[str, float] = None
        # Documentation for a particular scaled unit or None if there
        # aren't any such documentation strings.
        self.scaled_description: Dict[str, str] = None

    def add_scaled(self, name: str, factor: float, description: str = None):
        """Add a scaled version of the unit (e.g., for 'A' (ampere), this
        might be 'mA' (milli ampere) or 'kA' (kilo ampere).  NAME is
        the name of the scaled unit, FACTOR the number by which to
        multiply a value by to get the equivalent value in the scaled
        unit."""
        if not self.scaled:
            self.scaled = {}
        if name in self.scaled:
            raise Error("Scaled unit name already exists.", name)
        self.scaled[name] = factor
        if description is not None:
            if not self.scaled_description:
                self.scaled_description = {}
            self.scaled_description[name] = description


class PrimaryUnit(PhysicalUnit):
    """Each primary unit object is a physical unit that may have zero or
    more alternate units."""

    def __init__(self, name: str, description: str = None):
        super().__init__(name, description)
        # Dictionary of alternate units available for this primary
        # unit.  The index is the name of the alternate unit, the
        # value is an alternate unit object.
        self.alternates: Dict[str, "AlternateUnit"] = None

    def add_alternate(self, alternate: "AlternateUnit"):
        """Add an alternate unit to this primary unit."""
        if not self.alternates:
            self.alternates = {}
        if alternate.name in self.alternates:
            raise Error("Alternate unit name already exists.", alternate.name)
        self.alternates[alternate.name] = alternate


class AlternateUnit(PhysicalUnit):
    """Each alternate unit is a physical unit which has a parent that this
    the primary unit and conversion functions to convert values
    between the primary unit and the alternate unit."""

    def __init__(
        self,
        name: str,
        primary: PrimaryUnit,
        conversion: PhysicalUnitConversion,
        description: str = None,
    ):
        """Create an alternate unit object. NAME is the name of this alternate
        unit.  PRIMARY is the primary unit object of this alternate
        unit.  CONVERSION is the physical unit conversion object for
        this alternate unit.  DESCRIPTION is an optional description
        for this unit.
        """
        super().__init__(name, description)
        self.primary = primary
        self.conversion = conversion
        primary.add_alternate(self)


class PhysicalUnits:
    """An object of this class defines a set of physical units and methods
    to convert between them."""

    def __init__(self):
        # Map from any recognized unit to its PhysicalUnit.  For
        # scaled units, this maps to the primary or alternate unit
        # that defines the scaled unit.
        self._map: Dict[str, PhysicalUnit] = {}

    def add(self, unit: PhysicalUnit):
        """Add a physical unit.  An error is raised if the unit's name is
        already known."""
        if unit.name in self._map:
            raise Error("Unit name already exists.", unit.name)
        self._map[unit.name] = unit

    def add_scaled(
        self,
        unit: PhysicalUnit,
        name: str,
        factor: float,
        description: str = None,
    ):
        """Add a scaled version of a unit.  An error is raised if the scaled
        unit's name is already known.  UNIT is the unit to add.  NAME
        is the name of the scaled unit. FACTOR is factor by which a
        value should be multiplied to get the equivalent value in the
        scaled unit.  DESCRIPTION is the optional description for this
        unit."""
        unit.add_scaled(name, factor, description)
        if name in self._map:
            raise Error("Scaled unit already exists.", name)
        self._map[name] = unit

    def convert(
        self,
        x: float,
        from_unit: str,
        to_unit: str,
        is_diff: Optional[bool] = False,
        t: Optional[float] = None,
    ) -> Union[float, None]:
        """Convert a value from a source unit to a destination unit.  X is the
        value to convert.  FROM_UNIT is the unit of X.  TO_UNIT is the
        unit to which to convert X to.  IS_DIFF is an optional
        parameter indicating that the value X is a difference (i.e., a
        relative value) rather than an absolute value.  If the
        conversion is time-dependent, T must be set to the duration
        over which the value was measured.

        This method returns the value in the destination unit or None
        if the the source or destination unit is unknown or if the
        conversion from the source unit to the destination unit is not
        possible."""
        if from_unit == to_unit:
            return x

        pu = self._map.get(from_unit)
        if not pu:
            return None

        if from_unit in (pu.scaled or {}):
            # convert the value to the unscaled unit:
            x /= pu.scaled[from_unit]
            from_unit = pu.name
            if from_unit == to_unit:
                return x

        if isinstance(pu, AlternateUnit):
            # convert from alternate unit to primary unit:
            c = pu.conversion
            if is_diff and c.diff_inverse:
                x = c.diff_inverse(x, t)
            else:
                x = c.inverse(x, t)
            pu = pu.primary

        primary = pu
        from_unit = primary.name
        if from_unit == to_unit:
            return x

        # convert from primary unit to target unit:
        pu = self._map.get(to_unit)
        if not pu:
            return None

        # verify that we can convert between the two units:
        if isinstance(pu, AlternateUnit):
            if pu.primary != primary:
                return None
        elif pu != primary:
            return None

        valid_unit = False
        if primary.alternates:
            au = primary.alternates.get(pu.name)
            if au:
                # convert to alternate unit:
                pu = au
                c = au.conversion
                if is_diff and c.diff_calc:
                    x = c.diff_calc(x, t)
                else:
                    x = c.calc(x, t)
                valid_unit = True

        if to_unit in (pu.scaled or {}):
            # apply scale factor:
            x *= pu.scaled[to_unit]
            valid_unit = True
        return x if valid_unit else None

    def auto_scale(self, pv: PhysicalValue) -> PhysicalValue:
        """Automatically scale a physical value PV such that its numeric value
        is either zero or in the range from 1..1000, if possible.  The
        method returns the scaled value or the original value if
        scaling is not possible for any reason."""
        pu = self._map.get(pv.unit)
        if not pu or _well_scaled(pv.value):
            return pv

        if pv.unit != pu.name:
            # convert to unscaled unit:
            pv.value = self.convert(pv.value, pv.unit, pu.name)
            pv.unit = pu.name
            if _well_scaled(pv.value):
                return pv

        best = pv
        if pu.scaled:
            for scaled_unit, factor in pu.scaled.items():
                value = pv.value * factor
                if value >= 1.0:
                    best = PhysicalValue(value, scaled_unit)
                if _well_scaled(value):
                    break
        return best

    def primary_unit(self, unit: str) -> Union[str, None]:
        """Return the name of the primary unit for a unit.  UNIT is the unit
        name for which to return the primary unit.  This method the
        primary unit name or None if UNIT is not a recognized unit."""
        primary = self._primary(unit)
        if primary is None:
            return None
        return primary.name

    def alternate_units(self, unit: str) -> List[str]:
        """Return a list of all alternate units of a given unit (the
        specified unit is also included in the list).  The primary unit
        is listed first, the rest of the list is sorted alphabetically by
        unit name.

        UNIT is the unit for which to return all alternate units (does
        not have to be a primary unit).

        This method returns a list of alternate units or an empty list
        if UNIT is not a recognized unit."""
        primary = self._primary(unit)
        available = []
        if primary is not None:
            if primary.alternates:
                for alt in primary.alternates.keys():
                    available.append(alt)
            available.sort()
        available.insert(0, primary.name)
        return available

    def scaled_units(self, unit: str) -> List[str]:
        """Return a list of all scaled units of UNIT. The returned list is
        sorted by increasing scale factor and does not include UNIT
        itself."""
        pu = self._map.get(unit)
        if pu is None or pu.scaled is None:
            return []

        available: List[List[str, float]] = []
        for name, factor in pu.scaled.items():
            available.append([name, factor])
        available.sort(key=lambda el: el[1])
        return [el[0] for el in available]

    def _primary(self, unit: str) -> Union[PrimaryUnit, None]:
        """Get the primary unit object for a unit.  UNIT is the unit whose
        primary unit to get.  This method returns the primary unit
        object or None if UNIT is not a recognized unit."""
        pu = self._map.get(unit)
        if pu is None:
            return None
        if isinstance(pu, AlternateUnit):
            pu = pu.primary
        return pu


def _well_scaled(x: float) -> bool:
    """Check if number X is "well scaled".  The number 0 is always
    well-scaled.  All other numbers must be in the range from 1 to
    1000 (exclusive) for this to be the case."""
    return x == 0 or (1.0 <= x < 1000)
