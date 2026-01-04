'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Package,
  FileText,
  Search,
  Filter,
  BarChart3,
  Calendar as CalendarIcon,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileIcon,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DashboardLayout } from '@/app/components/dashboard-layout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Combobox } from '@/app/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { formatCurrency, getDateRange } from '@/app/lib/utils';
import { CongTy } from '@/app/types';

// ============================================================================
// Types
// ============================================================================

interface TongHopStats {
  tongMatHang: number;
  tongNhap: number;
  tongXuat: number;
  giaTriNhap: number;
  giaTriXuat: number;
  giaTriTonCuoi: number;
  soLuongTonCuoi: number;
}

interface TongHopItem {
  id: string;
  tenHang: string;
  tenHangChuan: string;
  maHang: string;
  dvtinh: string;
  sluong: number;
  dgia: number;
  thtien: number;
  tongTien: number;
  tdlap: string;
  loaihd: string;
  nbten: string;
  nmten: string;
  khhdon: string;
  shdon: string;
  soLuongNhap: number;
  soLuongXuat: number;
  giaTriNhap: number;
  giaTriXuat: number;
}

interface XuatNhapTonItem {
  tenMatHang: string;
  dvtinh: string;
  tonDauQty: number;
  tonDauVal: number;
  soLuongNhap: number;
  soLuongXuat: number;
  tonCuoi: number;
  giaTriNhap: number;
  giaTriXuat: number;
  giaTriTon: number;
  soLanGiaoDich: number;
  tenGocList?: string;
}

interface XNTTheoThoiGian {
  thang?: number;
  quy?: number;
  soLuongNhap: number;
  soLuongXuat: number;
  giaTriNhap: number;
  giaTriXuat: number;
  soGiaoDich: number;
}

interface SyncResult {
  success: boolean;
  totalProcessed: number;
  inserted: number;
  updated: number;
  errors: number;
  message: string;
}

// ============================================================================
// Component
// ============================================================================

