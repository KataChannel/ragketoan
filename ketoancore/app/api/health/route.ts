import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
