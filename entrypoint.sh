#!/bin/sh

# Ensure data directory has proper permissions for volume mounts
# This fixes the issue where volume mounts override container directory permissions
chmod 755 /app/data 2>/dev/null || true

# Execute the main command
exec "$@"
