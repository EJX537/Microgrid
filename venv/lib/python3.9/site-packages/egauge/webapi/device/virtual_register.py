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
from dataclasses import dataclass
from enum import auto, Enum
from types import SimpleNamespace
from typing import Callable, List

import re

from ..error import Error


ID_PATTERN = re.compile(r"[A-Z]+")
NUMBER_PATTERN = re.compile(r"(\d+)")


class VirtRegError(Error):
    """Exception raised due to any errors in this module."""


class Operator(Enum):
    REG = auto()  # value of a register
    MIN = auto()  # deprecated MIN(reg,c)
    MAX = auto()  # deprecated MAX(reg,c)


@dataclass
class Addend:
    op: Operator
    reg: any  # register id
    const: int = None
    negate: bool = False  # true if addend should be subtracted

    def __str__(self):
        reg = f"reg[{self.reg}]"
        if self.op == Operator.REG:
            val = reg
        elif self.op == Operator.MIN:
            val = f"MIN({reg},{self.const})"
        elif self.op == Operator.MAX:
            val = f"MAX({reg},{self.const})"
        return ("-" if self.negate else "+") + val


def _default_compile_reg(reg: str) -> str:
    """By default, use the register name as the register id."""
    return reg


class VirtualRegister:
    """Objects of this class are a parsed version of the virtual register
    formula.  Since these formulas need to work both for rates and
    cumulative values, only addition and subtraction are supported.
    For historical reasons, we continue to support the MIN/MAX
    operators, even though they don't work properly for cumulate
    value.  The should not be used on new meters."""

    def __init__(self, formula: str, compile_reg: Callable[[str], any] = None):
        """Compile a formula to a virtual register calculator.  COMPILE_REG is
        an optional callback that can be used to translate a register
        name to a register id.  If left undefined (or None), the
        register name is used as the register id."""
        if compile_reg is None:
            compile_reg = _default_compile_reg
        self._phys_regs = []
        self._addends = self._compile(formula, compile_reg)

    def __str__(self):
        return " ".join([str(a) for a in self._addends])

    def calc(self, get: Callable[[any], any]):
        """Calculate the value of a virtual register.  GET is a callback
        that must return the value for the physical register id passed as its
        first and only argument."""
        total = 0
        for a in self._addends:
            val = get(a.reg)
            if a.op == Operator.REG:
                pass
            elif a.op == Operator.MIN:
                if a.const < val:
                    val = a.const
            elif a.op == Operator.MAX:
                if a.const > val:
                    val = a.const
            if a.negate:
                val = -val
            total += val
        return total

    @property
    def phys_regs(self) -> List[str]:
        """Return the list of physical register names which this virtual
        register depends on."""
        return self._phys_regs

    def _compile(
        self, formula: str, compile_reg: Callable[[str], any]
    ) -> List[Addend]:
        """Parse a virtual register formula and translate it to a list of
        addends.

        Each virtual register is defined as the sum/difference of a
        set of physical registers.

        For backwards-compatibility, an addend may also consist of a
        MAX() or MIN() function call.  Those functions never worked
        correctly for calculating cumulative values, so they're
        deprecated.  Unfortunately, old devices may still use them.

        EBNF for a register formula:

          formula = ['+'|'-'] addend { ('+'|'-') addend}* .
          addend = regname | func .
          regname = QUOTED_STRING .
          formula = ('MIN'|'MAX') '(' regname ',' number ')' .
          number = [0-9]+ .

        """

        def error(reason):
            raise VirtRegError(f"{reason} (rest: '{formula[state.idx:]}')")

        def whitespace():
            while state.idx < len(formula) and formula[state.idx] in [
                " ",
                "\t",
            ]:
                state.idx += 1

        def peek() -> str:
            if state.idx >= len(formula):
                return ""
            return formula[state.idx]

        def getch() -> str:
            if state.idx >= len(formula):
                return ""
            state.idx += 1
            return formula[state.idx - 1]

        def match(what) -> bool:
            whitespace()
            if peek() == what:
                state.idx += 1
                return True
            return False

        def regname() -> Addend:
            if not match('"'):
                return error('Expected opening quote (")')
            name = ""
            while True:
                ch = getch()
                if ch == "\\":
                    ch = getch()
                elif not ch or ch == '"':
                    break
                name += ch
            if not name:
                return error("Register name must not be empty")

            if ch != '"':  # dont use match: no whitespace allowed
                return error('Expected closing quote (")')
            state.phys_regs[name] = True
            return Addend(op=Operator.REG, reg=compile_reg(name))

        def number() -> int:
            whitespace()
            m = NUMBER_PATTERN.match(formula[state.idx :])
            if not m:
                return error("Expected number")
            t = m.group()
            state.idx += len(t)
            return int(t)

        def func() -> Addend:
            """Parse:

            (MIN|MAX) '(' regname ',' number ')'

            """
            m = ID_PATTERN.match(formula[state.idx :])
            if not m:
                error("Expected function id")

            name = m.group()
            if name == "MAX":
                op = Operator.MAX
            elif name == "MIN":
                op = Operator.MIN
            else:
                error("Expected MIN or MAX")
            state.idx += len(name)

            if not match("("):
                error('Expected "("')

            a = regname()

            if not match(","):
                error('Expected ","')

            a.const = number()

            if not match(")"):
                error('Expected ")"')

            a.op = op
            return a

        def addend():
            whitespace()
            if state.idx >= len(formula):
                return

            negate = False
            if match("-"):
                negate = True
            elif match("+"):
                pass
            elif state.addends:
                error('Expected "+" or "-"')

            whitespace()

            if peek() == '"':
                a = regname()
            else:
                a = func()
            a.negate = negate
            state.addends.append(a)

        # with the above local functions, the rest is easy:

        state = SimpleNamespace(idx=0, addends=[], phys_regs={})
        while state.idx < len(formula):
            addend()
        self._phys_regs = list(state.phys_regs.keys())
        return state.addends


if __name__ == "__main__":
    regmap = {"Grid": 0, "Solar": 1}

    for formula in [
        "",
        '"Solar"+"Solar"',
        ' - "Grid"	',
        '+"Grid"',
        '"Grid"+MAX("Solar",0)',
    ]:
        try:
            virt = VirtualRegister(formula, lambda reg: regmap[reg])
        except VirtRegError as e:
            print("Error: Compile failed for formula:", formula)
            print("\t", e)
            continue
        print(
            "formula:",
            formula,
            ">>> compiled: ",
            virt,
            "phys_regs",
            virt.phys_regs,
        )

    if virt.calc(lambda reg: [10, 20][reg]) != 30:
        raise VirtRegError("Expected 30")
    if virt.calc(lambda reg: [10, -20][reg]) != 10:
        raise VirtRegError("Expected 10")
    if virt.calc(lambda reg: [-10, -20][reg]) != -10:
        raise VirtRegError("Expected 10")
