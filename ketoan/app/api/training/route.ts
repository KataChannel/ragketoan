import { NextRequest, NextResponse } from 'next/server'
import { 
  getItemsForTraining, 
  updateTrainingMapping, 
  autoSuggestGrouping, 
  applyTrainingToDatabase,
  bulkUpdateTrainingMapping
} from '@/app/services/training.service'
import prisma from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') || 'list'
    const congtyId = searchParams.get('congtyId') || undefined
    const search = searchParams.get('search') || undefined
    const onlyUnmapped = searchParams.get('onlyUnmapped') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const orderBy = (searchParams.get('orderBy') as any) || 'frequency'
    const order = (searchParams.get('order') as any) || 'desc'

    switch (action) {
      case 'suggest':
        const apiKeySuggest = searchParams.get('apiKey') || undefined;
        const suggestions = await autoSuggestGrouping(congtyId, undefined, 80, apiKeySuggest)
        return NextResponse.json({ success: true, data: suggestions })
        
      case 'suggest_stream':
        const congtyIdStream = congtyId;
        const limitStream = parseInt(searchParams.get('aiLimit') || '80');
        const apiKeyStream = searchParams.get('apiKey') || undefined;
        const encoder = new TextEncoder();
        
        const stream = new ReadableStream({
          async start(controller) {
            const sendProgress = (percent: number, message: string, data?: any) => {
               try {
                 const payload = JSON.stringify({ percent, message, data: data || null });
                 controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
               } catch (e) {
                 console.error("Error sending progress:", e);
               }
            };

            // Heartbeat để giữ connection không bị timeout trong lúc chờ AI phân tích lâu (3-4 phút)
            const heartbeat = setInterval(() => {
               try {
                 controller.enqueue(encoder.encode(`: heartbeat\n\n`));
               } catch (e) {
                 clearInterval(heartbeat);
               }
            }, 15000);

            try {
              const result = await autoSuggestGrouping(congtyIdStream, sendProgress, limitStream, apiKeyStream);
              clearInterval(heartbeat);
              // Đảm bảo message cuối cùng có đầy đủ dữ liệu
              sendProgress(100, "Hoàn tất phân tích", result);
              controller.close();
            } catch (err: any) {
              clearInterval(heartbeat);
              sendProgress(100, `Lỗi: ${err.message}`, []);
              controller.close();
            }
          }
        });

        return new NextResponse(stream, {
           headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
           }
        });
      
      case 'list':
      default:
        const data = await getItemsForTraining({ 
          congtyId, 
          search, 
          onlyUnmapped, 
          page, 
          limit,
          orderBy,
          order
        })
        return NextResponse.json({ success: true, ...data })
    }
  } catch (error) {
    console.error('Training API Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json()
    const { action } = body

    switch (action) {
      case 'update':
        const { items, standardName, info } = body
        const result = await updateTrainingMapping(items, standardName, info)
        return NextResponse.json(result)

      case 'sync':
        const syncResult = await applyTrainingToDatabase()
        return NextResponse.json(syncResult)

      case 'bulk_update':
        const { suggestions, congtyId: bulkCongtyId } = body
        const bulkResult = await bulkUpdateTrainingMapping(suggestions, bulkCongtyId)
        return NextResponse.json(bulkResult)

      default:
        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Training API POST Error details:', {
      message: error.message,
      stack: error.stack,
      action: (body as any)?.action
    })
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
