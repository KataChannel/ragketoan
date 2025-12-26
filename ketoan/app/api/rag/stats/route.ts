import { NextResponse } from 'next/server';

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8000';

/**
 * GET /api/rag/stats - Thống kê RAG service
 */
export async function GET() {
  try {
    const ragResponse = await fetch(`${RAG_SERVICE_URL}/stats`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!ragResponse.ok) {
      const errorData = await ragResponse.json();
      return NextResponse.json(
        { success: false, error: errorData.detail || 'Lỗi từ RAG service' },
        { status: ragResponse.status }
      );
    }

    const data = await ragResponse.json();
    
    return NextResponse.json({
      success: true,
      data: data.data,
    });
  } catch (error) {
    console.error('RAG Stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}
