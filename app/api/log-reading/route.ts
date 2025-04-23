import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json()
    const { wordCount, date } = body

    // Validate input
    if (!wordCount || typeof wordCount !== 'number' || wordCount < 1) {
      return NextResponse.json(
        { error: 'Invalid word count' },
        { status: 400 }
      )
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Get authenticated user using route handler client
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get existing stats for this date
    const { data: existingStats } = await supabase
      .from('reading_stats')
      .select('words_read')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()

    if (existingStats) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('reading_stats')
        .update({ 
          words_read: existingStats.words_read + wordCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('date', date)

      if (updateError) {
        console.error('Error updating reading stats:', updateError)
        return NextResponse.json(
          { error: 'Failed to update reading stats' },
          { status: 500 }
        )
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('reading_stats')
        .insert({
          user_id: user.id,
          date,
          words_read: wordCount,
          stories_completed: 0
        })

      if (insertError) {
        console.error('Error inserting reading stats:', insertError)
        return NextResponse.json(
          { error: 'Failed to insert reading stats' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging reading:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 