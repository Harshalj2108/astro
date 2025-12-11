'use client'

/**
 * Standalone North Indian Vedic Astrology Chart
 * 
 * Data:
 * - Ascendant (Lagna): Sagittarius (Sign 9)
 * - Sun: 4°19' in Sagittarius (Sign 9)
 * - Moon: 8°08' in Scorpio (Sign 8)
 * - Mars: 14°0' in Capricorn (Sign 10)
 * - Mercury: 14°28' in Virgo (Sign 6)
 * - Jupiter: 28°39' in Aquarius (Sign 11)
 * - Venus: 22°10' in Libra (Sign 7)
 * - Saturn: 21°27' in Libra (Sign 7)
 * - Rahu: 2°45' in Cancer (Sign 4)
 * - Ketu: 2°45' in Capricorn (Sign 10)
 */

export default function StandaloneChart() {
  const ascendantSign = 9 // Sagittarius

  // North Indian Chart Layout (Counter-Clockwise from House 1 at top center)
  const housePositions = [
    { x: 200, y: 80, name: '1' },    // House 1 - Top center (Lagna)
    { x: 110, y: 80, name: '2' },    // House 2 - Top left
    { x: 70, y: 140, name: '3' },    // House 3 - Left top
    { x: 70, y: 200, name: '4' },    // House 4 - Left center
    { x: 70, y: 260, name: '5' },    // House 5 - Left bottom
    { x: 110, y: 320, name: '6' },   // House 6 - Bottom left
    { x: 200, y: 320, name: '7' },   // House 7 - Bottom center
    { x: 290, y: 320, name: '8' },   // House 8 - Bottom right
    { x: 330, y: 260, name: '9' },   // House 9 - Right bottom
    { x: 330, y: 200, name: '10' },  // House 10 - Right center
    { x: 330, y: 140, name: '11' },  // House 11 - Right top
    { x: 290, y: 80, name: '12' },   // House 12 - Top right
  ]

  // Planet data with sign positions
  const planets = [
    { name: 'Su', sign: 9, degree: 4, minute: 19 },    // Sun in Sagittarius
    { name: 'Mo', sign: 8, degree: 8, minute: 8 },     // Moon in Scorpio
    { name: 'Ma', sign: 10, degree: 14, minute: 0 },   // Mars in Capricorn
    { name: 'Me', sign: 6, degree: 14, minute: 28 },   // Mercury in Virgo
    { name: 'Ju', sign: 11, degree: 28, minute: 39 },  // Jupiter in Aquarius
    { name: 'Ve', sign: 7, degree: 22, minute: 10 },   // Venus in Libra
    { name: 'Sa', sign: 7, degree: 21, minute: 27 },   // Saturn in Libra
    { name: 'Ra', sign: 4, degree: 2, minute: 45 },    // Rahu in Cancer
    { name: 'Ke', sign: 10, degree: 2, minute: 45 },   // Ketu in Capricorn
  ]

  // Calculate which sign is in each house (counter-clockwise)
  const getSignInHouse = (houseNum: number) => {
    return ((ascendantSign + houseNum - 2) % 12) + 1
  }

  // Group planets by sign
  const planetsBySign: { [key: number]: typeof planets } = {}
  for (let i = 1; i <= 12; i++) {
    planetsBySign[i] = []
  }
  
  planets.forEach(planet => {
    planetsBySign[planet.sign].push(planet)
  })

  // Sign names
  const signNames = [
    '', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          North Indian Vedic Astrology Chart
        </h1>
        <p className="text-gray-600">
          Ascendant: Sagittarius (Sign 9) • Counter-Clockwise Layout
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-gray-200">
        <svg viewBox="0 0 400 400" className="w-[600px] h-[600px]">
          {/* Outer square */}
          <rect x="10" y="10" width="380" height="380" fill="white" stroke="black" strokeWidth="2.5" />
          
          {/* Diagonal lines forming the diamond */}
          <line x1="10" y1="10" x2="390" y2="390" stroke="black" strokeWidth="2.5" />
          <line x1="390" y1="10" x2="10" y2="390" stroke="black" strokeWidth="2.5" />
          
          {/* Horizontal and vertical center lines */}
          <line x1="200" y1="10" x2="200" y2="390" stroke="black" strokeWidth="2.5" />
          <line x1="10" y1="200" x2="390" y2="200" stroke="black" strokeWidth="2.5" />

          {/* Render each house */}
          {housePositions.map((house, index) => {
            const houseNum = index + 1
            const signInHouse = getSignInHouse(houseNum)
            const planetsInSign = planetsBySign[signInHouse] || []
            
            return (
              <g key={houseNum}>
                {/* House number (small, top-left corner) */}
                <text 
                  x={house.x - 25} 
                  y={house.y - 8} 
                  textAnchor="middle" 
                  fill="#666" 
                  fontSize="9" 
                  fontWeight="normal"
                  fontFamily="Arial, sans-serif"
                >
                  H{houseNum}
                </text>
                
                {/* Sign number (large, bold) */}
                <text 
                  x={house.x} 
                  y={house.y + 2} 
                  textAnchor="middle" 
                  fill="black" 
                  fontSize="20" 
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                >
                  {signInHouse}
                </text>
                
                {/* ASC label for house 1 */}
                {houseNum === 1 && (
                  <text 
                    x={house.x} 
                    y={house.y + 18} 
                    textAnchor="middle" 
                    fill="#d97706" 
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                  >
                    ASC
                  </text>
                )}
                
                {/* Planets in this sign */}
                {planetsInSign.map((planet, i) => (
                  <text
                    key={planet.name}
                    x={house.x}
                    y={house.y + (houseNum === 1 ? 35 : 22) + i * 14}
                    textAnchor="middle"
                    fill="#0369a1"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="Arial, sans-serif"
                  >
                    {planet.name} {planet.degree}°{planet.minute}'
                  </text>
                ))}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-200 max-w-3xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Chart Details</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Houses and Signs */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Houses → Signs (Counter-Clockwise)</h3>
            <div className="space-y-1 text-sm">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => {
                const sign = getSignInHouse(h)
                return (
                  <div key={h} className="flex justify-between">
                    <span className="text-gray-600">House {h}:</span>
                    <span className="font-medium">Sign {sign} ({signNames[sign]})</span>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Planets */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Planetary Positions</h3>
            <div className="space-y-1 text-sm">
              {planets.map(p => (
                <div key={p.name} className="flex justify-between">
                  <span className="text-gray-600">{p.name}:</span>
                  <span className="font-medium">{p.degree}°{p.minute}' in Sign {p.sign}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
