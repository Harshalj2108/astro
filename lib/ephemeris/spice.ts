/**
 * SPICE Ephemeris Integration (Alternative Backend)
 * 
 * Provides offline, high-accuracy ephemeris using NAIF SPICE kernels.
 * This is a documentation/stub file - actual implementation requires
 * either Python microservice with spiceypy or Node.js wrapper.
 * 
 * SETUP INSTRUCTIONS:
 * 
 * Option 1: Python Microservice (Recommended)
 * -------------------------------------------
 * 1. Install spiceypy: pip install spiceypy
 * 2. Download SPICE kernels:
 *    - Leap seconds: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/naif0012.tls
 *    - Planetary ephemeris: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de440.bsp
 *    - Save to: ./spice_kernels/
 * 3. Create Python service (see spice-service.py below)
 * 4. Run: python spice-service.py
 * 5. Set environment: SPICE_SERVICE_URL=http://localhost:5000
 * 
 * Option 2: Node.js (Experimental)
 * ---------------------------------
 * 1. Use js-spice wrapper (if available)
 * 2. Or call Python subprocess (slower)
 * 
 * KERNEL FILES NEEDED:
 * - naif0012.tls (leap seconds)
 * - de440.bsp or de441.bsp (planetary ephemeris)
 * - Optional: pck00010.tpc (physical constants)
 */

export interface SpiceConfig {
  kernelPath: string
  serviceUrl?: string // For microservice approach
}

/**
 * SPICE body ID codes (NAIF)
 */
export const SPICE_BODY_IDS = {
  SUN: 10,
  MOON: 301,
  MERCURY: 199,
  VENUS: 299,
  MARS: 499,
  JUPITER: 599,
  SATURN: 699,
  URANUS: 799,
  NEPTUNE: 899,
  PLUTO: 999,
  EARTH: 399,
} as const

/**
 * Fetch position from SPICE microservice
 */
