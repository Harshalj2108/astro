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

  // Get short name for planets
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

    // House layout in North Indian style
    const houseLayout = [
      [12, 1], [2],
      [11],    [3],
      [10],    [4],
      [9, 8],  [7, 6, 5]
    ]

    return (
      <div className="relative w-full max-w-md mx-auto aspect-square">
        {/* SVG Chart */}
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Outer square */}
          <rect x="10" y="10" width="380" height="380" fill="none" stroke="#8b5cf6" strokeWidth="3" />
          
          {/* Diagonal lines */}
          <line x1="10" y1="10" x2="390" y2="390" stroke="#8b5cf6" strokeWidth="2" />
          <line x1="390" y1="10" x2="10" y2="390" stroke="#8b5cf6" strokeWidth="2" />
          
          {/* Horizontal and vertical center lines */}
          <line x1="200" y1="10" x2="200" y2="390" stroke="#8b5cf6" strokeWidth="2" />
          <line x1="10" y1="200" x2="390" y2="200" stroke="#8b5cf6" strokeWidth="2" />

          {/* House numbers and planets */}
          {/* House 1 (Ascendant) - Top center */}
          <g>
            <text x="200" y="90" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
              {ascendantRashi}
            </text>
            <text x="200" y="110" textAnchor="middle" fill="#e9d5ff" fontSize="10">
              ASC
            </text>
            {houses[1].map((planet, i) => (
              <text
                key={planet}
                x="200"
                y={130 + i * 18}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="12"
                fontWeight="600"
                className="cursor-pointer hover:fill-yellow-300"
                onClick={() => setSelectedPlanet(planet)}
              >
                {getShortName(planet)}
              </text>
            ))}
          </g>

          {/* House 2 - Top right */}
          <g>
            <text x="310" y="90" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
              {(ascendantRashi % 12) + 1}
            </text>
            {houses[2].map((planet, i) => (
              <text
                key={planet}
                x="310"
                y={110 + i * 18}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="12"
                fontWeight="600"
                className="cursor-pointer hover:fill-yellow-300"
                onClick={() => setSelectedPlanet(planet)}
              >
                {getShortName(planet)}
              </text>
            ))}
          </g>

          {/* House 3 - Right top */}
          <g>
            <text x="310" y="150" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
              {((ascendantRashi + 1) % 12) + 1}
            </text>
            {houses[3].map((planet, i) => (
              <text
                key={planet}
                x="310"
                y={170 + i * 18}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="12"
                fontWeight="600"
                className="cursor-pointer hover:fill-yellow-300"
                onClick={() => setSelectedPlanet(planet)}
              >
                {getShortName(planet)}
              </text>
            ))}
          </g>

          {/* House 4 - Right bottom */}
          <g>
            <text x="310" y="240" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
              {((ascendantRashi + 2) % 12) + 1}
            </text>
            {houses[4].map((planet, i) => (
              <text
                key={planet}
                x="310"
                y={260 + i * 18}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="12"
                fontWeight="600"
                className="cursor-pointer hover:fill-yellow-300"
                onClick={() => setSelectedPlanet(planet)}
              >
                {getShortName(planet)}
              </text>
            ))}
          </g>

          {/* House 5 - Bottom right */}
          <g>
            <text x="310" y="330" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
              {((ascendantRashi + 3) % 12) + 1}
            </text>
            {houses[5].map((planet, i) => (
              <text
                key={planet}
                x="310"
                y={350 + i * 18}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="12"
                fontWeight="600"
                className="cursor-pointer hover:fill-yellow-300"
                onClick={() => setSelectedPlanet(planet)}
              >
                {getShortName(planet)}
              </text>
            ))}
          </g>

          {/* House 6 - Bottom center right */}
          <g>
            <text x="255" y="330" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
              {((ascendantRashi + 4) % 12) + 1}
            </text>
            {houses[6].map((planet, i) => (
              <text
                key={planet}
                x="255"
                y={350 + i * 18}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="12"
                fontWeight="600"
                className="cursor-pointer hover:fill-yellow-300"
                onClick={() => setSelectedPlanet(planet)}
              >
                {getShortName(planet)}
              </text>
            ))}
          </g>

          {/* House 7 - Bottom center */}
          <g>
            <text x="200" y="330" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
              {((ascendantRashi + 5) % 12) + 1}
            </text>
            {houses[7].map((planet, i) => (
              <text
                key={planet}
                x="200"
                y={350 + i * 18}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="12"
                fontWeight="600"
                className="cursor-pointer hover:fill-yellow-300"
                onClick={() => setSelectedPlanet(planet)}
              >
                {getShortName(planet)}
              </text>
            ))}
          </g>

          {/* House 8 - Bottom center left */}
          <g>
            <text x="145" y="330" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
              {((ascendantRashi + 6) % 12) + 1}
            </text>
            {houses[8].map((planet, i) => (
              <text
                key={planet}
                x="145"
                y={350 + i * 18}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="12"
                fontWeight="600"
                className="cursor-pointer hover:fill-yellow-300"
                onClick={() => setSelectedPlanet(planet)}
              >
                {getShortName(planet)}
              </text>
            ))}
          </g>

          {/* House 9 - Bottom left */}
          <g>
            <text x="90" y="330" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
              {((ascendantRashi + 7) % 12) + 1}
            </text>
            {houses[9].map((planet, i) => (
              <text
                key={planet}
                x="90"
                y={350 + i * 18}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="12"
                fontWeight="600"
                className="cursor-pointer hover:fill-yellow-300"
                onClick={() => setSelectedPlanet(planet)}
              >
                {getShortName(planet)}
              </text>
            ))}
          </g>

          {/* House 10 - Left bottom */}
          <g>
            <text x="90" y="260" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
              {((ascendantRashi + 8) % 12) + 1}
            </text>
            {houses[10].map((planet, i) => (
              <text
                key={planet}
                x="90"
                y={280 + i * 18}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="12"
                fontWeight="600"
                className="cursor-pointer hover:fill-yellow-300"
                onClick={() => setSelectedPlanet(planet)}
              >
                {getShortName(planet)}
              </text>
            ))}
          </g>

          {/* House 11 - Left top */}
          <g>
            <text x="90" y="170" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
              {((ascendantRashi + 9) % 12) + 1}
            </text>
            {houses[11].map((planet, i) => (
              <text
                key={planet}
                x="90"
                y={190 + i * 18}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="12"
                fontWeight="600"
                className="cursor-pointer hover:fill-yellow-300"
                onClick={() => setSelectedPlanet(planet)}
              >
                {getShortName(planet)}
              </text>
            ))}
          </g>

          {/* House 12 - Top left */}
          <g>
            <text x="90" y="90" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">
              {((ascendantRashi + 10) % 12) + 1}
            </text>
            {houses[12].map((planet, i) => (
              <text
                key={planet}
                x="90"
                y={110 + i * 18}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="12"
                fontWeight="600"
                className="cursor-pointer hover:fill-yellow-300"
                onClick={() => setSelectedPlanet(planet)}
              >
                {getShortName(planet)}
              </text>
            ))}
          </g>
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chart Title */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Birth Chart (D1)</h3>
        <p className="text-purple-200/60 text-sm">North Indian Style</p>
      </div>

      {/* Chart Visualization */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
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
