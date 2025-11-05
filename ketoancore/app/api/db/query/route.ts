import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Execute a custom SQL query (USE WITH CAUTION - for development only)
export async function POST(request: NextRequest) {
  try {
    const { sql, params } = await request.json();
    
    if (!sql) {
      return NextResponse.json(
        { success: false, message: 'SQL query is required' },
        { status: 400 }
      );
    }

    // Security: Only allow SELECT queries in production
    const isProduction = process.env.NODE_ENV === 'production';
    const isSafeQuery = sql.trim().toUpperCase().startsWith('SELECT');
    
    if (isProduction && !isSafeQuery) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Only SELECT queries are allowed in production' 
        },
        { status: 403 }
      );
    }

    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      rowCount: result.rowCount,
      command: result.command,
    });
  } catch (error) {
    console.error('Query execution error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Query execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
