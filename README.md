# Rotating Globe Three.js

A stunning 3D rotating Earth visualization built with Three.js, featuring realistic day/night cycles, atmospheric effects, and interactive controls.

## ✨ Features

- 🌍 **Realistic Earth Rendering**: Day and night textures with smooth transitions
- 🌌 **Atmospheric Effects**: Glowing atmosphere with sun-based lighting
- ⭐ **Starfield Background**: 15,000 twinkling stars with realistic colors
- 🎮 **Interactive Controls**: Hover-based zoom and orbital rotation
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Clean, gradient-based interface design

## 📁 Project Structure

```
rotating-globe-threejs/
├── standalone/                 # 🚀 Vanilla JavaScript Version
│   ├── index.html             # Main HTML file
│   ├── globe.js               # Three.js implementation
│   ├── serve.py               # Local development server
│   └── assets/                # Earth texture files
│       ├── earth-day.jpg      # Day texture
│       └── earth-night.jpg    # Night texture
│
├── nextjs-component/          # ⚛️ React/Next.js Version
│   ├── components/            # React components
│   ├── app/                   # Next.js app router
│   ├── public/textures/       # Textures for Next.js
│   └── package.json           # Dependencies
│
└── README.md                  # This file
```

## 🚀 Usage Options

### Option 1: Standalone JavaScript (Recommended for Beginners)

**Quick Start:**
```bash
cd standalone/
python3 serve.py
```
Opens automatically at: http://localhost:8000

**Why use the server?** Opening `index.html` directly causes CORS errors. The Python server fixes this.

**Alternative servers:**
```bash
# Node.js
npx http-server -p 8000 -o

# PHP  
php -S localhost:8000

# VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

### Option 2: React/Next.js Components

**For existing React projects:**
1. Copy components from `nextjs-component/components/`
2. Install: `npm install three @types/three lucide-react`
3. Add textures to your `public/textures/` folder
4. Import: `import GlobeRenderer from './components/GlobeRenderer'`

**For new Next.js project:**
```bash
cd nextjs-component/
npm install
npm run dev
```
Opens at: http://localhost:3000

## 🌍 Earth Textures Setup

**Required Files:**
- `earth-day.jpg` - Day texture (continents, oceans, clouds)
- `earth-night.jpg` - Night texture (city lights, auroras)

**Where to place them:**
- **Standalone**: `standalone/assets/` folder
- **Next.js**: `nextjs-component/public/textures/` folder

**Specifications:**
- Format: JPG (recommended) or PNG
- Resolution: 4096×2048 or higher for best quality
- Projection: Equirectangular (360° × 180°)
- Aspect Ratio: 2:1 (width = 2 × height)

**Free Sources:**
- **NASA Visible Earth**: https://visibleearth.nasa.gov/
  - Search: "Blue Marble" (day texture)
  - Search: "Earth at Night" (night texture)
- **Alternative**: Search "earth texture 4K equirectangular" online

**No textures?** The globe works with fallback gradient colors (just looks less realistic).

## 🛠️ Technical Details

- **Engine**: Three.js r128+ with WebGL 2.0
- **Rendering**: Custom shaders for realistic day/night transitions
- **Lighting**: Directional sun light + ambient + rim lighting
- **Physics**: Gentle floating animation with earth rotation
- **Controls**: Custom orbit controls with hover-based zoom restrictions
- **Performance**: Optimized for 60fps on modern devices
- **Stars**: 15,000 procedurally generated twinkling background stars

## 🎨 Customization

**JavaScript version** (`standalone/globe.js`):
```javascript
// Animation speeds
globe.rotation.y += 0.002;        // Earth rotation speed
const amplitude = 0.04;           // Floating animation
const frequency = 0.25;           // Floating speed

// Zoom limits
controls.minDistance = 8;         // Closest zoom
controls.maxDistance = 30;        // Furthest zoom

// Star count and effects
for (let i = 0; i < 15000; i++)   // Number of stars
starMaterial.opacity = 0.75;      // Star brightness
```

**React version** (`nextjs-component/components/GlobeRenderer.tsx`):
- Same customizations as JavaScript version
- Plus: React props, state management, and component lifecycle

## 🔧 Troubleshooting

**CORS Error (Standalone)**
```
❌ "Cross origin requests are only supported for protocol schemes..."
✅ Solution: Use python3 serve.py instead of opening index.html directly
```

**Textures Not Loading**
```
❌ Images show as solid colors
✅ Check: Correct file paths and names (case-sensitive)
✅ Check: Files exist in assets/ or public/textures/ folders
✅ Check: Using http:// server, not file:// protocol
```

**Performance Issues**
```
❌ Low FPS or laggy animation
✅ Reduce texture resolution (2048×1024 instead of 4096×2048)
✅ Reduce star count (edit the 15000 value in code)
✅ Check browser hardware acceleration is enabled
```

## 🏗️ Development & Contributing

**Structure:**
- `standalone/` - Pure JavaScript implementation
- `nextjs-component/` - React/TypeScript implementation
- Both versions share the same Three.js core logic

**Local development:**
```bash
# Standalone
cd standalone && python3 serve.py

# Next.js  
cd nextjs-component && npm run dev
```

**Contributing:**
1. Fork the repository
2. Create feature branch: `git checkout -b my-feature`
3. Test both standalone and Next.js versions
4. Submit a pull request

## 📄 License

**MIT License with Attribution Required**

Copyright (c) 2025 Buddhsen Tripathi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

**Attribution Required**: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. Additionally, any project using this code must include visible attribution to the original author.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## 🙏 Credits & Acknowledgments

- **Three.js** - 3D graphics library that makes this possible
- **NASA Visible Earth** - Free Earth texture references
- **WebGL Community** - Inspiration from various globe implementations
- **Contributors** - Everyone who improves this project

**⭐ If you use this project, please:**
1. Give credit to the original author
2. Star this repository if it helped you
3. Consider contributing improvements back

Made with 💙 by [Buddhsen Tripathi](https://github.com/Buddhsen-tripathi)