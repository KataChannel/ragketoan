"use client"

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/app/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Bot, Check, X, AlertTriangle, AlertCircle, RefreshCw, Package } from 'lucide-react'
import { toast } from 'sonner'

export default function AiMappingQueuePage() {
    const [items, setItems] = useState<any[]>([])
    const [companies, setCompanies] = useState<any[]>([])
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all')
    const [isScanning, setIsScanning] = useState(false)
    const [loading, setLoading] = useState(true)
    const [customInputs, setCustomInputs] = useState<Record<string, { tenChuan: string, maHang: string, dvt: string }>>({})

    const fetchQueue = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/ai-mapping-queue?status=PENDING&limit=50')
            const data = await res.json()
            if (data.success) {
                setItems(data.items)
            }
        } catch (err) {
            toast.error('Lỗi tải danh sách chờ')
        } finally {
            setLoading(false)
        }
    }

    const fetchCompanies = async () => {
        try {
            const res = await fetch('/api/congty');
            const data = await res.json();
            if (data.success) setCompanies(data.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchCompanies()
        fetchQueue()
    }, [])

    const handleScanExisting = async () => {
        if (!confirm('Bạn có chắc muốn tự động quét lại toàn bộ lịch sử mặt hàng từ 01/01/2023? AI sẽ mất vài phút để học và xử lý.')) return;
        setIsScanning(true);
        const toastId = toast.loading('Đang quét hóa đơn cũ và đẩy vào Agent...');
        try {
            const res = await fetch('/api/ai-mapping-queue/scan-existing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ congtyId: selectedCompanyId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message, { id: toastId });
                fetchQueue();
            } else {
                toast.error(data.error || 'Lỗi quét dữ liệu', { id: toastId });
            }
        } catch (err) {
            toast.error('Lỗi kết nối API', { id: toastId });
        } finally {
            setIsScanning(false);
        }
    }

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        try {
            const custom = customInputs[id] || {}

            // Khóa nút trong lúc request
            const toastId = toast.loading('Đang xử lý...')

            const res = await fetch('/api/ai-mapping-queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action, customTenChuan: custom.tenChuan, customMaHang: custom.maHang, customDvt: custom.dvt })
            })
            const data = await res.json()

            if (data.success) {
                toast.success(data.message, { id: toastId })
                // Bỏ item khỏi danh sách
                setItems(items.filter(i => i.id !== id))
            } else {
                toast.error(data.error || 'Có lỗi xảy ra', { id: toastId })
            }
        } catch (error) {
            console.error(error)
            toast.error('Có lỗi xảy ra kết nối')
        }
    }

    const handleCustomChange = (id: string, field: string, value: string) => {
        setCustomInputs(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }))
    }

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Bot className="text-blue-500" /> Duyệt Mặt Hàng (AI HITL)
                        </h1>
                        <p className="text-slate-400 mt-2">
                            Danh sách mặt hàng mới xuất hiện trên hóa đơn mà trí tuệ nhân tạo (AI) không đủ độ tự tin để tự động ánh xạ. Vui lòng kiểm tra và duyệt thủ công. Các mặt hàng "Mới hoàn toàn" nên được Tùy chỉnh Mã/Tên thay vì dùng Đề xuất nếu Đề xuất sai.
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <select
                            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm p-2 rounded focus-visible:ring-emerald-500"
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                        >
                            <option value="all">Tất cả công ty</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.tenVietTat || c.ten}</option>
                            ))}
                        </select>
                        <Button onClick={handleScanExisting} disabled={isScanning} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md">
                            Quét Lịch Sử (Từ 2023)
                        </Button>
                        <Button onClick={fetchQueue} variant="outline" className="border-slate-700 bg-slate-800 text-slate-200">
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Làm mới
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center p-12 text-slate-400 border border-slate-800 rounded-lg bg-slate-900/50">
                        Đang tải dữ liệu và phân tích AI...
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center p-12 text-slate-400 border border-slate-800 rounded-lg flex flex-col items-center justify-center gap-4 bg-slate-900/50 relative overflow-hidden">

                        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full" />
                        <Check className="h-16 w-16 text-emerald-500 drop-shadow-lg z-10" />
                        <div className="z-10">
                            <h3 className="text-xl font-bold text-white mb-2">Tuyệt vời!</h3>
                            <p className="text-slate-400 text-md">Không có mặt hàng nào đang chặn hàng chờ. AI đã xử lý tự động toàn bộ phần còn lại.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {items.map(item => (
                            <Card key={item.id} className="bg-slate-900 border-slate-800 text-slate-200 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl text-emerald-400 flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            {item.tenGoc}
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 mt-2 text-sm">
                                            ĐVT gốc trên Hóa Đơn: <span className="text-white font-medium">{item.dvtGoc || 'Chưa cung cấp'}</span>
                                        </CardDescription>
                                    </div>
                                    {item.aiConfidence !== null && (
                                        <Badge variant={item.aiConfidence > 0.8 ? "default" : "destructive"} className="ml-2 font-mono text-xs shadow-inner">
                                            Tự tin: {(item.aiConfidence * 100).toFixed(1)}%
                                        </Badge>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6 items-start">
                                        {/* Bot Suggestion */}
                                        <div className="bg-slate-800 p-5 rounded-xl border border-blue-500/20 shadow-inner relative">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-4">
                                                <Bot className="h-5 w-5 text-blue-500" /> AI Đề xuất Ánh Xạ
                                            </div>
                                            {item.aiSuggestedName ? (
                                                <>
                                                    <div className="mb-3 pl-7">
                                                        <span className="text-slate-400 text-sm">Gợi ý chuyển thành Mã/Tên Chuẩn: </span><br />
                                                        <span className="text-lg font-bold text-white tracking-wide">{item.aiSuggestedName}</span>
                                                    </div>
                                                    <div className="text-sm text-slate-300 italic flex items-start gap-2 bg-slate-900/80 p-3 rounded border border-slate-700 mt-4 leading-relaxed">
                                                        <AlertCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                                        <span dangerouslySetInnerHTML={{ __html: item.aiReasoning.replace(/\n/g, '<br/>') }} />
                                                    </div>
                                                    <Button
                                                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md group"
                                                        onClick={() => handleAction(item.id, 'APPROVE')}
                                                    >
                                                        <Check className="mr-2 h-4 w-4 group-hover:scale-125 transition-transform" /> Duyệt Gợi Ý Của AI
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="text-slate-400 text-sm py-6 text-center flex flex-col items-center gap-2">
                                                    <AlertTriangle className="h-8 w-8 text-slate-600 mb-2" />
                                                    AI phân tích ngữ nghĩa hoàn toàn không tìm thấy đề xuất trùng lặp nào. <br />Mặt hàng này 100% là MỚI.
                                                </div>
                                            )}
                                        </div>

                                        {/* Manual Override */}
                                        <div className="bg-slate-800 p-5 rounded-xl border border-emerald-500/20 shadow-inner">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mb-4">
                                                <AlertTriangle className="h-5 w-5 text-emerald-500" /> Nhập Mã/Tên Chuẩn Mới Từ Đầu
                                            </div>

                                            <div className="space-y-4 pt-1">
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Tên Chuẩn Hóa mới</label>
                                                    <Input
                                                        placeholder="Nhập tên chuẩn mong muốn..."
                                                        className="bg-slate-900 border-slate-700 text-slate-200 focus-visible:ring-emerald-500"
                                                        value={customInputs[item.id]?.tenChuan || ''}
                                                        onChange={(e) => handleCustomChange(item.id, 'tenChuan', e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Mã Hàng Quốc Tế</label>
                                                        <Input
                                                            placeholder="VD: SP001"
                                                            className="bg-slate-900 border-slate-700 text-slate-200 focus-visible:ring-emerald-500"
                                                            value={customInputs[item.id]?.maHang || ''}
                                                            onChange={(e) => handleCustomChange(item.id, 'maHang', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-wider">ĐVT Chuẩn (Tự nhận diện)</label>
                                                        <Input
                                                            placeholder={item.dvtGoc || "Cái, Chiếc..."}
                                                            className="bg-slate-900 border-slate-700 text-slate-200 focus-visible:ring-emerald-500"
                                                            value={customInputs[item.id]?.dvt || ''}
                                                            onChange={(e) => handleCustomChange(item.id, 'dvt', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 w-full pt-4">
                                                    <Button
                                                        variant="default"
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-semibold transition-all shadow-md group"
                                                        disabled={!customInputs[item.id]?.tenChuan}
                                                        onClick={() => handleAction(item.id, 'APPROVE')}
                                                    >
                                                        <Check className="mr-2 h-4 w-4 group-hover:scale-125 transition-transform" /> Lưu Tùy Chỉnh
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        className="bg-red-950/40 hover:bg-red-900/80 border border-red-900 text-red-400 transition-colors"
                                                        onClick={() => handleAction(item.id, 'REJECT')}
                                                    >
                                                        <X className="h-4 w-4" /> Bỏ Qua
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
