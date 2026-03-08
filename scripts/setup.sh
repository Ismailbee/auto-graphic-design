#!/bin/bash

# Design Editor Setup Script
echo "Setting up Design Editor project..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "Dependencies installed successfully!"
    
    # Start development server
    echo "Starting development server..."
    echo "The application will be available at http://localhost:5173"
    echo "Press Ctrl+C to stop the server"
    
    npm run dev
else
    echo "Failed to install dependencies. Please check the error messages above."
    echo "You can try running 'npm install' manually."
fi
