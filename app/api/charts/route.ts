import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateBirthChart, getHousePlacements } from '@/lib/astrology/calculations'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { birthDetailsId, chartName, chartType } = body

    // Validate required fields
    if (!birthDetailsId) {
      return NextResponse.json(
        { error: 'Birth details ID is required' },
        { status: 400 }
      )
    }

    // Fetch birth details
    const { data: birthDetails, error: fetchError } = await supabase
      .from('birth_details')
      .select('*')
      .eq('id', birthDetailsId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !birthDetails) {
      return NextResponse.json(
        { error: 'Birth details not found' },
        { status: 404 }
      )
    }

    // Parse date and time
    const dateTime = new Date(`${birthDetails.date_of_birth}T${birthDetails.time_of_birth || '12:00:00'}`)
    
    // For now, use simplified coordinates (you can integrate geocoding API later)
    // This should come from a geocoding service based on place_of_birth
    const latitude = 28.6139 // Default to Delhi for now
    const longitude = 77.2090

    // Calculate birth chart
    const chartData = calculateBirthChart(dateTime, latitude, longitude)
    const housePlacements = getHousePlacements(chartData)

    // Prepare chart data for storage
    const completeChartData = {
      ...chartData,
      housePlacements,
      birthDetails: {
        name: birthDetails.full_name,
        dateOfBirth: birthDetails.date_of_birth,
        timeOfBirth: birthDetails.time_of_birth,
        placeOfBirth: birthDetails.place_of_birth,
        latitude,
        longitude
      }
    }

    // Save chart to database
    const { data: chart, error: insertError } = await supabase
      .from('astrology_charts')
      .insert({
        user_id: user.id,
        birth_details_id: birthDetailsId,
        chart_name: chartName || `${birthDetails.full_name}'s Chart`,
        chart_type: chartType || 'D1',
        chart_data: completeChartData
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving chart:', insertError)
      return NextResponse.json(
        { error: 'Failed to save chart', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      chart,
      chartData: completeChartData
    })

  } catch (error) {
    console.error('Error generating chart:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get chart ID from query params
    const { searchParams } = new URL(request.url)
    const chartId = searchParams.get('id')

    if (!chartId) {
      // Fetch all charts for user
      const { data: charts, error } = await supabase
        .from('astrology_charts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch charts' },
          { status: 500 }
        )
      }

      return NextResponse.json({ charts })
    }

    // Fetch specific chart
    const { data: chart, error } = await supabase
      .from('astrology_charts')
      .select('*')
      .eq('id', chartId)
      .eq('user_id', user.id)
      .single()

    if (error || !chart) {
      return NextResponse.json(
        { error: 'Chart not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ chart })

  } catch (error) {
    console.error('Error fetching charts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
