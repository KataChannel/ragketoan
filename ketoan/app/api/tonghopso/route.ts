import { NextRequest, NextResponse } from 'next/server'
import { getJournalEntries, getLedgerEntries, getTrialBalance, getDetailLedgerEntries, getProfitAndLoss, getBalanceSheet, getAuditAlerts } from '@/app/services/so-ke-toan.service'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'nhatky'
  const congtyId = searchParams.get('congtyId') || undefined
  const fromDateStr = searchParams.get('fromDate')
  const toDateStr = searchParams.get('toDate')
  const search = searchParams.get('search') || undefined
  const tk = searchParams.get('tk') || ''

  const fromDate = fromDateStr ? new Date(fromDateStr) : new Date(new Date().getFullYear(), 0, 1)
  const toDate = toDateStr ? new Date(toDateStr) : new Date()

  try {
    switch (action) {
      case 'nhatky':
        const journal = await getJournalEntries({ congtyId, fromDate, toDate, search })
        return NextResponse.json({ success: true, data: journal })

      case 'socai':
        if (!tk) return NextResponse.json({ success: false, message: 'Thiếu số tài khoản' }, { status: 400 })
        const ledger = await getLedgerEntries(tk, { congtyId, fromDate, toDate, search })
        return NextResponse.json({ success: true, data: ledger })

      case 'bangcandoi':
        const trialBalance = await getTrialBalance({ congtyId, fromDate, toDate })
        return NextResponse.json({ success: true, data: trialBalance })
      
      case 'sochitiet':
        const searchDetail = searchParams.get('doiTuong') || ''
        const detailLedger = await getDetailLedgerEntries(tk, searchDetail, { congtyId, fromDate, toDate, search })
        return NextResponse.json({ success: true, data: detailLedger })

      case 'bckqkd':
        const plReport = await getProfitAndLoss({ congtyId, fromDate, toDate })
        return NextResponse.json({ success: true, data: plReport })

      case 'bangcandoi_b01':
        const bsReport = await getBalanceSheet({ congtyId, fromDate, toDate })
        return NextResponse.json({ success: true, data: bsReport })

      case 'audit':
        const auditAlerts = await getAuditAlerts({ congtyId, fromDate, toDate })
        return NextResponse.json({ success: true, data: auditAlerts })

      default:
        return NextResponse.json({ success: false, message: 'Action không hợp lệ' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('API TongHopSo Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
