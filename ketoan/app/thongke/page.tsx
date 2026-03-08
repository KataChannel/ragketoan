'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDate, formatCurrency, getDateRange } from '@/app/lib/utils';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Info,
  Archive,
  ArrowRight,
  Package,
  Layers,
  History,
  FileText,
  Building2,
  RefreshCw,
  Search,
  ArrowUpDown,
  TrendingDown,
  PieChart
} from 'lucide-react';
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
  soLuongNhap: number;
  soLuongXuat: number;
  tonCuoi: number;
  giaTriNhap: number;
  giaTriXuat: number;
  giaTriTon: number;
  soLanGiaoDich: number;
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

export default function ThongKePage() {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'xnt-mathang' | 'xnt-thoigian'>('overview');
  
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

  // Fetch list
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
  }, [fetchCompanies]);

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
        // Refresh data
        fetchStats();
        if (activeTab === 'overview') fetchList();
        else if (activeTab === 'xnt-mathang') fetchXNTMatHang();
        else if (activeTab === 'xnt-thoigian') fetchXNTThoiGian();
      } else {
        toast.error(result.message || 'Lỗi đồng bộ');
      }
    } catch (error) {
      toast.error('Lỗi kết nối server');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
    if (activeTab === 'overview') fetchList();
    else if (activeTab === 'xnt-mathang') fetchXNTMatHang();
    else if (activeTab === 'xnt-thoigian') fetchXNTThoiGian();
  };

  // Company options
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
              Thống kê Tổng hợp
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Phân tích xuất nhập tồn theo mặt hàng từ hóa đơn
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-1">Tải lại</span>
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
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stats.soHoaDon} hóa đơn
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span>Nhập</span>
              </div>
              <div className="text-base sm:text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.giaTriNhap)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stats.tongNhap.toLocaleString()} SP
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>Xuất</span>
              </div>
              <div className="text-base sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(stats.giaTriXuat)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stats.tongXuat.toLocaleString()} SP
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                <BarChart3 className="h-4 w-4" />
                <span>Chênh lệch</span>
              </div>
              <div className={`text-base sm:text-xl font-bold ${
                stats.giaTriNhap - stats.giaTriXuat >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(Math.abs(stats.giaTriNhap - stats.giaTriXuat))}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(stats.tongNhap - stats.tongXuat).toLocaleString()} SP
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <FileText className="h-4 w-4 inline mr-1" />
              Chi tiết
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'xnt-mathang'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('xnt-mathang')}
            >
              <Package className="h-4 w-4 inline mr-1" />
              XNT Mặt hàng
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
              XNT Thời gian
            </button>
          </div>

          {/* Filters */}
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Công ty
                  </Label>
                  <Combobox
                    options={companyOptions}
                    value={selectedCompanyId}
                    onValueChange={setSelectedCompanyId}
                    placeholder="Chọn công ty"
                  />
                </div>

                {activeTab !== 'xnt-thoigian' && (
                  <>
                    <div>
                      <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
                        Từ ngày
                      </Label>
                      <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
                        Đến ngày
                      </Label>
                      <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'overview' && (
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
                      Loại
                    </Label>
                    <Combobox
                      options={loaiHDOptions}
                      value={loaihd}
                      onValueChange={setLoaihd}
                      placeholder="Chọn loại"
                    />
                  </div>
                )}

                {activeTab === 'xnt-thoigian' && (
                  <>
                    <div>
                      <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
                        Năm
                      </Label>
                      <Combobox
                        options={namOptions}
                        value={nam.toString()}
                        onValueChange={(v) => setNam(parseInt(v))}
                        placeholder="Chọn năm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
                        Nhóm theo
                      </Label>
                      <Combobox
                        options={groupByOptions}
                        value={groupBy}
                        onValueChange={(v) => setGroupBy(v as 'thang' | 'quy')}
                        placeholder="Chọn nhóm"
                      />
                    </div>
                  </>
                )}
              </div>

              {activeTab === 'overview' && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm tên hàng, mã hàng..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchList()}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {activeTab === 'xnt-mathang' && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm tên mặt hàng..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchXNTMatHang()}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="overflow-x-auto">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Mặt hàng
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">
                      Hóa đơn
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      SL
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">
                      Đơn giá
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Thành tiền
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">
                      Loại
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">
                      Ngày
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tongHopList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        {isLoading ? 'Đang tải...' : 'Không có dữ liệu. Vui lòng đồng bộ dữ liệu trước.'}
                      </td>
                    </tr>
                  ) : (
                    tongHopList.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-3 py-3">
                          <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                            {item.tenHang}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.maHang} | {item.dvtinh}
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell">
                          <div className="text-gray-900 dark:text-white">
                            #{item.shdon}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                            {item.loaihd === 'banra' ? item.nmten : item.nbten}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-gray-900 dark:text-white">
                          {Number(item.sluong).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                          {formatCurrency(Number(item.dgia))}
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-blue-600 dark:text-blue-400">
                          {formatCurrency(Number(item.tongTien))}
                        </td>
                        <td className="px-3 py-3 text-center hidden sm:table-cell">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.loaihd === 'banra'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {item.loaihd === 'banra' ? 'Xuất' : 'Nhập'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-400 text-xs hidden lg:table-cell">
                          {formatDate(item.tdlap)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* XNT Mat Hang Tab */}
            {activeTab === 'xnt-mathang' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Mặt hàng
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">
                      ĐVT
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      SL Nhập
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      SL Xuất
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Tồn
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">
                      GT Nhập
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">
                      GT Xuất
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">
                      Giao dịch
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {xntMatHang.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        {isLoading ? 'Đang tải...' : 'Không có dữ liệu'}
                      </td>
                    </tr>
                  ) : (
                    xntMatHang.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-3 py-3">
                          <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                            {item.tenMatHang}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                          {item.dvtinh}
                        </td>
                        <td className="px-3 py-3 text-right text-green-600 dark:text-green-400">
                          {item.soLuongNhap.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right text-blue-600 dark:text-blue-400">
                          {item.soLuongXuat.toLocaleString()}
                        </td>
                        <td className={`px-3 py-3 text-right font-medium ${
                          item.tonCuoi >= 0 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {item.tonCuoi.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right text-green-600 dark:text-green-400 hidden md:table-cell">
                          {formatCurrency(item.giaTriNhap)}
                        </td>
                        <td className="px-3 py-3 text-right text-blue-600 dark:text-blue-400 hidden md:table-cell">
                          {formatCurrency(item.giaTriXuat)}
                        </td>
                        <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                          {item.soLanGiaoDich}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* XNT Thoi Gian Tab */}
            {activeTab === 'xnt-thoigian' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {groupBy === 'thang' ? 'Tháng' : 'Quý'}
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      SL Nhập
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      SL Xuất
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">
                      GT Nhập
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">
                      GT Xuất
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Giao dịch
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {xntThoiGian.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        {isLoading ? 'Đang tải...' : 'Không có dữ liệu'}
                      </td>
                    </tr>
                  ) : (
                    xntThoiGian.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">
                          {groupBy === 'thang' ? `Tháng ${item.thang}` : `Quý ${item.quy}`}
                        </td>
                        <td className="px-3 py-3 text-right text-green-600 dark:text-green-400">
                          {item.soLuongNhap.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right text-blue-600 dark:text-blue-400">
                          {item.soLuongXuat.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right text-green-600 dark:text-green-400 hidden sm:table-cell">
                          {formatCurrency(item.giaTriNhap)}
                        </td>
                        <td className="px-3 py-3 text-right text-blue-600 dark:text-blue-400 hidden sm:table-cell">
                          {formatCurrency(item.giaTriXuat)}
                        </td>
                        <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-400">
                          {item.soGiaoDich}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination - Overview only */}
          {activeTab === 'overview' && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                Trang {pagination.page}/{pagination.totalPages} | Tổng: {pagination.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}

          {/* Pagination - XNT Mat Hang */}
          {activeTab === 'xnt-mathang' && xntPagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                Trang {xntPagination.page}/{xntPagination.totalPages} | Tổng: {xntPagination.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={xntPagination.page <= 1}
                  onClick={() => setXntPagination(p => ({ ...p, page: p.page - 1 }))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={xntPagination.page >= xntPagination.totalPages}
                  onClick={() => setXntPagination(p => ({ ...p, page: p.page + 1 }))}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đồng bộ Dữ liệu Tổng hợp</DialogTitle>
            <DialogDescription>
              Tổng hợp dữ liệu từ chi tiết hóa đơn vào bảng thống kê
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Đồng bộ sẽ tổng hợp dữ liệu từ bảng <code>ext_detailhoadon</code> và <code>ext_listhoadon</code> 
                  vào bảng <code>ext_tonghop</code> để phục vụ báo cáo và RAG.
                </p>
              </div>

              {syncResult && (
                <div className={`rounded-lg p-4 ${
                  syncResult.success 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <p className={`text-sm font-medium ${
                    syncResult.success 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {syncResult.message}
                  </p>
                  {syncResult.success && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <p>• Tổng xử lý: {syncResult.totalProcessed}</p>
                      <p>• Thêm mới: {syncResult.inserted}</p>
                      <p>• Cập nhật: {syncResult.updated}</p>
                      {syncResult.errors !== undefined && syncResult.errors > 0 && <p>• Lỗi: {syncResult.errors}</p>}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  id="forceResync"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <Label htmlFor="forceResync" className="text-sm font-medium cursor-pointer">
                    Đồng bộ lại toàn bộ
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Xóa dữ liệu cũ và tổng hợp lại từ đầu
                  </p>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyncDialog(false)}>
              Đóng
            </Button>
            <Button 
              onClick={() => {
                const forceResync = (document.getElementById('forceResync') as HTMLInputElement)?.checked;
                handleSync(forceResync);
              }} 
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="ml-1">Đang xử lý...</span>
                </>
              ) : (
                <>
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="ml-1">Đồng bộ</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
