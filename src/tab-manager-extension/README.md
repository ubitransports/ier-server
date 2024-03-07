# Development workflow

## One-line way

`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --load-extension=~/Ubitransport/projects/ier-server/dist/tab-manager-extension`

## Manual way

- Access `chrome://extensions`
- Enable Developer Mode
- Load unpacked (from `~/Ubitransport/projects/ier-server/dist/tab-manager-extension`)

# Production workflow

`chromium --load-extension=dist/tab-manager-extension`
