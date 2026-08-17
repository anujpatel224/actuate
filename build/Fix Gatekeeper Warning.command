#!/bin/bash
# Clears the macOS quarantine flag that makes this unsigned build show up as
# "damaged" in Gatekeeper. Double-click this file after dragging Actuate.app
# into /Applications.
set -e

APP="/Applications/Actuate.app"

if [ ! -d "$APP" ]; then
  osascript -e 'display alert "Actuate.app not found in /Applications" message "Drag Actuate.app into your Applications folder first, then double-click this script again." as critical'
  exit 1
fi

xattr -cr "$APP"

osascript -e 'display notification "You can now open Actuate normally from Applications or Launchpad." with title "Gatekeeper flag cleared"'
