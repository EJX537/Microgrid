#
#   Copyright (c) 2013, 2016-2017, 2020 eGauge Systems LLC
#       1644 Conestoga St, Suite 2
#       Boulder, CO 80301
#       voice: 720-545-9767
#       email: davidm@egauge.net
#
#   All rights reserved.
#
#   This code is the property of eGauge Systems LLC and may not be
#   copied, modified, or disclosed without any prior and written
#   permission from eGauge Systems LLC.
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
"""Convert terminal output with (some) ANSI escape sequences to HTML.
   Also escape any HTML special characters.

   At this time, most attribute ANSI escape sequences are converted, e.g.:

     ESC [ 0 m:         Reset attributes.
     ESC [ 41 m:        Background-color red.
     ESC [ 32 m:        Foreground-color red.
   """
import re

import html

HTML_STYLE = {
    1: "font-weight:bold",
    3: "font-style:italic",
    4: "text-decoration:underline",
    9: "text-decoration:line-through",
    22: "font-weight:normal",
    23: "font-style:normal",
    24: "text-decoration:none",
    29: "text-decoration:none",
    30: "color:black",
    31: "color:red",
    32: "color:green",
    33: "color:yellow",
    34: "color:blue",
    35: "color:magenta",
    36: "color:cyan",
    37: "color:white",
    40: "background-color:black",
    41: "background-color:red",
    42: "background-color:green",
    43: "background-color:yellow",
    44: "background-color:blue",
    45: "background-color:magenta",
    46: "background-color:cyan",
    47: "background-color:white",
}


def convert(msg):
    msg = html.escape(msg, quote=False)
    result = ""

    pattern = re.compile(r"\033\[(\d+)(;(\d+))*m")
    span_count = 0
    while True:
        m = pattern.search(msg)
        if not m:
            result += msg
            break
        result += msg[0 : m.start()]
        code = int(m.group(1))
        if code == 0:
            result += span_count * "</span>"
            span_count = 0
        elif code in HTML_STYLE:
            result += '<span style="%s">' % HTML_STYLE[code]
            span_count += 1
        msg = msg[m.end(0) :]
    return result + span_count * "</span>"


def selftest():
    test = "This is in \033[32mgreen\033[0m foreground."
    print("convert('%s') -> '%s'" % (test, convert(test)))
    test = (
        "This is in \033[41mred\033[0m background.  This \033[41mtoo\033[0m."
    )
    print("convert('%s') -> '%s'" % (test, convert(test)))
    test = (
        "\033[1mBold and \033[3mitalic and \033[4munderline\033[0m and none."
    )
    print("convert('%s') -> '%s'" % (test, convert(test)))


if __name__ == "__main__":
    selftest()