export default function XuatNhapTonPage() {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Filter state
  const [companies, setCompanies] = useState<CongTy[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [fromDate, setFromDate] = useState(getDateRange(12).fromDate);
  const [toDate, setToDate] = useState(getDateRange(12).toDate);
  const [search, setSearch] = useState('');

  // Data state
  const [stats, setStats] = useState<TongHopStats | null>(null);
  const [xntMatHang, setXntMatHang] = useState<XuatNhapTonItem[]>([]);

  // Paginations
  const [xntPagination, setXntPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  // Sync dialog
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch('/api/congty?activeOnly=true');
      const result = await response.json();
      if (result.success) {
        setCompanies(result.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams({ action: 'stats' });
      if (selectedCompanyId) params.append('congtyId', selectedCompanyId);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const response = await fetch(`/api/tonghop?${params}`);
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [selectedCompanyId, fromDate, toDate]);

  // Fetch XNT theo mặt hàng
  const fetchXNTMatHang = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'xnt-mathang',
        page: xntPagination.page.toString(),
        limit: xntPagination.limit.toString(),
        search: search
      });
      if (selectedCompanyId) params.append('congtyId', selectedCompanyId);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const response = await fetch(`/api/tonghop?${params}`);
      const result = await response.json();
      if (result.success) {
        setXntMatHang(result.items);
        setXntPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching XNT mat hang:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompanyId, fromDate, toDate, xntPagination.page, xntPagination.limit, search]);


  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    fetchCompanies();
    // Load cached company
    const cached = localStorage.getItem('last_selected_company_id');
    if (cached) setSelectedCompanyId(cached);
  }, [fetchCompanies]);

  useEffect(() => {
    if (selectedCompanyId) {
      localStorage.setItem('last_selected_company_id', selectedCompanyId);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    fetchStats();
    fetchXNTMatHang();
  }, [fetchStats, fetchXNTMatHang]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSync = async (forceResync = false) => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch('/api/tonghop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          congtyId: selectedCompanyId || undefined,
          forceResync,
        }),
      });

      const result = await response.json();
      setSyncResult(result);

      if (result.success) {
        toast.success(result.message);
        handleRefresh();
      } else {
        toast.error(result.message || 'Lỗi đồng bộ');
      }
    } catch (error) {
      toast.error('Lỗi kết nối server');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const response = await fetch('/api/tonghop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          congtyId: selectedCompanyId || undefined,
          action: 'recalculate',
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        handleRefresh();
      } else {
        toast.error(result.message || 'Lỗi tính toán lại');
      }
    } catch (error) {
      toast.error('Lỗi kết nối server');
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
    fetchXNTMatHang();
  };

  const handleExportExcel = () => {
    try {
      const dataToExport = xntMatHang.map((item) => ({
        'Tên mặt hàng chuẩn': item.tenMatHang,
        'Tên mặt hàng gốc': item.tenGocList,
        'Đơn vị tính': item.dvtinh,
        'Số lượng nhập': item.soLuongNhap,
        'Số lượng xuất': item.soLuongXuat,
        'Tồn cuối': item.tonCuoi,
        'Giá trị nhập': item.giaTriNhap,
        'Giá trị xuất': item.giaTriXuat,
        'Số lần giao dịch': item.soLanGiaoDich,
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'TongHopXNT');
      XLSX.writeFile(wb, `TongHop_XNT_${format(new Date(), 'yyyyMMdd')}.xlsx`);

      toast.success('Xuất file Excel thành công');
    } catch (error) {
      console.error('Export Error:', error);
      toast.error('Lỗi khi xuất file Excel');
    }
  };

  const handleExportMonthly = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'xnt-baocao-12thang',
      });
      if (selectedCompanyId) params.append('congtyId', selectedCompanyId);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const response = await fetch(`/api/tonghop?${params}`);
      const result = await response.json();

      if (result.success) {
        const wb = XLSX.utils.book_new();
        const monthKeys = Object.keys(result.data);

        if (monthKeys.length === 0) {
          toast.info('Không có dữ liệu trong khoảng thời gian này');
          return;
        }

        // Sort keys: "1/2025", "2/2025"
        monthKeys.sort((a, b) => {
          const [m1, y1] = a.split('/').map(Number);
          const [m2, y2] = b.split('/').map(Number);
          return y1 !== y2 ? y1 - y2 : m1 - m2;
        });

        for (const key of monthKeys) {
          const monthData = result.data[key] || [];
          const formattedData = monthData.map((item: any) => ({
            'Tên mặt hàng chuẩn': item.tenMatHang,
            'ĐVT': item.dvt,
            'Số Lượng Tồn Đầu': item.tonDauQty,
            'Thành tiền tồn đầu': item.tonDauVal,
            'Số lượng nhập': item.nhapQty,
            'Thành tiền nhập': item.nhapVal,
            'Số lượng xuất': item.xuatQty,
            'Thành tiền xuất': item.xuatVal,
            'Số lượng tồn cuối': item.tonCuoiQty,
            'Thành tiền tồn cuối': item.tonCuoiVal,
          }));

          const ws = XLSX.utils.json_to_sheet(formattedData);
          const sheetName = `Tháng ${key.replace('/', '-')}`;
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }

        XLSX.writeFile(wb, `BaoCao_XNT_Thang_${format(new Date(), 'yyyyMMdd')}.xlsx`);
        toast.success('Xuất báo cáo tháng thành công');
      } else {
        toast.error('Lỗi khi lấy dữ liệu báo cáo');
      }
    } catch (error) {
      console.error('Export Monthly Error:', error);
      toast.error('Lỗi khi xuất file Excel');
    } finally {
      setIsLoading(false);
    }
  };

  // Options
  const companyOptions = [
    { value: '', label: 'Tất cả công ty' },
    ...companies.map((c) => ({
      value: c.id,
      label: `${c.tenVietTat || c.ten} (${c.mst})`,
    })),
  ];

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Báo cáo Tổng hợp Xuất Nhập Tồn
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Thống kê tồn kho chi tiết theo mặt hàng trong khoảng thời gian
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-1">Tải lại</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={isLoading}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Xuất Excel</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportMonthly}
              disabled={isLoading}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <FileIcon className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Xuất báo cáo tháng</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              disabled={isRecalculating || isLoading}
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-1">Cập nhật XNT</span>
            </Button>
            <Button size="sm" onClick={() => setShowSyncDialog(true)}>
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Đồng bộ</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                <Package className="h-4 w-4" />
                <span>Số mặt hàng</span>
              </div>
              <div className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                {(stats.tongMatHang ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-secondary-500 dark:text-gray-400">Có phát sinh giao dịch</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span>Tổng nhập</span>
              </div>
              <div className="text-base sm:text-xl font-bold text-green-600 dark:text-green-400 font-mono">
                {(stats.tongNhap ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-secondary-500 dark:text-gray-400 font-mono">
                {formatCurrency(stats.giaTriNhap ?? 0)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>Tổng xuất</span>
              </div>
              <div className="text-base sm:text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                {(stats.tongXuat ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-secondary-500 dark:text-gray-400 font-mono">
                {formatCurrency(stats.giaTriXuat ?? 0)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                <span>Giá trị tồn cuối</span>
              </div>
              <div className={`text-base sm:text-xl font-bold font-mono ${(stats.giaTriTonCuoi ?? 0) >= 0
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-red-600 dark:text-red-400'
                }`}>
                {formatCurrency(stats.giaTriTonCuoi ?? 0)}
              </div>
              <div className="text-xs text-secondary-500 dark:text-gray-400 font-mono">
                SL: {(stats.soLuongTonCuoi ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <Label className="text-xs text-secondary-500 mb-1 block font-bold">CÔNG TY</Label>
                <Combobox
                  options={companyOptions}
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                  placeholder="Chọn công ty..."
                />
              </div>
              <div>
                <Label className="text-xs text-secondary-500 mb-1 block font-bold">TỪ NGÀY</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs text-secondary-500 mb-1 block font-bold">ĐẾN NGÀY</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[200px] flex items-end gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm mặt hàng..."
                  className="pl-9 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table Area */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-20 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                  <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                </div>
              </div>
            )}

            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-[11px] sm:text-xs border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-900/80 sticky top-0 z-10 text-gray-700 dark:text-gray-200 font-bold uppercase">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th rowSpan={2} className="px-2 py-3 text-left border-r border-gray-200 dark:border-gray-700 min-w-[200px]">Mặt hàng / VT</th>
                    <th rowSpan={2} className="px-2 py-3 text-center border-r border-gray-200 dark:border-gray-700">ĐVT</th>
                    <th colSpan={2} className="px-2 py-1 text-center border-r border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20">Tồn đầu kỳ</th>
                    <th colSpan={2} className="px-2 py-1 text-center border-r border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">Nhập trong kỳ</th>
                    <th colSpan={2} className="px-2 py-1 text-center border-r border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">Xuất trong kỳ</th>
                    <th colSpan={2} className="px-2 py-1 text-center bg-indigo-50 dark:bg-indigo-900/20">Tồn cuối kỳ</th>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-2 py-1 text-right border-r border-gray-200 dark:border-gray-700 bg-amber-50/50 dark:bg-amber-900/10">SL</th>
                    <th className="px-2 py-1 text-right border-r border-gray-200 dark:border-gray-700 bg-amber-50/50 dark:bg-amber-900/10">Tiền</th>
                    <th className="px-2 py-1 text-right border-r border-gray-200 dark:border-gray-700 bg-green-50/50 dark:bg-green-900/10">SL</th>
                    <th className="px-2 py-1 text-right border-r border-gray-200 dark:border-gray-700 bg-green-50/50 dark:bg-green-900/10">Tiền</th>
                    <th className="px-2 py-1 text-right border-r border-gray-200 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/10">SL</th>
                    <th className="px-2 py-1 text-right border-r border-gray-200 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/10">Tiền</th>
                    <th className="px-2 py-1 text-right border-r border-gray-200 dark:border-gray-700 bg-indigo-50/50 dark:bg-indigo-900/10">SL</th>
                    <th className="px-2 py-1 text-right bg-indigo-50/50 dark:bg-indigo-900/10">Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {xntMatHang.length === 0 && !isLoading ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-500 italic">Không có dữ liệu trong khoảng thời gian này</td>
                    </tr>
                  ) : (
                    xntMatHang.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-gray-800">
                          <div className="font-semibold text-gray-900 dark:text-white leading-tight">
                            {item.tenMatHang}
                          </div>
                          {item.tenGocList && (
                            <div className="text-[10px] text-gray-400 italic truncate max-w-[220px]" title={item.tenGocList}>
                              Gốc: {item.tenGocList}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center border-r border-gray-100 dark:border-gray-800 font-mono text-gray-500">{item.dvtinh}</td>

                        {/* Tồn đầu */}
                        <td className="px-2 py-2 text-right border-r border-gray-100 dark:border-gray-800 bg-amber-50/20 dark:bg-amber-900/5 font-mono">{item.tonDauQty.toLocaleString()}</td>
                        <td className="px-2 py-2 text-right border-r border-gray-100 dark:border-gray-800 bg-amber-50/20 dark:bg-amber-900/5 font-mono">{formatCurrency(item.tonDauVal)}</td>

                        {/* Nhập */}
                        <td className="px-2 py-2 text-right border-r border-gray-100 dark:border-gray-800 bg-green-50/20 dark:bg-green-900/5 text-green-600 font-bold font-mono">{item.soLuongNhap.toLocaleString()}</td>
                        <td className="px-2 py-2 text-right border-r border-gray-100 dark:border-gray-800 bg-green-50/20 dark:bg-green-900/5 text-green-600 font-bold font-mono">{formatCurrency(item.giaTriNhap)}</td>

                        {/* Xuất */}
                        <td className="px-2 py-2 text-right border-r border-gray-100 dark:border-gray-800 bg-blue-50/20 dark:bg-blue-900/5 text-blue-600 font-bold font-mono">{item.soLuongXuat.toLocaleString()}</td>
                        <td className="px-2 py-2 text-right border-r border-gray-100 dark:border-gray-800 bg-blue-50/20 dark:bg-blue-900/5 text-blue-600 font-bold font-mono">{formatCurrency(item.giaTriXuat)}</td>

                        {/* Tồn cuối */}
                        <td className={`px-2 py-2 text-right border-r border-gray-100 dark:border-gray-800 bg-indigo-50/20 dark:bg-indigo-900/5 font-bold font-mono ${item.tonCuoi < 0 ? 'text-red-500' : 'text-indigo-600'}`}>
                          {item.tonCuoi.toLocaleString()}
                        </td>
                        <td className={`px-2 py-2 text-right bg-indigo-50/20 dark:bg-indigo-900/5 font-bold font-mono ${item.giaTriTon < 0 ? 'text-red-500' : 'text-indigo-600'}`}>
                          {formatCurrency(item.giaTriTon)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {xntMatHang.length > 0 && (
                  <tfoot className="bg-gray-100 dark:bg-gray-900 font-bold sticky bottom-0 border-t border-gray-300 dark:border-gray-600 uppercase font-mono">
                    <tr>
                      <td colSpan={2} className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700 font-sans">TỔNG CỘNG</td>
                      <td className="px-2 py-2 text-right border-r border-gray-200 dark:border-gray-700 bg-amber-100/50 dark:bg-amber-900/30">
                        {xntMatHang.reduce((acc, i) => acc + i.tonDauQty, 0).toLocaleString()}
                      </td>
                      <td className="px-2 py-2 text-right border-r border-gray-200 dark:border-gray-700 bg-amber-100/50 dark:bg-amber-900/30">
                        {formatCurrency(xntMatHang.reduce((acc, i) => acc + i.tonDauVal, 0))}
                      </td>
                      <td className="px-2 py-2 text-right border-r border-gray-200 dark:border-gray-700 bg-green-100/50 dark:bg-green-900/30 text-green-700">
                        {xntMatHang.reduce((acc, i) => acc + i.soLuongNhap, 0).toLocaleString()}
                      </td>
                      <td className="px-2 py-2 text-right border-r border-gray-200 dark:border-gray-700 bg-green-100/50 dark:bg-green-900/30 text-green-700">
                        {formatCurrency(xntMatHang.reduce((acc, i) => acc + i.giaTriNhap, 0))}
                      </td>
                      <td className="px-2 py-2 text-right border-r border-gray-200 dark:border-gray-700 bg-blue-100/50 dark:bg-blue-900/30 text-blue-700">
                        {xntMatHang.reduce((acc, i) => acc + i.soLuongXuat, 0).toLocaleString()}
                      </td>
                      <td className="px-2 py-2 text-right border-r border-gray-200 dark:border-gray-700 bg-blue-100/50 dark:bg-blue-900/30 text-blue-700">
                        {formatCurrency(xntMatHang.reduce((acc, i) => acc + i.giaTriXuat, 0))}
                      </td>
                      <td className="px-2 py-2 text-right border-r border-gray-200 dark:border-gray-700 bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700">
                        {xntMatHang.reduce((acc, i) => acc + i.tonCuoi, 0).toLocaleString()}
                      </td>
                      <td className="px-2 py-2 text-right bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700">
                        {formatCurrency(xntMatHang.reduce((acc, i) => acc + i.giaTriTon, 0))}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-xs text-secondary-500 font-mono">
                  Trang {xntPagination.page}/{xntPagination.totalPages} | Tổng {xntPagination.total} bản ghi
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-secondary-500">
                  <span>Hiển thị:</span>
                  <select
                    className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={xntPagination.limit}
                    onChange={(e) => {
                      const newLimit = Number(e.target.value);
                      setXntPagination(p => ({ ...p, limit: newLimit, page: 1 }));
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-mono"
                  disabled={xntPagination.page <= 1 || isLoading}
                  onClick={() => setXntPagination(p => ({ ...p, page: p.page - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-mono"
                  disabled={xntPagination.page >= xntPagination.totalPages || isLoading}
                  onClick={() => setXntPagination(p => ({ ...p, page: p.page + 1 }))}
                >
                  Sau
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đồng bộ Dữ liệu Xuất Nhập Tồn</DialogTitle>
            <DialogDescription>
              Cập nhật dữ liệu XNT từ hóa đơn vào hệ thống báo cáo
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Hệ thống sẽ quét toàn bộ hóa đơn và tính toán số lượng nhập/xuất theo từng mặt hàng.
                </p>
              </div>

              {syncResult && (
                <div className={`rounded-lg p-4 ${syncResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-sm font-medium ${syncResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {syncResult.message}
                  </p>
                  {syncResult.success && (
                    <div className="mt-2 text-xs text-gray-600">
                      <p>• Xử lý: {syncResult.totalProcessed} dòng</p>
                      <p>• Thành công: {syncResult.inserted + syncResult.updated}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input type="checkbox" id="forceResync" className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="forceResync" className="text-sm font-medium">Làm mới toàn bộ dữ liệu (Force Resize)</Label>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyncDialog(false)}>Đóng</Button>
            <Button
              onClick={() => {
                const force = (document.getElementById('forceResync') as HTMLInputElement)?.checked;
                handleSync(force);
              }}
              disabled={isSyncing}
            >
              {isSyncing ? 'Đang đồng bộ...' : 'Bắt đầu đồng bộ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
