import { NextRequest, NextResponse } from 'next/server'
import { 
  getItemsForTraining, 
  updateTrainingMapping, 
  autoSuggestGrouping, 
  applyTrainingToDatabase 
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
        const suggestions = await autoSuggestGrouping(congtyId)
        return NextResponse.json({ success: true, data: suggestions })
        
      case 'suggest_stream':
        const congtyIdStream = congtyId;
        const encoder = new TextEncoder();
        
        const stream = new ReadableStream({
          async start(controller) {
            const sendProgress = (percent: number, message: string, data?: any) => {
               const payload = JSON.stringify({ percent, message, data: data || null });
               controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            };

            try {
              const result = await autoSuggestGrouping(congtyIdStream, sendProgress);
              sendProgress(100, "Hoàn tất phân tích", result);
              controller.close();
            } catch (err: any) {
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
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'update':
        const { items, standardName, info } = body
        const result = await updateTrainingMapping(items, standardName, info)
        return NextResponse.json(result)

      case 'sync':
        const syncResult = await applyTrainingToDatabase()
        return NextResponse.json(syncResult)

      default:
        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Training API POST Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
