import prisma from '@/app/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export interface TrainingItem {
  tenGoc: string
  tenChuan: string | null
  dvtinh: string | null
  frequency: number
  isMapped: boolean
}

/**
 * Láy danh sách các mặt hàng chưa được chuẩn hóa để huấn luyện
 */
export async function getItemsForTraining(options: {
  congtyId?: string
  search?: string
  onlyUnmapped?: boolean
  page?: number
  limit?: number
  orderBy?: 'tenGoc' | 'frequency' | 'isMapped' | 'tenChuan'
  order?: 'asc' | 'desc'
}) {
  const { 
    congtyId, 
    search, 
    onlyUnmapped = false, 
    page = 1, 
    limit = 50,
    orderBy = 'frequency',
    order = 'desc'
  } = options

  // 1. Lấy thống kê từ ext_tonghop
  const where: any = {}
  if (congtyId) where.congtyId = congtyId
  if (search) {
    where.tenHang = { contains: search, mode: 'insensitive' }
  }

  const groupedItems = await prisma.ext_tonghop.groupBy({
    by: ['tenHang'],
    where,
    _count: {
      tenHang: true
    },
    _max: {
      dvtinh: true
    },
    orderBy: {
      _count: {
        tenHang: 'desc'
      }
    }
  })

  // 2. Lấy từ điển hiện tại
  const dictionary = await (prisma as any).ext_sanpham_dictionary.findMany()
  const dictMap = new Map<string, any>()
  dictionary.forEach((d: any) => dictMap.set(d.tenGoc, d))

  // 3. Merge dữ liệu
  let results: TrainingItem[] = groupedItems.map(item => {
    const mapping = dictMap.get(item.tenHang)
    return {
      tenGoc: item.tenHang,
      tenChuan: mapping?.tenChuan || null,
      dvtinh: item._max.dvtinh,
      frequency: item._count.tenHang,
      isMapped: !!mapping
    }
  })

  // Lọc nếu chỉ lấy hàng chưa map
  if (onlyUnmapped) {
    results = results.filter(r => !r.isMapped)
  }
  
  // 4. Sắp xếp kết quả
  results.sort((a, b) => {
    let valA: any = a[orderBy]
    let valB: any = b[orderBy]
    
    // Handing nulls/undefined - push to end
    if (valA === null || valA === undefined) return 1
    if (valB === null || valB === undefined) return -1
    
    if (typeof valA === 'string' && typeof valB === 'string') {
      return order === 'asc' 
        ? valA.localeCompare(valB, 'vi') 
        : valB.localeCompare(valA, 'vi')
    }
    
    return order === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
  })

  const total = results.length
  const paginatedResults = results.slice((page - 1) * limit, page * limit)

  return {
    items: paginatedResults,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

/**
 * Cập nhật chuẩn hóa thủ công cho danh sách mặt hàng
 */
export async function updateTrainingMapping(items: string[], standardName: string, additionalInfo: {
  maHang?: string,
  nhomHang?: string,
  dvtinh?: string,
  congtyId?: string
}) {
  const operations = items.map(tenGoc => {
    return (prisma as any).ext_sanpham_dictionary.upsert({
      where: { tenGoc },
      update: {
        tenChuan: standardName,
        maHang: additionalInfo.maHang,
        nhomHang: additionalInfo.nhomHang,
        dvtinh: additionalInfo.dvtinh,
        updatedAt: new Date()
      },
      create: {
        tenGoc,
        tenChuan: standardName,
        maHang: additionalInfo.maHang,
        nhomHang: additionalInfo.nhomHang,
        dvtinh: additionalInfo.dvtinh,
        congtyId: additionalInfo.congtyId
      }
    })
  })

  await prisma.$transaction(operations)

  // Sau khi cập nhật từ điển, tiến hành cập nhật ngược lại bảng ext_tonghop
  await prisma.ext_tonghop.updateMany({
    where: {
      tenHang: { in: items }
    },
    data: {
      tenHangChuan: standardName,
      maHang: additionalInfo.maHang,
      nhomHang: additionalInfo.nhomHang
    }
  })

  return { success: true, message: `Đã cập nhật chuẩn hóa cho ${items.length} mặt hàng` }
}

/**
 * Tự động tìm kiếm các mặt hàng tương đồng (Simple fuzzy matching)
 */
export async function autoSuggestGrouping(congtyId?: string) {
  // Lấy các mặt hàng chưa chuẩn hóa
  const unmapped = await prisma.ext_tonghop.groupBy({
    by: ['tenHang'],
    where: {
      congtyId,
      tenHangChuan: null
    },
    _count: {
      tenHang: true
    }
  })

  const suggestions: Array<{ standard: string, variants: string[] }> = []
  
  // Logic đơn giản: group theo 3 từ đầu tiên của tên (có thể cải tiến bằng ML/Levenshtein)
  const groupMap = new Map<string, string[]>()
  
  unmapped.forEach(item => {
    const cleanName = item.tenHang.toUpperCase().trim()
    const words = cleanName.split(' ').slice(0, 3).join(' ')
    if (!groupMap.has(words)) groupMap.set(words, [])
    groupMap.get(words)?.push(item.tenHang)
  })

  groupMap.forEach((variants, standard) => {
    if (variants.length > 1) {
      suggestions.push({ standard, variants })
    }
  })

  return suggestions
}

/**
 * Áp dụng toàn bộ training data cho bảng tổng hợp
 */
export async function applyTrainingToDatabase() {
  const dictionary = await (prisma as any).ext_sanpham_dictionary.findMany()
  let count = 0

  for (const entry of dictionary) {
    const result = await (prisma as any).ext_tonghop.updateMany({
      where: {
        tenHang: entry.tenGoc,
        OR: [
          { tenHangChuan: { not: entry.tenChuan } },
          { tenHangChuan: null }
        ]
      },
      data: {
        tenHangChuan: entry.tenChuan,
        maHang: entry.maHang,
        nhomHang: entry.nhomHang
      }
    })
    count += result.count
  }

  return { success: true, count, message: `Đã đồng bộ ${count} dòng dữ liệu dựa trên training data` }
}
