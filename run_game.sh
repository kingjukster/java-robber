#!/usr/bin/env bash

# setup.sh
# A script to ensure Node dependencies are installed, then run the game.

# 1) If you need a package.json
# echo "Initializing Node.js project..."
# npm init -y

# 2) Install any needed dependencies
# echo "Installing Express..."
# npm install express

# echo "Installing OracleDB..."
# npm install oracledb

# echo "Installing ESLint and Prettier..."
# npm install --save-dev eslint prettier

echo "Installing all dependencies from package.json (if any exist)..."
npm install

# 3) Finally, run your server
echo "Running the game with node ./backend/routes/server.js"
node ./backend/routes/server.js
