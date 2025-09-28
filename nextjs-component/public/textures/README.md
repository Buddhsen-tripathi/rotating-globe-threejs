# Next.js Textures Directory

This directory contains the Earth textures for the Next.js version of the globe component.

## Required Files:
- `earth-day.jpg` - High resolution day texture of Earth
- `earth-night.jpg` - High resolution night texture showing city lights

## Path Usage:
- Next.js components will load textures from `/textures/` (relative to public folder)
- Files here are served statically by Next.js

## Installation:
1. Download Earth textures from NASA Visible Earth or other sources
2. Rename them to:
   - `earth-day.jpg`
   - `earth-night.jpg`
3. Place them in this directory

## Specifications:
- Format: JPG (recommended for file size)
- Resolution: 4096x2048 or higher
- Projection: Equirectangular (360° x 180°)
- Aspect Ratio: 2:1

The globe component includes fallback rendering if these textures are not found.