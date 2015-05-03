#!/bin/bash

# Move the launch script
cp launch.sh ~/launch.sh
chmod 755 ~/launch.sh

# Make log folder
mkdir ~/logs

# Add to crontab
line="@reboot sh /home/pi/launcher.sh >/home/pi/logs/cronlog 2>&1"
(crontab -u pi -l; echo "$line" ) | crontab -u pi -