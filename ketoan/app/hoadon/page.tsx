'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  RefreshCw, 
  Download, 
  Settings, 
  FileText,
  TrendingUp,
  Calendar,
  Building2,
  Search,
  ChevronRight,
  Plus,
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
import { formatCurrency, formatDate, getDateRange } from '@/app/lib/utils';
import { Invoice, InvoiceType, SyncProgress, CongTy } from '@/app/types';

// Mock data for demo - sẽ được thay thế khi có data từ API
const mockInvoices: Invoice[] = [];

const invoiceTypeOptions = [
  { value: 'banra', label: 'Hóa đơn bán ra' },
  { value: 'muavao', label: 'Hóa đơn mua vào' },
];

export default function HoaDonPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('banra');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Company state
  const [companies, setCompanies] = useState<CongTy[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    mst: '',
    ten: '',
    tenVietTat: '',
    diaChi: '',
    dienThoai: '',
    email: '',
    nguoiDaiDien: '',
    isDefault: false,
  });
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  
  // Sync dialog state
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncConfig, setSyncConfig] = useState({
    bearerToken: '',
    fromDate: getDateRange(1).fromDate,
    toDate: getDateRange(1).toDate,
    brandname: '',
  });
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Config dialog state
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    name: 'thue_dienttu',
    congtyId: '',
    bearerToken: '',
    baseUrl: 'https://hoadondientu.gdt.gov.vn:30000',
    batchSize: 3,
    delayBetweenBatches: 3000,
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Detail dialog state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Fetch invoices when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      fetchInvoices();
    }
  }, [selectedCompanyId, invoiceType]);

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/congty?activeOnly=true');
      const result = await response.json();
      if (result.success) {
        setCompanies(result.data);
        // Set default company
        const defaultCompany = result.data.find((c: CongTy) => c.isDefault);
        if (defaultCompany) {
          setSelectedCompanyId(defaultCompany.id);
        } else if (result.data.length > 0) {
          setSelectedCompanyId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  // Company options for combobox
  const companyOptions = companies.map((c) => ({
    value: c.id,
    label: `${c.tenVietTat || c.ten} (${c.mst})`,
  }));

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (inv.loaihd !== invoiceType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        inv.shdon.toLowerCase().includes(term) ||
        inv.nmten?.toLowerCase().includes(term) ||
        inv.nmmst?.toLowerCase().includes(term) ||
        inv.nbten?.toLowerCase().includes(term) ||
        inv.nbmst.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Calculate totals
  const totals = filteredInvoices.reduce(
    (acc, inv) => ({
      count: acc.count + 1,
      amount: acc.amount + inv.tgtttbso,
      tax: acc.tax + inv.tgtthue,
    }),
    { count: 0, amount: 0, tax: 0 }
  );

  // Handle sync
  const handleSync = async () => {
    if (!syncConfig.bearerToken) {
      toast.warning('Vui lòng nhập Bearer Token');
      return;
    }

    setIsSyncing(true);
    setSyncProgress({ current: 0, total: 0, message: 'Đang bắt đầu...', percentage: 0 });

    try {
      const response = await fetch('/api/invoices/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bearerToken: syncConfig.bearerToken,
          invoiceType,
          fromDate: syncConfig.fromDate,
          toDate: syncConfig.toDate,
          brandname: syncConfig.brandname,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSyncProgress({
          current: result.data.successCount,
          total: result.data.totalRecords,
          message: result.message,
          percentage: 100,
        });
        
        // Refresh invoice list
        fetchInvoices();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(`Lỗi đồng bộ: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch invoices from API
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices?loaihd=${invoiceType}&pageSize=100`);
      const result = await response.json();
      if (result.success) {
        setInvoices(result.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save API config
  const handleSaveConfig = async () => {
    if (!apiConfig.name || !apiConfig.bearerToken) {
      toast.warning('Vui lòng nhập tên cấu hình và Bearer Token');
      return;
    }

    setIsSavingConfig(true);
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiConfig),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Lưu cấu hình thành công!');
        setShowConfigDialog(false);
      } else {
        throw new Error(result.error || 'Không thể lưu cấu hình');
      }
    } catch (error) {
      toast.error(`Lỗi lưu cấu hình: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Fetch API config for selected company
  const fetchApiConfig = async () => {
    if (!selectedCompanyId) return;
    
    try {
      const response = await fetch(`/api/config?congtyId=${selectedCompanyId}`);
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        const config = result.data[0];
        setApiConfig({
          name: config.name || 'thue_dienttu',
          congtyId: config.congtyId || selectedCompanyId,
          bearerToken: config.bearerToken || '',
          baseUrl: config.baseUrl || 'https://hoadondientu.gdt.gov.vn:30000',
          batchSize: config.batchSize || 3,
          delayBetweenBatches: config.delayBetweenBatches || 3000,
        });
      } else {
        // Reset với công ty hiện tại
        setApiConfig({
          name: 'thue_dienttu',
          congtyId: selectedCompanyId,
          bearerToken: '',
          baseUrl: 'https://hoadondientu.gdt.gov.vn:30000',
          batchSize: 3,
          delayBetweenBatches: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  // Handle save company
  const handleSaveCompany = async () => {
    if (!companyForm.mst || !companyForm.ten) {
      toast.warning('Vui lòng nhập Mã số thuế và Tên công ty');
      return;
    }

    setIsSavingCompany(true);
    try {
      const response = await fetch('/api/congty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Lưu công ty thành công!');
        setShowCompanyDialog(false);
        fetchCompanies();
        // Reset form
        setCompanyForm({
          mst: '',
          ten: '',
          tenVietTat: '',
          diaChi: '',
          dienThoai: '',
          email: '',
          nguoiDaiDien: '',
          isDefault: false,
        });
      } else {
        throw new Error(result.error || 'Không thể lưu công ty');
      }
    } catch (error) {
      toast.error(`Lỗi lưu công ty: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsSavingCompany(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Page Header - Mobile First */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Hóa đơn Điện tử
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Đồng bộ và quản lý hóa đơn từ API Thuế Điện Tử
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCompanyDialog(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Thêm CT</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowConfigDialog(true)}>
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Cài đặt</span>
            </Button>
            <Button size="sm" onClick={() => setShowSyncDialog(true)} disabled={!selectedCompanyId}>
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Đồng bộ</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards - Mobile First Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
              <FileText className="h-4 w-4" />
              <span>Số hóa đơn</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {totals.count}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>Tổng tiền</span>
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
              {formatCurrency(totals.amount)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
              <Building2 className="h-4 w-4" />
              <span>Tổng thuế</span>
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400 truncate">
              {formatCurrency(totals.tax)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
              <Calendar className="h-4 w-4" />
              <span>Cập nhật</span>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
              {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </div>
          </div>
        </div>

        {/* Filters - Mobile First */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* First row - Company & Invoice Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <Label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Công ty
                </Label>
                <Combobox
                  options={companyOptions}
                  value={selectedCompanyId}
                  onValueChange={(val) => setSelectedCompanyId(val)}
                  placeholder="Chọn công ty"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Loại hóa đơn
                </Label>
                <Combobox
                  options={invoiceTypeOptions}
                  value={invoiceType}
                  onValueChange={(val) => setInvoiceType(val as InvoiceType)}
                  placeholder="Chọn loại hóa đơn"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Tìm kiếm
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Số HĐ, tên, MST..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            {/* Second row - Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchInvoices} 
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="ml-1">Tải lại</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Download className="h-4 w-4" />
                <span className="ml-1">Xuất Excel</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Invoice List - Mobile First */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Mobile Card View */}
          <div className="block sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Không có hóa đơn nào
              </div>
            ) : (
              filteredInvoices.map((invoice) => (
                <div 
                  key={invoice.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer active:bg-gray-100 dark:active:bg-gray-700"
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          #{invoice.shdon}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {invoice.khhdon}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 truncate mb-1">
                        {invoiceType === 'banra' ? invoice.nmten : invoice.nbten}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(invoice.tdlap)}</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {invoice.tthai || 'Đã ký'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(invoice.tgtttbso)}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Số HĐ
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Ký hiệu
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Ngày lập
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Không có hóa đơn nào
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr 
                      key={invoice.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <td className="px-3 lg:px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.shdon}
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                        {invoice.khhdon}
                      </td>
                      <td className="px-3 lg:px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px] lg:max-w-[250px]">
                          {invoiceType === 'banra' ? invoice.nmten : invoice.nbten}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {invoiceType === 'banra' ? invoice.nmmst : invoice.nbmst}
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-sm text-right font-medium text-blue-600 dark:text-blue-400">
                        {formatCurrency(invoice.tgtttbso)}
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                        {formatDate(invoice.tdlap)}
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-center hidden lg:table-cell">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {invoice.tthai || 'Đã ký'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đồng bộ Hóa đơn</DialogTitle>
            <DialogDescription>
              Đồng bộ hóa đơn từ API Thuế Điện Tử về hệ thống
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Bearer Token *</Label>
                <Input
                  type="password"
                  placeholder="eyJhbGciOiJIUzUxMiJ9..."
                  value={syncConfig.bearerToken}
                  onChange={(e) =>
                    setSyncConfig({ ...syncConfig, bearerToken: e.target.value })
                  }
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lấy token từ cổng thuế điện tử
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Từ ngày</Label>
                  <Input
                    type="date"
                    value={syncConfig.fromDate}
                    onChange={(e) =>
                      setSyncConfig({ ...syncConfig, fromDate: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm">Đến ngày</Label>
                  <Input
                    type="date"
                    value={syncConfig.toDate}
                    onChange={(e) =>
                      setSyncConfig({ ...syncConfig, toDate: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Tên nhãn hàng (tùy chọn)</Label>
                <Input
                  placeholder="VD: Công ty ABC"
                  value={syncConfig.brandname}
                  onChange={(e) =>
                    setSyncConfig({ ...syncConfig, brandname: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>

              {syncProgress && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {syncProgress.message}
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {syncProgress.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${syncProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyncDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="ml-1">Đang đồng bộ...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span className="ml-1">Đồng bộ</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={(open) => {
        setShowConfigDialog(open);
        if (open) fetchApiConfig();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cài đặt API</DialogTitle>
            <DialogDescription>
              Cấu hình kết nối đến API Thuế Điện Tử
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Công ty *</Label>
                <Combobox
                  options={companyOptions}
                  value={apiConfig.congtyId}
                  onValueChange={(val) => setApiConfig({ ...apiConfig, congtyId: val })}
                  placeholder="Chọn công ty"
                />
              </div>
              <div>
                <Label className="text-sm">Tên cấu hình</Label>
                <Input 
                  placeholder="thue_dienttu" 
                  value={apiConfig.name}
                  onChange={(e) => setApiConfig({ ...apiConfig, name: e.target.value })}
                  className="mt-1.5" 
                />
              </div>
              <div>
                <Label className="text-sm">Bearer Token *</Label>
                <Input 
                  type="password" 
                  placeholder="eyJhbGciOiJIUzUxMiJ9..." 
                  value={apiConfig.bearerToken}
                  onChange={(e) => setApiConfig({ ...apiConfig, bearerToken: e.target.value })}
                  className="mt-1.5" 
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lấy token từ cổng thuế điện tử
                </p>
              </div>
              <div>
                <Label className="text-sm">Base URL</Label>
                <Input 
                  placeholder="https://hoadondientu.gdt.gov.vn:30000" 
                  value={apiConfig.baseUrl}
                  onChange={(e) => setApiConfig({ ...apiConfig, baseUrl: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Batch Size</Label>
                  <Input 
                    type="number" 
                    value={apiConfig.batchSize}
                    onChange={(e) => setApiConfig({ ...apiConfig, batchSize: parseInt(e.target.value) || 3 })}
                    className="mt-1.5" 
                  />
                </div>
                <div>
                  <Label className="text-sm">Delay (ms)</Label>
                  <Input 
                    type="number" 
                    value={apiConfig.delayBetweenBatches}
                    onChange={(e) => setApiConfig({ ...apiConfig, delayBetweenBatches: parseInt(e.target.value) || 3000 })}
                    className="mt-1.5" 
                  />
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveConfig} disabled={isSavingConfig || !apiConfig.congtyId}>
              {isSavingConfig ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="ml-1">Đang lưu...</span>
                </>
              ) : (
                'Lưu cấu hình'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết Hóa đơn</DialogTitle>
            <DialogDescription>
              Số hóa đơn: {selectedInvoice?.shdon} | Ký hiệu: {selectedInvoice?.khhdon}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {selectedInvoice && (
              <div className="space-y-4 sm:space-y-6">
                {/* Invoice Info - Mobile First Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                      Người bán
                    </h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-gray-500 dark:text-gray-400">MST:</span>{' '}
                        <span className="text-gray-900 dark:text-white">{selectedInvoice.nbmst}</span>
                      </p>
                      <p>
                        <span className="text-gray-500 dark:text-gray-400">Tên:</span>{' '}
                        <span className="text-gray-900 dark:text-white">{selectedInvoice.nbten}</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                      Người mua
                    </h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-gray-500 dark:text-gray-400">MST:</span>{' '}
                        <span className="text-gray-900 dark:text-white">{selectedInvoice.nmmst}</span>
                      </p>
                      <p>
                        <span className="text-gray-500 dark:text-gray-400">Tên:</span>{' '}
                        <span className="text-gray-900 dark:text-white">{selectedInvoice.nmten}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Money Info */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-3 sm:p-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Tiền hàng</div>
                      <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(selectedInvoice.tgtcthue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Thuế</div>
                      <div className="text-sm sm:text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedInvoice.tgtthue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Tổng cộng</div>
                      <div className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(selectedInvoice.tgtttbso)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details placeholder */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                    Chi tiết hàng hóa
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chưa có chi tiết. Nhấn &quot;Đồng bộ chi tiết&quot; để lấy từ API.
                  </p>
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
              Đóng
            </Button>
            <Button>
              <RefreshCw className="h-4 w-4" />
              <span className="ml-1">Đồng bộ chi tiết</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Company Dialog */}
      <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm Công ty</DialogTitle>
            <DialogDescription>
              Thêm công ty mới để quản lý hóa đơn riêng
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Mã số thuế *</Label>
                  <Input 
                    placeholder="5900363291" 
                    value={companyForm.mst}
                    onChange={(e) => setCompanyForm({ ...companyForm, mst: e.target.value })}
                    className="mt-1.5" 
                  />
                </div>
                <div>
                  <Label className="text-sm">Tên viết tắt</Label>
                  <Input 
                    placeholder="VD: Huy Vũ" 
                    value={companyForm.tenVietTat}
                    onChange={(e) => setCompanyForm({ ...companyForm, tenVietTat: e.target.value })}
                    className="mt-1.5" 
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Tên công ty *</Label>
                <Input 
                  placeholder="Công ty TNHH Huy Vũ" 
                  value={companyForm.ten}
                  onChange={(e) => setCompanyForm({ ...companyForm, ten: e.target.value })}
                  className="mt-1.5" 
                />
              </div>
              <div>
                <Label className="text-sm">Địa chỉ</Label>
                <Input 
                  placeholder="Số 123, Đường ABC, Quận XYZ" 
                  value={companyForm.diaChi}
                  onChange={(e) => setCompanyForm({ ...companyForm, diaChi: e.target.value })}
                  className="mt-1.5" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Điện thoại</Label>
                  <Input 
                    placeholder="0901234567" 
                    value={companyForm.dienThoai}
                    onChange={(e) => setCompanyForm({ ...companyForm, dienThoai: e.target.value })}
                    className="mt-1.5" 
                  />
                </div>
                <div>
                  <Label className="text-sm">Email</Label>
                  <Input 
                    placeholder="contact@company.com" 
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="mt-1.5" 
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Người đại diện</Label>
                <Input 
                  placeholder="Nguyễn Văn A" 
                  value={companyForm.nguoiDaiDien}
                  onChange={(e) => setCompanyForm({ ...companyForm, nguoiDaiDien: e.target.value })}
                  className="mt-1.5" 
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={companyForm.isDefault}
                  onChange={(e) => setCompanyForm({ ...companyForm, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isDefault" className="text-sm cursor-pointer">
                  Đặt làm công ty mặc định
                </Label>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompanyDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveCompany} disabled={isSavingCompany}>
              {isSavingCompany ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="ml-1">Đang lưu...</span>
                </>
              ) : (
                'Lưu công ty'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
