#
# Copyright (c) 2020 eGauge Systems LLC
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
"""This module provides access to the eGauge Serial Number web
   service.

"""
import logging

import urllib.parse

from .. import json_api

from ..error import Error

log = logging.getLogger(__name__)


class SerialNumberError(Error):
    """Raised for Serial Number API errors."""


class SerialNumber:
    def __init__(self, auth=None):
        """Return a serial number object.  AUTH should be an authentication
        object that provides the credentials to access the service.
        Typically, this should be a TokenAuth object.

        """
        self.api_uri = "https://api.egauge.net/v1/serial-numbers/"
        self.auth = auth

    def _get(self, resource, **kwargs):
        """Issue GET request for serial-number resource RESOURCE and return
        the parsed JSON data or None if the request failed or returned
        invalid JSON data.  Additional keyword arguments are passed on
        to requests.get().

        """
        reply = json_api.get(self.api_uri + resource, auth=self.auth, **kwargs)
        log.debug("get[%s] = %s", resource, reply)
        return reply

    def _post(self, resource, json_data, **kwargs):
        """Issue POST request to serial-number resource RESOURCE and return
        parsed JSON reply or None if the request failed or returned
        invalid JSON data.  Additional keyword arguments are passed on
        to requests.post().

        """
        reply = json_api.post(
            self.api_uri + resource, json_data, auth=self.auth, **kwargs
        )
        log.debug("post[%s] = %s", resource, reply)
        return reply

    def allocate(self, model_name, serial=None):
        """Return and allocate the next available serial number for model
        MODEL_NAME.  Typically, the MODEL_NAME should be prefixed by
        the manufacturer name to ensure uniqueness.  For example, for
        eGauge model ETN100, MODEL_NAME would be 'eGauge-ETN100'.
        Once allocated, a serial number cannot be freed again so care
        should be taken to use all allocated numbers.

        If SERIAL is specified, allocate that specific serial number,
        if it is avaiable, or fail otherwise.  Specific serial-number
        allocation may not be allowed for all MODEL_NAMEs.

        On error, exception SerialNumberError is raised.

        """
        data = {"name": model_name}
        if serial is not None:
            data["serial"] = serial
        reply = self._post("models/allocate/", json_data=data)
        if reply is None:
            raise SerialNumberError("POST to allocate SN failed.", model_name)
        if not "serial" in reply:
            log.error(
                "Failed to allocate SN: model=%s, reply=%s.", model_name, reply
            )
            if "errors" in reply:
                raise SerialNumberError(
                    "Error during SN allocation.", model_name, reply["errors"]
                )
            raise SerialNumberError("SN allocation failed.", model_name)
        return int(reply["serial"])

    def get_models(self):
        """Return a list of all model names registered in the database.  Each
        object in the list has members id (internal database id of the
        model), name (the model name), and max_sn (the maximum
        serial-number).

        On error, exception SerialNumberError is raised.
        """
        reply = self._get("models/")
        if reply is None:
            raise SerialNumberError("Failed to get SN models.")
        return reply

    def create_model(self, model_name, max_sn):
        """Create a new model with name MODEL_NAME and maximum serial number
        MAX_SN. Returns True on success, False on error.

        """
        data = {"name": model_name, "max_sn": max_sn}
        reply = self._post("models/", data)
        if reply is None or "name" not in reply:
            return False
        return reply["name"] == model_name

    def get_devices(self, model_name=None, dev_filter=None):
        """Return a list of devices.  If MODEL_NAME is not None, only devices
        with that model name are returned.  If DEV_FILTER is not None,
        only devices matching the filter are returned.

        """
        resource = "devices/"
        if model_name is not None:
            quoted_model = urllib.parse.quote(model_name, safe="")
            resource += quoted_model + "/"

        if dev_filter is not None:
            resource += "?" + dev_filter

        reply = self._get(resource)
        if reply is None:
            raise SerialNumberError(
                "Failed to get metadata.", model_name, dev_filter
            )
        return reply

    def get_metadata(self, model_name, sn):
        """Return the JSON-blob metadata for model MODEL_NAME and
        serial-number SN.

        On error, exception SerialNumberError is raised.
        """
        quoted_model = urllib.parse.quote(model_name, safe="")
        resource = "devices/%s/%s/" % (quoted_model, sn)
        reply = self._get(resource)
        if reply is None:
            raise SerialNumberError(
                "Failed to get serial number record.", model_name, sn
            )
        if "metadata" not in reply or reply["metadata"] is None:
            log.warning("no metadata exists for SN %s.", sn)
            return {}
        return reply["metadata"]

    def set_metadata(self, model_name, sn, meta):
        """Set the metadata for model MODEL_NAME and serial-number SN to META.
        META must be a JSON-serializable object.

        NOTE: Using get_metadata()/set_metadata() to update parts of
              the JSON metadata is NOT atomic.  We recommended using
              higher-level synchronization (such as a ResourceLock) to
              ensure there are no conflicting updates.

        On error, exception SerialNumberError is raised.

        """
        quoted_model = urllib.parse.quote(model_name, safe="")
        resource = "devices/%s/%s/" % (quoted_model, sn)
        reply = self._post(resource, json_data={"metadata": meta})
        if reply is None:
            raise SerialNumberError("Failed to set metadata.", model_name, sn)
        if "errors" in reply:
            raise SerialNumberError(
                "Failed to save metadata.", model_name, sn, reply["errors"]
            )
