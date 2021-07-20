#!/bin/sh
STATIC_DIR=./static

# Install dependencies
if [ ! -d "$STATIC_DIR/node_modules/" ]; then
    npm --prefix $STATIC_DIR install $STATIC_DIR
fi

# Run build script
npm run --prefix $STATIC_DIR build
