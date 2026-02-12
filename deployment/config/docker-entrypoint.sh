#!/bin/sh
cat <<EOF > /usr/share/nginx/html/env.js
window.__ENV__ = {
  VITE_APP_API_BASE_URL: "${VITE_APP_API_BASE_URL}",
}
EOF

exec nginx -g 'daemon off;'