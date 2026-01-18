# justfile for kylesnowschwartz.github.io (Astro + GitHub Pages)

# Default: show available recipes
default:
    @just --list

# Start dev server
dev:
    npm run dev

# Start dev server and open in browser
dev-open:
    #!/usr/bin/env bash
    trap 'kill $(jobs -p) 2>/dev/null' EXIT
    npm run dev &
    sleep 2
    open http://localhost:4321
    wait

# Build for production
build:
    npm run build

# Preview production build locally
preview:
    npm run build && npm run preview

# Type-check the project
check:
    npx astro check

# Deploy to GitHub Pages (via git push)
deploy:
    git push origin main

# Clean build artifacts
clean:
    rm -rf dist .astro node_modules/.vite

# Fresh install and build
rebuild:
    rm -rf node_modules package-lock.json
    npm install
    npm run build

# Smoke test: build, preview, and curl all routes
smoke:
    #!/usr/bin/env bash
    npm run build
    npm run preview &
    trap 'pkill -f "astro preview" 2>/dev/null' EXIT
    sleep 2
    curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/ && echo " /"
    curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/marmiteroids/ && echo " /marmiteroids/"
    curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/bumper-lanes/ && echo " /bumper-lanes/"
    curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/worst-commish-ever/ && echo " /worst-commish-ever/"
    curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/marmiteroids/javascripts/application.js && echo " /marmiteroids/javascripts/application.js"
    curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/worst-commish-ever/images/stars.gif && echo " /worst-commish-ever/images/stars.gif"
