import { NextResponse } from 'next/server';

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8000';

/**
 * GET /api/rag/health - Health check cho RAG service
 */
export async function GET() {
  try {
    const ragResponse = await fetch(`${RAG_SERVICE_URL}/health`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!ragResponse.ok) {
      return NextResponse.json(
        { 
          success: false, 
          status: 'unavailable',
          error: 'RAG service không khả dụng' 
        },
        { status: 503 }
      );
    }

    const data = await ragResponse.json();
    
    return NextResponse.json({
      success: true,
      status: data.status,
      timestamp: data.timestamp,
      services: data.services,
    });
  } catch (error) {
    console.error('RAG Health check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        status: 'error',
        error: error instanceof Error ? error.message : 'Không thể kết nối RAG service' 
      },
      { status: 503 }
    );
  }
}