export async function fetchSpicePosition(
  bodyId: number,
  jd: number,
  observer: number = SPICE_BODY_IDS.EARTH,
  frame: string = 'ECLIPJ2000'
): Promise<{ x: number; y: number; z: number; vx: number; vy: number; vz: number }> {
  const serviceUrl = process.env.SPICE_SERVICE_URL || 'http://localhost:5000'
  
  const response = await fetch(`${serviceUrl}/position`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target: bodyId,
      observer,
      jd,
      frame
    })
  })
  
  if (!response.ok) {
    throw new Error(`SPICE service error: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  return data
}

/**
 * Python SPICE microservice implementation
 * Save as: spice-service.py
 */
export const PYTHON_SPICE_SERVICE = `
#!/usr/bin/env python3
"""
SPICE Ephemeris Microservice
Provides planetary positions using NAIF SPICE kernels
"""

from flask import Flask, request, jsonify
import spiceypy as spice
import os

app = Flask(__name__)

# Load SPICE kernels
KERNEL_DIR = os.environ.get('SPICE_KERNEL_DIR', './spice_kernels')

kernels_loaded = False

def load_kernels():
    global kernels_loaded
    if kernels_loaded:
        return
    
    try:
        # Load leap seconds kernel
        spice.furnsh(os.path.join(KERNEL_DIR, 'naif0012.tls'))
        
        # Load planetary ephemeris
        de_kernel = os.path.join(KERNEL_DIR, 'de440.bsp')
        if not os.path.exists(de_kernel):
            de_kernel = os.path.join(KERNEL_DIR, 'de441.bsp')
        spice.furnsh(de_kernel)
        
        kernels_loaded = True
        print(f"✓ Loaded SPICE kernels from {KERNEL_DIR}")
        
    except Exception as e:
        print(f"ERROR loading kernels: {e}")
        print(f"Make sure kernels are in {KERNEL_DIR}/")
        raise

def jd_to_et(jd):
    """Convert Julian Day to Ephemeris Time (TDB)"""
    # JD 2451545.0 = J2000 epoch = 2000-01-01 12:00:00 TDB
    # ET is seconds past J2000
    return (jd - 2451545.0) * 86400.0

@app.route('/position', methods=['POST'])
def get_position():
    """
    Get position and velocity of body
    
    POST /position
    {
        "target": 199,        // NAIF body ID
        "observer": 399,      // Observer (Earth)
        "jd": 2451545.0,      // Julian Day
        "frame": "ECLIPJ2000" // Reference frame
    }
    """
    try:
        load_kernels()
        
        data = request.get_json()
        target = data['target']
        observer = data['observer']
        jd = data['jd']
        frame = data.get('frame', 'ECLIPJ2000')
        
        # Convert JD to Ephemeris Time
        et = jd_to_et(jd)
        
        # Get state vector (position + velocity)
        # spkezr returns [x, y, z, vx, vy, vz] and light-time
        state, lt = spice.spkezr(
            str(target),
            et,
            frame,
            'LT+S',  # Light-time + stellar aberration
            str(observer)
        )
        
        return jsonify({
            'x': state[0],
            'y': state[1],
            'z': state[2],
            'vx': state[3],
            'vy': state[4],
            'vz': state[5],
            'jd': jd,
            'lightTime': lt
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        load_kernels()
        return jsonify({'status': 'ok', 'kernels_loaded': kernels_loaded})
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting SPICE service on port {port}")
    print(f"Kernel directory: {KERNEL_DIR}")
    app.run(host='0.0.0.0', port=port, debug=False)
`

/**
 * Bash script to download SPICE kernels
 * Save as: download-spice-kernels.sh
 */
export const DOWNLOAD_KERNELS_SCRIPT = `
#!/bin/bash
# Download SPICE kernels for planetary ephemeris

KERNEL_DIR="./spice_kernels"
mkdir -p "$KERNEL_DIR"

echo "Downloading SPICE kernels to $KERNEL_DIR..."

# Leap seconds kernel (required)
echo "→ Downloading leap seconds kernel..."
curl -o "$KERNEL_DIR/naif0012.tls" \\
  https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/naif0012.tls

# Planetary ephemeris DE440 (smaller, recommended for 1550-2650)
echo "→ Downloading DE440 planetary ephemeris..."
curl -o "$KERNEL_DIR/de440.bsp" \\
  https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de440.bsp

# OR: DE441 (larger, covers 13000 BCE - 17000 CE)
# echo "→ Downloading DE441 planetary ephemeris..."
# curl -o "$KERNEL_DIR/de441.bsp" \\
#   https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de441.bsp

echo "✓ Kernels downloaded successfully"
echo "Total size:"
du -sh "$KERNEL_DIR"
`

/**
 * Docker configuration for SPICE service
 */
export const DOCKER_SPICE_SERVICE = `
# Dockerfile for SPICE microservice

FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install flask spiceypy

# Copy service
COPY spice-service.py .
COPY spice_kernels/ ./spice_kernels/

# Expose port
EXPOSE 5000

# Run service
CMD ["python", "spice-service.py"]
`

/**
 * Instructions for deploying SPICE service
 */
export const DEPLOYMENT_INSTRUCTIONS = `
SPICE SERVICE DEPLOYMENT
========================

Local Development:
------------------
1. chmod +x download-spice-kernels.sh
2. ./download-spice-kernels.sh
3. pip install flask spiceypy
4. python spice-service.py
5. Test: curl http://localhost:5000/health

Docker:
-------
1. docker build -t spice-service .
2. docker run -p 5000:5000 spice-service

Environment Variables:
----------------------
SPICE_SERVICE_URL=http://localhost:5000  # URL of SPICE service
SPICE_KERNEL_DIR=./spice_kernels         # Path to kernel files
EPHEMERIS_BACKEND=SPICE                  # Use SPICE backend

Usage from Node.js:
-------------------
import { fetchSpicePosition } from './lib/ephemeris/spice'

const position = await fetchSpicePosition(
  199,        // Mercury
  2451545.0,  // J2000 epoch
  399,        // Observer: Earth
  'ECLIPJ2000' // Ecliptic frame
)

console.log(position) // { x, y, z, vx, vy, vz }
`
