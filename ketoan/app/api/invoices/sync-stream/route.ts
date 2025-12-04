import { NextRequest } from 'next/server';
import { invoiceSyncService } from '@/app/services';
import { InvoiceType } from '@/app/types';
import prisma from '@/app/lib/prisma';

// ============================================================================
// Types
// ============================================================================

interface StreamProgress {
  type: 'progress' | 'invoice' | 'detail' | 'complete' | 'error' | 'aborted';
  phase?: 'fetch' | 'save' | 'detail';
  current?: number;
  total?: number;
  message?: string;
  percentage?: number;
  invoice?: {
    shdon: string;
    khhdon: string;
    nbten?: string;
    nmten?: string;
  };
  detail?: {
    invoiceShdon: string;
    current: number;
    total: number;
    itemName?: string;
  };
  result?: {
    totalRecords: number;
    successCount: number;
    errorCount: number;
    detailResult?: {
      totalRecords: number;
      successCount: number;
      errorCount: number;
    };
  };
  error?: string;
}

// Global abort controllers để có thể dừng từ bên ngoài
const abortControllers = new Map<string, AbortController>();

// ============================================================================
// POST /api/invoices/sync-stream - Đồng bộ hóa đơn với streaming progress
// ============================================================================

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const sessionId = crypto.randomUUID();
  
  // Tạo abort controller cho session này
  const abortController = new AbortController();
  abortControllers.set(sessionId, abortController);

  const stream = new ReadableStream({
    async start(controller) {
      // Helper function để gửi event
      const sendEvent = (data: StreamProgress) => {
        const eventData = `data: ${JSON.stringify({ ...data, sessionId })}\n\n`;
        controller.enqueue(encoder.encode(eventData));
      };

      try {
        const body = await request.json();
        const { 
          configId,
          bearerToken: manualToken, 
          invoiceType, 
          fromDate, 
          toDate, 
          brandname,
          congtyId,
          baseUrl,
          syncDetails = false,
          delayBetweenDetails = 2000,
        } = body;

        let bearerToken = manualToken;
        let effectiveBaseUrl = baseUrl;
        let effectiveBrandname = brandname;
        let effectiveCongtyId = congtyId;

        // Gửi session ID ngay lập tức
        sendEvent({ type: 'progress', message: 'Đang khởi tạo...', percentage: 0 });

        // Nếu có configId, lấy thông tin từ database
        if (configId) {
          const config = await prisma.ext_apiconfig.findUnique({
            where: { id: configId },
            include: {
              congty: {
                select: { id: true, mst: true, ten: true }
              }
            }
          });

          if (!config) {
            sendEvent({ type: 'error', error: 'Không tìm thấy cấu hình API' });
            controller.close();
            return;
          }

          if (!config.isActive) {
            sendEvent({ type: 'error', error: 'Cấu hình API đã bị vô hiệu hóa' });
            controller.close();
            return;
          }

          bearerToken = config.bearerToken;
          effectiveBaseUrl = config.baseUrl || baseUrl;
          effectiveBrandname = brandname || config.brandname;
          effectiveCongtyId = config.congtyId;
        }

        // Validate required fields
        if (!bearerToken) {
          sendEvent({ type: 'error', error: 'Bearer token là bắt buộc' });
          controller.close();
          return;
        }

        if (!invoiceType || !['banra', 'muavao'].includes(invoiceType)) {
          sendEvent({ type: 'error', error: 'Loại hóa đơn không hợp lệ' });
          controller.close();
          return;
        }

        if (!fromDate || !toDate) {
          sendEvent({ type: 'error', error: 'Ngày bắt đầu và kết thúc là bắt buộc' });
          controller.close();
          return;
        }

        // Init Tax API Service
        invoiceSyncService.initTaxApi(bearerToken, { baseUrl: effectiveBaseUrl });

        // Sync invoices với streaming progress
        const result = await invoiceSyncService.syncInvoicesWithProgress({
          invoiceType: invoiceType as InvoiceType,
          fromDate,
          toDate,
          brandname: effectiveBrandname,
          congtyId: effectiveCongtyId,
          syncDetails,
          delayBetweenDetails,
          abortSignal: abortController.signal,
          onProgress: (progress) => {
            // Check if aborted
            if (abortController.signal.aborted) {
              return;
            }
            sendEvent(progress);
          },
        });

        // Check if aborted
        if (abortController.signal.aborted) {
          sendEvent({ type: 'aborted', message: 'Đã dừng đồng bộ' });
        } else {
          // Cập nhật lastSyncAt nếu dùng configId
          if (configId) {
            await prisma.ext_apiconfig.update({
              where: { id: configId },
              data: {
                lastSyncAt: new Date(),
                lastSyncStatus: result.errorCount > 0 ? 'partial' : 'success',
              }
            });
          }

          // Send complete event
          sendEvent({
            type: 'complete',
            message: `Đã đồng bộ ${result.successCount}/${result.totalRecords} hóa đơn`,
            result: {
              totalRecords: result.totalRecords,
              successCount: result.successCount,
              errorCount: result.errorCount,
              detailResult: result.detailResult,
            },
          });
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          sendEvent({ type: 'aborted', message: 'Đã dừng đồng bộ' });
        } else {
          console.error('Error syncing invoices:', error);
          sendEvent({
            type: 'error',
            error: error instanceof Error ? error.message : 'Lỗi không xác định',
          });
        }
      } finally {
        // Cleanup
        abortControllers.delete(sessionId);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Session-Id': sessionId,
    },
  });
}

// ============================================================================
// DELETE /api/invoices/sync-stream - Dừng đồng bộ
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return Response.json(
        { success: false, error: 'Session ID là bắt buộc' },
        { status: 400 }
      );
    }

    const abortController = abortControllers.get(sessionId);
    if (abortController) {
      abortController.abort();
      abortControllers.delete(sessionId);
      return Response.json({ success: true, message: 'Đã gửi yêu cầu dừng' });
    }

    return Response.json(
      { success: false, error: 'Không tìm thấy session' },
      { status: 404 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi' },
      { status: 500 }
    );
  }
}
