import { NextRequest, NextResponse } from 'next/server';

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/rag/query - RAG Query với AI
 * Proxy request tới Python RAG service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, congtyId, loaihd, nam, thang, topK = 5, stream = false } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Câu hỏi không được để trống' },
        { status: 400 }
      );
    }

    // Forward to RAG service
    const ragResponse = await fetch(`${RAG_SERVICE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        congty_id: congtyId || null,
        loaihd: loaihd || null,
        nam: nam || null,
        thang: thang || null,
        top_k: topK,
        stream: false, // Disable streaming for simplicity
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
      answer: data.answer,
      sources: data.sources,
      model: data.model,
    });
  } catch (error) {
    console.error('RAG Query error:', error);
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
 * GET /api/rag/query - RAG Query (GET method)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const question = searchParams.get('question');
    const congtyId = searchParams.get('congtyId');
    const loaihd = searchParams.get('loaihd');
    const nam = searchParams.get('nam');
    const thang = searchParams.get('thang');
    const topK = parseInt(searchParams.get('topK') || '5');

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Câu hỏi không được để trống' },
        { status: 400 }
      );
    }

    // Build query params
    const params = new URLSearchParams({
      question,
      top_k: topK.toString(),
    });
    
    if (congtyId) params.append('congty_id', congtyId);
    if (loaihd) params.append('loaihd', loaihd);
    if (nam) params.append('nam', nam);
    if (thang) params.append('thang', thang);

    // Forward to RAG service
    const ragResponse = await fetch(`${RAG_SERVICE_URL}/query?${params.toString()}`);

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
      answer: data.answer,
      sources: data.sources,
      model: data.model,
    });
  } catch (error) {
    console.error('RAG Query error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}
