'use client'

import { useEffect, useState } from 'react'
import { BirthChartData, RASHI_NAMES } from '@/lib/astrology/calculations'

interface ChartVisualizationProps {
  chartData: BirthChartData
}

export default function ChartVisualization({ chartData }: ChartVisualizationProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)

  // Calculate which planets are in which houses
  const getHouseContents = () => {
    const houses: { [key: number]: string[] } = {}
    
    // Initialize all 12 houses
    for (let i = 1; i <= 12; i++) {
      houses[i] = []
    }

    // Ascendant determines house 1
    const ascendantRashi = chartData.Ascendant.rashiNumber

    // Place each planet in its house
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
    
    planets.forEach(planet => {
      const planetData = chartData[planet as keyof BirthChartData] as any
      const planetRashi = planetData.rashiNumber
      
      // Calculate house number relative to ascendant
      let house = planetRashi - ascendantRashi + 1
      if (house <= 0) house += 12
      
      houses[house].push(planet)
    })

    return houses
  }

  const houses = getHouseContents()

  // Get short name and symbol for planets
  const getShortName = (planet: string) => {
    const shortNames: { [key: string]: string } = {
      'Sun': '☉',        // Sun symbol
      'Moon': '☽',       // Moon symbol
      'Mercury': '☿',    // Mercury symbol
      'Venus': '♀',      // Venus symbol
      'Mars': '♂',       // Mars symbol
      'Jupiter': '♃',    // Jupiter symbol
      'Saturn': '♄',     // Saturn symbol
      'Rahu': 'Ra',      // Rahu (North Node)
      'Ketu': 'Ke'       // Ketu (South Node)
    }
    return shortNames[planet] || planet.substring(0, 2)
  }

  // D1 Chart (North Indian Style) Layout
  const renderNorthIndianChart = () => {
    const ascendantRashi = chartData.Ascendant.rashiNumber

    // Fixed house coordinates matching Python D1.py logic
    // These represent the 12 sections in the North Indian diamond chart
    const fixedCoords = [
      { x: 200, y: 70 },   // Position 1 (center top)
      { x: 290, y: 70 },   // Position 2 (top right)
      { x: 330, y: 110 },  // Position 3 (right top)
      { x: 330, y: 200 },  // Position 4 (right center)
      { x: 330, y: 290 },  // Position 5 (right bottom)
      { x: 290, y: 330 },  // Position 6 (bottom right)
      { x: 200, y: 330 },  // Position 7 (center bottom)
      { x: 110, y: 330 },  // Position 8 (bottom left)
      { x: 70, y: 290 },   // Position 9 (left bottom)
      { x: 70, y: 200 },   // Position 10 (left center)
      { x: 70, y: 110 },   // Position 11 (left top)
      { x: 110, y: 70 },   // Position 12 (top left)
    ]

    // Calculate rotation based on Ascendant (following D1.py logic)
    // index = 12 - house1 + 1
    const rotationIndex = (12 - ascendantRashi + 1) % 12

    // Reorder coordinates: coords[index:] + coords[:index]
    const reorderedCoords = [
      ...fixedCoords.slice(rotationIndex),
      ...fixedCoords.slice(0, rotationIndex)
    ]

    return (
      <div className="relative w-full max-w-md mx-auto aspect-square">
        {/* SVG Chart */}
        <svg viewBox="0 0 400 400" className="w-full h-full" style={{ backgroundColor: 'white' }}>
          {/* Outer square */}
          <rect x="10" y="10" width="380" height="380" fill="white" stroke="black" strokeWidth="2" />
          
          {/* Diagonal lines forming the diamond */}
          <line x1="10" y1="10" x2="390" y2="390" stroke="black" strokeWidth="2" />
          <line x1="390" y1="10" x2="10" y2="390" stroke="black" strokeWidth="2" />
          
          {/* Horizontal and vertical center lines */}
          <line x1="200" y1="10" x2="200" y2="390" stroke="black" strokeWidth="2" />
          <line x1="10" y1="200" x2="390" y2="200" stroke="black" strokeWidth="2" />

          {/* House numbers and planets - Rendered using reordered coordinates */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((houseNum) => {
            const coord = reorderedCoords[houseNum - 1]
            const planetsInHouse = houses[houseNum]
            
            return (
              <g key={houseNum}>
                {/* House number */}
                <text 
                  x={coord.x} 
                  y={coord.y} 
                  textAnchor="middle" 
                  fill="black" 
                  fontSize="16" 
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                >
                  {houseNum}
                </text>
                
                {/* ASC label for house 1 */}
                {houseNum === 1 && (
                  <text 
                    x={coord.x} 
                    y={coord.y + 15} 
                    textAnchor="middle" 
                    fill="black" 
                    fontSize="10"
                    fontFamily="Arial, sans-serif"
                  >
                    ASC
                  </text>
                )}
                
                {/* Planets in this house */}
                {planetsInHouse.map((planet, i) => {
                  const planetData = chartData[planet as keyof BirthChartData] as any
                  const deg = Math.floor(planetData.degreeInRashi)
                  const min = Math.floor((planetData.degreeInRashi - deg) * 60)
                  
                  return (
                    <text
                      key={planet}
                      x={coord.x}
                      y={coord.y + (houseNum === 1 ? 30 : 20) + i * 16}
                      textAnchor="middle"
                      fill="black"
                      fontSize="11"
                      fontWeight="500"
                      fontFamily="Arial, sans-serif"
                      className="cursor-pointer hover:font-bold"
                      onClick={() => setSelectedPlanet(planet)}
                      style={{ transition: 'all 0.2s' }}
                    >
                      {getShortName(planet)} {deg}°{min}'
                    </text>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chart Title */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Birth Chart (D1)</h3>
        <p className="text-purple-200/60 text-sm">North Indian Style - Vedic Astrology</p>
      </div>

      {/* Chart Visualization */}
      <div className="bg-white rounded-2xl p-8 border-2 border-gray-300 shadow-xl">
        {renderNorthIndianChart()}
      </div>

      {/* Planet Details */}
      {selectedPlanet && (
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-3">{selectedPlanet} Details</h4>
          {(() => {
            const planetData = chartData[selectedPlanet as keyof BirthChartData] as any
            return (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-purple-200/60">Sign:</span>
                  <span className="text-white ml-2 font-medium">{planetData.rashiName}</span>
                </div>
                <div>
                  <span className="text-purple-200/60">Degree:</span>
                  <span className="text-white ml-2 font-medium">{planetData.degreeInRashi.toFixed(2)}°</span>
                </div>
                <div>
                  <span className="text-purple-200/60">Nakshatra:</span>
                  <span className="text-white ml-2 font-medium">{planetData.nakshatraName}</span>
                </div>
                <div>
                  <span className="text-purple-200/60">Longitude:</span>
                  <span className="text-white ml-2 font-medium">{planetData.longitude.toFixed(2)}°</span>
                </div>
              </div>
            )
          })()}
          <button
            onClick={() => setSelectedPlanet(null)}
            className="mt-3 text-purple-300 hover:text-white text-sm transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Planetary Positions Table */}
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
        <h4 className="text-lg font-semibold text-white mb-3">Planetary Positions</h4>
        <div className="space-y-2">
          {['Ascendant', 'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'].map(planet => {
            const planetData = chartData[planet as keyof BirthChartData] as any
            return (
              <div
                key={planet}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setSelectedPlanet(planet)}
              >
                <span className="text-white font-medium">{planet}</span>
                <span className="text-purple-200/80 text-sm">{planetData.formatted}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Calculation Info */}
      <div className="text-center text-xs text-purple-200/40">
        <p>Ayanamsa: {chartData.ayanamsa.toFixed(4)}°</p>
        <p>Calculated: {new Date(chartData.calculatedAt).toLocaleString()}</p>
      </div>
    </div>
  )
}
