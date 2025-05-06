#!/bin/bash

echo "Installing dependencies with --legacy-peer-deps..."
npm install --force

echo "Running build..."
npm run build
