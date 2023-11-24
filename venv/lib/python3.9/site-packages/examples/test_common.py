import os
import sys

from egauge import webapi

#
# You can edit the values below directly or use environment variables
# EGDEV, EGUSR, and EGPWD to set the device URL, username, and
# password, respectively.
#
meter_dev = os.getenv("EGDEV", "http://egauge-dut")
meter_user = os.getenv("EGUSR", "dmo")
meter_password = os.getenv("EGPWD", "secret password")

dev = webapi.device.Device(
    meter_dev, webapi.JWTAuth(meter_user, meter_password)
)

# verify we can talk to the meter:
try:
    rights = dev.get("/auth/rights").get("rights", [])
except webapi.Error as e:
    print(f"Sorry, failed to connect to {meter_dev}: {e}")
    sys.exit(1)

print(f"Using meter {meter_dev} (user {meter_user}, rights={rights})")
