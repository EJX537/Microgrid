# -*- coding: utf-8 -*-
#
# Copyright (c) 2021 eGauge Systems LLC
# 	1644 Conestoga St, Suite 2
# 	Boulder, CO 80301
# 	voice: 720-545-9767
# 	email: davidm@egauge.net
#
#  All rights reserved.
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
class BitStuffer:
    def __init__(self, header=b""):
        self.run_length = 0  # current length of run of 1 bits
        self.output = header
        self.out_byte = 0x00
        self.out_mask = 0x80

    def shift(self):
        self.out_mask >>= 1
        if self.out_mask == 0:
            self.output += bytes((self.out_byte,))
            self.out_byte = 0x00
            self.out_mask = 0x80

    def append(self, byte):
        mask = 0x80
        while mask != 0:
            if byte & mask:
                self.out_byte |= self.out_mask
                self.run_length += 1
                if self.run_length >= 7:
                    self.shift()
                    self.run_length = 0
            else:
                self.run_length = 0
            self.shift()
            mask >>= 1

    def finish(self):
        while self.out_mask != 0x80:
            self.shift()

    def get_output(self):
        self.finish()
        return self.output
