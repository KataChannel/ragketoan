import { NextRequest, NextResponse } from 'next/server';

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/rag/search - Semantic search
 * Tìm kiếm ngữ nghĩa trong dữ liệu hóa đơn
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      limit = 10, 
      congtyId, 
      loaihd, 
      nam, 
      thang,
      scoreThreshold = 0.5 
    } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Query không được để trống' },
        { status: 400 }
      );
    }

    // Forward to RAG service
    const ragResponse = await fetch(`${RAG_SERVICE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit,
        congty_id: congtyId || null,
        loaihd: loaihd || null,
        nam: nam || null,
        thang: thang || null,
        score_threshold: scoreThreshold,
      }),
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
      results: data.results,
      total: data.total,
    });
  } catch (error) {
    console.error('RAG Search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rag/search - Semantic search (GET method)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');
    const congtyId = searchParams.get('congtyId');
    const loaihd = searchParams.get('loaihd');
    const nam = searchParams.get('nam');
    const thang = searchParams.get('thang');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Query không được để trống' },
        { status: 400 }
      );
    }

    // Build query params
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
    });
    
    if (congtyId) params.append('congty_id', congtyId);
    if (loaihd) params.append('loaihd', loaihd);
    if (nam) params.append('nam', nam);
    if (thang) params.append('thang', thang);

    // Forward to RAG service
    const ragResponse = await fetch(`${RAG_SERVICE_URL}/search?${params.toString()}`);

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
      results: data.results,
      total: data.total,
    });
  } catch (error) {
    console.error('RAG Search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}
