/**
 * API Tổng hợp hóa đơn
 * GET: Lấy danh sách + thống kê
 * POST: Trigger đồng bộ dữ liệu
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  syncTongHop,
  getTongHopStats,
  getTongHopList,
  getXuatNhapTonByMatHang,
  getXuatNhapTonTheoThoiGian,
  getXuatNhapTonBaoCaoThang
} from '@/app/services/tonghop.service'

// ============================================================================
// GET: Lấy danh sách và thống kê
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Parse query params
    const action = searchParams.get('action') || 'list' // list | stats | xnt-mathang | xnt-thoigian
    const congtyId = searchParams.get('congtyId') || undefined
    const fromDate = searchParams.get('fromDate') ? new Date(searchParams.get('fromDate')!) : undefined
    const toDate = searchParams.get('toDate') ? new Date(searchParams.get('toDate')!) : undefined
    const loaihd = (searchParams.get('loaihd') as 'banra' | 'muavao') || undefined
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const orderBy = (searchParams.get('orderBy') as 'tdlap' | 'tenHang' | 'sluong' | 'tongTien') || 'tdlap'
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc'
    const nam = parseInt(searchParams.get('nam') || new Date().getFullYear().toString())
    const groupBy = searchParams.get('groupBy') as 'tenHangChuan' | 'maHang' | 'nhomHang' | 'thang' | 'quy'

    switch (action) {
      case 'stats':
        const stats = await getTongHopStats({
          congtyId,
          fromDate,
          toDate,
          maHang: searchParams.get('maHang') || undefined,
          tenHang: searchParams.get('tenHang') || undefined
        })
        return NextResponse.json({ success: true, data: stats })

      case 'xnt-mathang':
        const xntMatHangResult = await getXuatNhapTonByMatHang({
          congtyId,
          fromDate,
          toDate,
          groupBy: (groupBy as 'tenHangChuan' | 'maHang' | 'nhomHang') || 'tenHangChuan',
          page,
          limit,
          search
        })
        return NextResponse.json({ success: true, ...xntMatHangResult })

      case 'xnt-thoigian':
        const xntThoiGian = await getXuatNhapTonTheoThoiGian({
          congtyId,
          nam,
          groupBy: (groupBy as 'thang' | 'quy') || 'thang'
        })
        return NextResponse.json({ success: true, data: xntThoiGian })

      case 'xnt-baocao-12thang':
        const xntBaoCao12Thang = await getXuatNhapTonBaoCaoThang({
          congtyId,
          nam
        })
        return NextResponse.json({ success: true, data: xntBaoCao12Thang })

      case 'list':
      default:
        const result = await getTongHopList({
          congtyId,
          fromDate,
          toDate,
          loaihd,
          search,
          page,
          limit,
          orderBy,
          order
        })
        return NextResponse.json({ success: true, ...result })
    }
  } catch (error) {
    console.error('Error in GET /api/tonghop:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST: Trigger đồng bộ
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      congtyId,
      fromDate,
      toDate,
      forceResync = false
    } = body

    const result = await syncTongHop({
      congtyId,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      forceResync
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in POST /api/tonghop:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    )
  }
}
