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
  Calendar,
  ArrowUpDown,
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
  tongSoLuong: number;
  tongNhap: number;
  tongXuat: number;
  giaTriNhap: number;
  giaTriXuat: number;
  soMatHang: number;
  soHoaDon: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'xnt-mathang' | 'xnt-thoigian'>('xnt-mathang');
  
  // Filter state
  const [companies, setCompanies] = useState<CongTy[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [fromDate, setFromDate] = useState(getDateRange(12).fromDate);
  const [toDate, setToDate] = useState(getDateRange(12).toDate);
  const [search, setSearch] = useState('');
  const [loaihd, setLoaihd] = useState<string>('');
  const [nam, setNam] = useState(new Date().getFullYear());
  const [groupBy, setGroupBy] = useState<'thang' | 'quy'>('thang');
  
  // Data state
  const [stats, setStats] = useState<TongHopStats | null>(null);
  const [tongHopList, setTongHopList] = useState<TongHopItem[]>([]);
  const [xntMatHang, setXntMatHang] = useState<XuatNhapTonItem[]>([]);
  const [xntThoiGian, setXntThoiGian] = useState<XNTTheoThoiGian[]>([]);
  
  // Paginations
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [xntPagination, setXntPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  
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

  // Fetch list (Overview)
  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'list',
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (selectedCompanyId) params.append('congtyId', selectedCompanyId);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (search) params.append('search', search);
      if (loaihd) params.append('loaihd', loaihd);
      
      const response = await fetch(`/api/tonghop?${params}`);
      const result = await response.json();
      if (result.success) {
        setTongHopList(result.items);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching list:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompanyId, fromDate, toDate, search, loaihd, pagination.page, pagination.limit]);

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

  // Fetch XNT theo thời gian
  const fetchXNTThoiGian = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'xnt-thoigian',
        nam: nam.toString(),
        groupBy,
      });
      if (selectedCompanyId) params.append('congtyId', selectedCompanyId);
      
      const response = await fetch(`/api/tonghop?${params}`);
      const result = await response.json();
      if (result.success) {
        setXntThoiGian(result.data);
      }
    } catch (error) {
      console.error('Error fetching XNT thoi gian:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompanyId, nam, groupBy]);

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
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchList();
    } else if (activeTab === 'xnt-mathang') {
      fetchXNTMatHang();
    } else if (activeTab === 'xnt-thoigian') {
      fetchXNTThoiGian();
    }
  }, [activeTab, fetchList, fetchXNTMatHang, fetchXNTThoiGian]);

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
    if (activeTab === 'overview') fetchList();
    else if (activeTab === 'xnt-mathang') fetchXNTMatHang();
    else if (activeTab === 'xnt-thoigian') fetchXNTThoiGian();
  };

  const handleExportExcel = () => {
    try {
      let dataToExport = [];
      let filename = 'xuat-nhap-ton';

      if (activeTab === 'overview') {
        dataToExport = tongHopList.map((item) => ({
          'Tên hàng chuẩn': item.tenHangChuan || item.tenHang,
          'Tên hàng gốc': item.tenHang,
          'Mã hàng': item.maHang,
          'ĐVT': item.dvtinh,
          'Số lượng': item.sluong,
          'Đơn giá': item.dgia,
          'Tổng tiền': item.tongTien,
          'Loại': item.loaihd === 'banra' ? 'Xuất' : 'Nhập',
          'Ngày': format(new Date(item.tdlap), 'dd/MM/yyyy'),
          'Số hóa đơn': item.shdon,
          'Đối tác': item.loaihd === 'banra' ? item.nmten : item.nbten,
        }));
        filename = `ChiTiet_XNT_${format(new Date(), 'yyyyMMdd')}`;
      } else if (activeTab === 'xnt-mathang') {
        dataToExport = xntMatHang.map((item) => ({
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
        filename = `TongHop_XNT_MatHang_${format(new Date(), 'yyyyMMdd')}`;
      } else {
        dataToExport = xntThoiGian.map((item) => ({
          [groupBy === 'thang' ? 'Tháng' : 'Quý']: groupBy === 'thang' ? `Tháng ${item.thang}` : `Quý ${item.quy}`,
          'Số lượng nhập': item.soLuongNhap,
          'Số lượng xuất': item.soLuongXuat,
          'Giá trị nhập': item.giaTriNhap,
          'Giá trị xuất': item.giaTriXuat,
          'Số giao dịch': item.soGiaoDich,
        }));
        filename = `XNT_TheoThoiGian_${nam}_${format(new Date(), 'yyyyMMdd')}`;
      }

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, `${filename}.xlsx`);
      
      toast.success('Xuất file Excel thành công');
    } catch (error) {
      console.error('Export Error:', error);
      toast.error('Lỗi khi xuất file Excel');
    }
  };

  const handleExport12Thang = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'xnt-baocao-12thang',
        nam: nam.toString(),
      });
      if (selectedCompanyId) params.append('congtyId', selectedCompanyId);

      const response = await fetch(`/api/tonghop?${params}`);
      const result = await response.json();
      
      if (result.success) {
        const wb = XLSX.utils.book_new();
        
        for (let m = 1; m <= 12; m++) {
          const monthData = result.data[m] || [];
          const formattedData = monthData.map((item: any) => ({
            'Tên mặt hàng chuẩn': item.tenMatHang,
            'Tên mặt hàng gốc': item.tenGocList,
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
          XLSX.utils.book_append_sheet(wb, ws, `Tháng ${m}`);
        }
        
        XLSX.writeFile(wb, `BaoCao_XNT_12Thang_${nam}.xlsx`);
        toast.success('Xuất báo cáo 12 tháng thành công');
      } else {
        toast.error('Lỗi khi lấy dữ liệu báo cáo');
      }
    } catch (error) {
      console.error('Export 12 Months Error:', error);
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

  const loaiHDOptions = [
    { value: '', label: 'Tất cả loại' },
    { value: 'banra', label: 'Bán ra (Xuất)' },
    { value: 'muavao', label: 'Mua vào (Nhập)' },
  ];

  const groupByOptions = [
    { value: 'thang', label: 'Theo tháng' },
    { value: 'quy', label: 'Theo quý' },
  ];

  const namOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: `Năm ${year}` };
  });

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
              Quản lý Xuất Nhập Tồn
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Theo dõi chi tiết và tổng hợp biến động từ hóa đơn
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
              onClick={handleExport12Thang} 
              disabled={isLoading} 
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Báo cáo 12 tháng</span>
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

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                <Package className="h-4 w-4" />
                <span>Mặt hàng</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.soMatHang.toLocaleString()}
              </div>
              <div className="text-xs text-secondary-500 dark:text-gray-400">
                {stats.soHoaDon} hóa đơn
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span>Nhập kho</span>
              </div>
              <div className="text-base sm:text-xl font-bold text-green-600 dark:text-green-400">
                {stats.tongNhap.toLocaleString()} SP
              </div>
              <div className="text-xs text-secondary-500 dark:text-gray-400">
                {formatCurrency(stats.giaTriNhap)}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>Xuất kho</span>
              </div>
              <div className="text-base sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                {stats.tongXuat.toLocaleString()} SP
              </div>
              <div className="text-xs text-secondary-500 dark:text-gray-400">
                {formatCurrency(stats.giaTriXuat)}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                <BarChart3 className="h-4 w-4" />
                <span>Tồn kho ước tính</span>
              </div>
              <div className={`text-base sm:text-xl font-bold ${
                stats.tongNhap - stats.tongXuat >= 0 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {(stats.tongNhap - stats.tongXuat).toLocaleString()} SP
              </div>
              <div className="text-xs text-secondary-500 dark:text-gray-400">
                {formatCurrency(Math.abs(stats.giaTriNhap - stats.giaTriXuat))}
              </div>
            </div>
          </div>
        )}

        {/* Tabs and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'xnt-mathang'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('xnt-mathang')}
            >
              <Package className="h-4 w-4 inline mr-1" />
              Tổng hợp theo Mặt hàng
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <FileText className="h-4 w-4 inline mr-1" />
              Chi tiết giao dịch
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'xnt-thoigian'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('xnt-thoigian')}
            >
              <Calendar className="h-4 w-4 inline mr-1" />
              Biến động thời gian
            </button>
          </div>

          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Công ty</Label>
                <Combobox options={companyOptions} value={selectedCompanyId} onValueChange={setSelectedCompanyId} />
              </div>
              
              {activeTab !== 'xnt-thoigian' && (
                <>
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Từ ngày</Label>
                    <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Đến ngày</Label>
                    <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                  </div>
                </>
              )}
              
              {activeTab === 'xnt-thoigian' && (
                <>
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Năm</Label>
                    <Combobox options={namOptions} value={nam.toString()} onValueChange={(v) => setNam(parseInt(v))} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Nhóm theo</Label>
                    <Combobox options={groupByOptions} value={groupBy} onValueChange={(v) => setGroupBy(v as 'thang' | 'quy')} />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={activeTab === 'overview' ? "Tìm tên hàng, số hóa đơn..." : "Tìm tên mặt hàng..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {activeTab === 'overview' && (
                <div className="w-[150px]">
                  <Combobox options={loaiHDOptions} value={loaihd} onValueChange={setLoaihd} placeholder="Loại HĐ" />
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'overview' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mặt hàng</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SL</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Đơn giá</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Thành tiền</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Loại</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Ngày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tongHopList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-3">
                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                          {item.tenHangChuan || item.tenHang}
                        </div>
                        {item.tenHangChuan && (
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 italic truncate max-w-[200px]">
                            Gốc: {item.tenHang}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">#{item.shdon} | {item.dvtinh}</div>
                      </td>
                      <td className="px-3 py-3 text-right">{item.sluong.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right hidden sm:table-cell">{formatCurrency(item.dgia)}</td>
                      <td className="px-3 py-3 text-right font-medium text-blue-600 dark:text-blue-400">{formatCurrency(item.tongTien)}</td>
                      <td className="px-3 py-3 text-center hidden md:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.loaihd === 'banra' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                          {item.loaihd === 'banra' ? 'XUẤT' : 'NHẬP'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-gray-500 hidden lg:table-cell">{format(new Date(item.tdlap), 'dd/MM/yy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'xnt-mathang' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mặt hàng</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tồn đầu</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nhập</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Xuất</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tồn cuối</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Giá trị tồn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {xntMatHang.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-3">
                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-[250px]">{item.tenMatHang}</div>
                        {item.tenGocList && (
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 italic truncate max-w-[250px]" title={item.tenGocList}>
                            Gốc: {item.tenGocList}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">{item.dvtinh} | {item.soLanGiaoDich} GD</div>
                      </td>
                      <td className="px-3 py-3 text-right text-gray-500 italic">{item.tonDauQty.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right text-green-600">{item.soLuongNhap.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right text-blue-600">{item.soLuongXuat.toLocaleString()}</td>
                      <td className={`px-3 py-3 text-right font-bold ${item.tonCuoi >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
                        {item.tonCuoi.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right hidden sm:table-cell text-gray-500">{formatCurrency(item.giaTriTon)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'xnt-thoigian' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{groupBy === 'thang' ? 'Tháng' : 'Quý'}</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SL Nhập</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SL Xuất</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Giá trị nhập</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Giá trị xuất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {xntThoiGian.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{groupBy === 'thang' ? `Tháng ${item.thang}` : `Quý ${item.quy}`}</td>
                      <td className="px-3 py-3 text-right text-green-600">{item.soLuongNhap.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right text-blue-600">{item.soLuongXuat.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right hidden sm:table-cell text-green-600/70">{formatCurrency(item.giaTriNhap)}</td>
                      <td className="px-3 py-3 text-right hidden sm:table-cell text-blue-600/70">{formatCurrency(item.giaTriXuat)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {(isLoading && (tongHopList.length === 0 && xntMatHang.length === 0 && xntThoiGian.length === 0)) && (
               <div className="py-10 text-center text-gray-500">Đang tải dữ liệu...</div>
            )}
            
            {(!isLoading && (activeTab === 'overview' ? tongHopList.length === 0 : activeTab === 'xnt-mathang' ? xntMatHang.length === 0 : xntThoiGian.length === 0)) && (
               <div className="py-10 text-center text-gray-500">Không có dữ liệu cho điều kiện lọc này.</div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {activeTab === 'overview' ? (
                `Trang ${pagination.page}/${pagination.totalPages} | Tổng ${pagination.total}`
              ) : activeTab === 'xnt-mathang' ? (
                `Trang ${xntPagination.page}/${xntPagination.totalPages} | Tổng ${xntPagination.total}`
              ) : (
                `Tổng cộng ${xntThoiGian.length} bản ghi`
              )}
            </div>
            {(activeTab !== 'xnt-thoigian') && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={(activeTab === 'overview' ? pagination.page <= 1 : xntPagination.page <= 1) || isLoading}
                  onClick={() => {
                    if (activeTab === 'overview') setPagination(p => ({ ...p, page: p.page - 1 }));
                    else setXntPagination(p => ({ ...p, page: p.page - 1 }));
                  }}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={(activeTab === 'overview' ? pagination.page >= pagination.totalPages : xntPagination.page >= xntPagination.totalPages) || isLoading}
                  onClick={() => {
                    if (activeTab === 'overview') setPagination(p => ({ ...p, page: p.page + 1 }));
                    else setXntPagination(p => ({ ...p, page: p.page + 1 }));
                  }}
                >
                  Sau
                </Button>
              </div>
            )}
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
