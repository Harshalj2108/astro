'use client'

import { useEffect, useState } from 'react'
import { BirthChartData, RASHI_NAMES } from '@/lib/astrology/calculations'

interface ChartVisualizationProps {
  chartData: BirthChartData
}

export default function ChartVisualization({ chartData }: ChartVisualizationProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null)

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

  // Get short name abbreviation for planets
  const getShortName = (planet: string) => {
    const shortNames: { [key: string]: string } = {
      'Sun': 'Su',
      'Moon': 'Mo',
      'Mercury': 'Me',
      'Venus': 'Ve',
      'Mars': 'Ma',
      'Jupiter': 'Ju',
      'Saturn': 'Sa',
      'Rahu': 'Ra',
      'Ketu': 'Ke'
    }
    return shortNames[planet] || planet.substring(0, 2)
  }

  // D1 Chart (North Indian Style) Layout
  const renderNorthIndianChart = () => {
    const ascendantRashi = chartData.Ascendant.rashiNumber

    // North Indian Chart Layout (Counter-Clockwise from House 1 at top center)
    // Fixed positions for the 12 houses in the diamond layout
    const housePositions = [
      { x: 200, y: 110, name: '1' },    // House 1 - Top center (Lagna)
      { x: 100, y: 65, name: '2' },    // House 2 - Top left
      { x: 45, y: 120, name: '3' },    // House 3 - Left top
      { x: 100, y: 210, name: '4' },    // House 4 - Left center
      { x: 45, y: 310, name: '5' },    // House 5 - Left bottom
      { x: 100, y: 350, name: '6' },   // House 6 - Bottom left
      { x: 200, y: 310, name: '7' },   // House 7 - Bottom center
      { x: 300, y: 350, name: '8' },   // House 8 - Bottom right
      { x: 350, y: 310, name: '9' },   // House 9 - Right bottom
      { x: 300, y: 210, name: '10' },  // House 10 - Right center
      { x: 350, y: 120, name: '11' },  // House 11 - Right top
      { x: 295, y: 65, name: '12' },   // House 12 - Top right
    ]

    // Calculate which sign (rashi) is in each house
    // House 1 contains the Ascendant sign, then counter-clockwise
    const getSignInHouse = (houseNum: number) => {
      return ((ascendantRashi + houseNum - 2) % 12) + 1
    }

    // Group planets by their sign (rashi)
    const planetsBySign: { [key: number]: Array<{ name: string, degree: number, minute: number }> } = {}
    
    for (let i = 1; i <= 12; i++) {
      planetsBySign[i] = []
    }

    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
    planets.forEach(planet => {
      const planetData = chartData[planet as keyof BirthChartData] as any
      const sign = planetData.rashiNumber
      const deg = Math.floor(planetData.degreeInRashi)
      const min = Math.floor((planetData.degreeInRashi - deg) * 60)
      
      planetsBySign[sign].push({ name: planet, degree: deg, minute: min })
    })

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
          <line x1="200" y1="10" x2="390" y2="200" stroke="black" strokeWidth="2" />
          <line x1="200" y1="10" x2="10" y2="200" stroke="black" strokeWidth="2" />
          <line x1="10" y1="200" x2="200" y2="390" stroke="black" strokeWidth="2" />
          <line x1="200" y1="390" x2="390" y2="200" stroke="black" strokeWidth="2" />

          {/* Render each house with sign number and planets */}
          {housePositions.map((house, index) => {
            const houseNum = index + 1
            const signInHouse = getSignInHouse(houseNum)
            const planetsInSign = planetsBySign[signInHouse]
            
            return (
              <g 
                key={houseNum}
                className="cursor-pointer"
                style={{ transition: 'all 0.3s' }}
                onClick={() => setSelectedHouse(houseNum)}
              >
                {/* Invisible hover area for the entire house */}
                <rect
                  x={house.x - 40}
                  y={house.y - 40}
                  width="80"
                  height="80"
                  fill={selectedHouse === houseNum ? "#f3e8ff" : "transparent"}
                  className="hover:fill-purple-50"
                  style={{ transition: 'all 0.3s' }}
                />
                
                {/* Rashi number in center (large, bold) */}
                <text 
                  x={house.x} 
                  y={house.y} 
                  textAnchor="middle" 
                  fill="black" 
                  fontSize="20" 
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                  className="pointer-events-none"
                >
                  {signInHouse}
                </text>
                
                {/* ASC label for house 1 */}
                {houseNum === 1 && (
                  <text 
                    x={house.x} 
                    y={house.y + 20} 
                    textAnchor="middle" 
                    fill="#d97706" 
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    className="pointer-events-none"
                  >
                    ASC
                  </text>
                )}
                
                {/* Planets arranged around the rashi number */}
                {planetsInSign.map((planet, i) => {
                  // Position planets in a circle around the center
                  const numPlanets = planetsInSign.length
                  const radius = 30
                  const angleStep = (2 * Math.PI) / Math.max(numPlanets, 4)
                  const angle = i * angleStep - Math.PI / 2 // Start from top
                  
                  const planetX = house.x + radius * Math.cos(angle)
                  const planetY = house.y + radius * Math.sin(angle)
                  
                  return (
                    <text
                      key={planet.name}
                      x={planetX}
                      y={planetY + 4}
                      textAnchor="middle"
                      fill="#0369a1"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="Arial, sans-serif"
                      className="cursor-pointer hover:font-bold pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPlanet(planet.name)
                      }}
                      style={{ transition: 'all 0.2s' }}
                    >
                      {getShortName(planet.name)}
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

      {/* House Details */}
      {selectedHouse && (
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-3">House {selectedHouse} Details</h4>
          {(() => {
            const ascendantRashi = chartData.Ascendant.rashiNumber
            const signInHouse = ((ascendantRashi + selectedHouse - 2) % 12) + 1
            const signName = RASHI_NAMES[signInHouse - 1]
            
            // Get planets in this house
            const planetsInHouse = houses[selectedHouse] || []
            
            return (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-purple-200/60">Sign:</span>
                  <span className="text-white ml-2 font-medium">{signName} ({signInHouse})</span>
                </div>
                <div>
                  <span className="text-purple-200/60">Planets:</span>
                  <span className="text-white ml-2 font-medium">
                    {planetsInHouse.length > 0 
                      ? planetsInHouse.map(p => getShortName(p)).join(', ')
                      : 'Empty'}
                  </span>
                </div>
                {selectedHouse === 1 && (
                  <div className="text-amber-300 text-xs mt-2">
                    ⭐ Ascendant (Lagna) - Most important house
                  </div>
                )}
              </div>
            )
          })()}
          <button
            onClick={() => setSelectedHouse(null)}
            className="mt-3 text-purple-300 hover:text-white text-sm transition-colors"
          >
            Close
          </button>
        </div>
      )}

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
