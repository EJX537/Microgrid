#
# Copyright (c) 2020-2022 eGauge Systems LLC
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
"""This module provides support additional requests auth services, in
particular for JWT-token based authentication (JWTAuth) and for plain
token-based authentication (TokenAuth)."""

import hashlib
import os
import secrets
import types

from functools import wraps
from urllib.parse import urlparse

import requests

from . import json_api


# The name of the optional environment variable storing a token:
ENV_EGAUGE_API_TOKEN = "EGAUGE_API_TOKEN"


def _decorate_public_metaclass(decorator):
    """Return a metaclass which will decorate all public methods of a
    class with the DECORATOR function.

    """

    class MetaClass(type):
        def __new__(mcs, class_name, bases, class_dict, **kwargs):
            if bases:
                decorated_class = bases[0]
                for attr_name, attr in decorated_class.__dict__.items():
                    if isinstance(attr, types.FunctionType):
                        if attr_name[0] == "_":
                            continue
                        attr = decorator(attr)
                    class_dict[attr_name] = attr
            return type.__new__(mcs, class_name, bases, class_dict, **kwargs)

    return MetaClass


def decorate_public(cls, decorator):
    """Return a subclass of CLS in which all public methods of CLS are
    decorated with function DECORATOR.  Methods whose name start with
    an underscore ('_') are considered private, all other methods are
    considered public.

    """

    # pylint: disable=unused-variable
    def wrapper(method):
        @wraps(method)
        def wrapped(*args, **kwargs):
            return decorator(method, *args, *kwargs)

        return wrapped

    class DecoratedClass(cls, metaclass=_decorate_public_metaclass(wrapper)):
        # pylint: disable=too-few-public-methods
        pass

    return DecoratedClass


class JWTAuth(requests.auth.AuthBase):
    """Implements the eGauge device WebAPI's JWT-based authentication
    scheme.  Digest login is used so the password is never sent over
    the HTTP connection.

    """

    def __init__(self, username, password):
        self.bearer_token = None
        self.username = username
        self.password = password

    def __call__(self, r):
        if self.bearer_token:
            r.headers["Authorization"] = self.auth_header()
        r.register_hook("response", self.handle_401)
        return r

    def __eq__(self, other):
        return self.username == getattr(
            other, "username", None
        ) and self.password == getattr(other, "password", None)

    def auth_header(self):
        """Return HTTP Auth-Header value."""
        return "Bearer " + self.bearer_token

    def handle_401(self, r, **kwargs):
        """Called when server responds with 401 Unauthorized."""
        if r.status_code != 401:
            return r

        try:
            auth_request = r.json()
        except ValueError:
            return r

        realm = auth_request["rlm"]
        server_nonce = auth_request["nnc"]

        client_nonce = f"{secrets.randbits(64):x}"

        content = self.username + ":" + realm + ":" + self.password
        ha1 = hashlib.md5(content.encode("utf-8")).hexdigest()

        content = ha1 + ":" + server_nonce + ":" + client_nonce
        ha2 = hashlib.md5(content.encode("utf-8")).hexdigest()

        data = {
            "rlm": realm,
            "usr": self.username,
            "nnc": server_nonce,
            "cnnc": client_nonce,
            "hash": ha2,
        }

        url = urlparse(r.request.url)
        login_uri = url.scheme + "://" + url.netloc + "/api/auth/login"
        verify = kwargs.get("verify", True)
        auth_reply = json_api.post(login_uri, data, timeout=60, verify=verify)

        if auth_reply is None:
            return r

        if "jwt" not in auth_reply:
            return r

        self.bearer_token = auth_reply["jwt"]

        prep = r.request.copy()
        prep.headers["Authorization"] = self.auth_header()
        _r = r.connection.send(prep, **kwargs)
        _r.history.append(r)
        _r.request = prep
        return _r


class TokenAuth(requests.auth.AuthBase):
    """Implements the eGauge web services' token-based authentication
    scheme.  This sends the password to the server, so it must not be
    used unless the underlying transport is encrypted!

    """

    def __init__(
        self,
        username=None,
        password=None,
        ask=None,
        token_service_url="https://api.egauge.net/v1/api-token-auth/",
    ):
        self.username = username
        self.password = password
        self.ask_credentials = ask
        self.token_file = None
        self.token_service_url = token_service_url
        self.token = os.environ.get(ENV_EGAUGE_API_TOKEN)
        if self.token is None:
            self.token_file = os.path.join(
                os.path.join(os.getenv("HOME"), ".egauge_api_token")
            )
            try:
                with open(self.token_file, "r", encoding="utf-8") as f:
                    self.token = f.read().rstrip()
                    if len(self.token) < 32:
                        self.token = None
            except IOError:
                pass

    def __call__(self, r):
        if self.token:
            r.headers["Authorization"] = self.auth_header()
        r.register_hook("response", self.handle_401)
        return r

    def __eq__(self, other):
        return self.username == getattr(
            other, "username", None
        ) and self.password == getattr(other, "password", None)

    def auth_header(self):
        """Return HTTP Auth-Header value."""
        return "Token " + self.token

    def handle_401(self, r, **kwargs):
        """Called when server responds with 401 Unauthorized."""
        if r.status_code != 401:
            return r

        usr = self.username
        pwd = self.password

        if usr is None or pwd is None:
            credentials = self.ask_credentials()
            if credentials is None:
                return r
            [usr, pwd] = credentials

        creds = {"username": usr, "password": pwd}
        verify = kwargs.get("verify", True)
        auth_reply = requests.post(
            self.token_service_url, json=creds, timeout=60, verify=verify
        ).json()

        if auth_reply is None:
            return r

        if "token" not in auth_reply:
            return r

        self.token = auth_reply["token"]

        if self.token_file is None:
            # the original token came for the os.environ
            os.environ[ENV_EGAUGE_API_TOKEN] = self.token
        else:
            try:
                fd = os.open(self.token_file, os.O_CREAT | os.O_WRONLY, 0o600)
                os.write(fd, (self.token + "\n").encode("utf-8"))
                os.close(fd)
            except IOError:
                pass

        prep = r.request.copy()
        prep.headers["Authorization"] = self.auth_header()
        _r = r.connection.send(prep, **kwargs)
        _r.history.append(r)
        _r.request = prep
        return _r
