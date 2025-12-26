import { NextRequest, NextResponse } from 'next/server';

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/rag/ingest - Ingest dữ liệu vào vector store
 * Đồng bộ dữ liệu từ ext_tonghop vào Qdrant
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      congtyId, 
      fromDate, 
      toDate, 
      loaihd,
      batchSize = 100,
      clearExisting = false 
    } = body;

    // Forward to RAG service
    const ragResponse = await fetch(`${RAG_SERVICE_URL}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        congty_id: congtyId || null,
        from_date: fromDate || null,
        to_date: toDate || null,
        loaihd: loaihd || null,
        batch_size: batchSize,
        clear_existing: clearExisting,
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
      message: data.message,
      stats: data.stats,
    });
  } catch (error) {
    console.error('RAG Ingest error:', error);
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
 * DELETE /api/rag/ingest - Xóa dữ liệu trong vector store
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm') === 'true';

    if (!confirm) {
      return NextResponse.json(
        { success: false, error: 'Cần xác nhận xóa với query param: ?confirm=true' },
        { status: 400 }
      );
    }

    // Forward to RAG service
    const ragResponse = await fetch(`${RAG_SERVICE_URL}/ingest?confirm=true`, {
      method: 'DELETE',
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
      message: data.message,
    });
  } catch (error) {
    console.error('RAG Delete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}
