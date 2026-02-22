'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Pencil,
  Trash2,
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
import { Invoice, InvoiceType, SyncProgress, StreamProgress, CongTy, ApiConfig } from '@/app/types';

// Mock data for demo - sẽ được thay thế khi có data từ API
const mockInvoices: Invoice[] = [];

const invoiceTypeOptions = [
  { value: 'banra', label: 'Hóa đơn bán ra' },
  { value: 'muavao', label: 'Hóa đơn mua vào' },
];

// Extended sync progress state for streaming
interface ExtendedSyncProgress extends SyncProgress {
  phase?: 'fetch' | 'save' | 'detail';
  currentInvoice?: {
    shdon: string;
    khhdon: string;
    nbten?: string;
    nmten?: string;
  };
  detail?: {
    invoiceShdon: string;
    current: number;
    total: number;
  };
  // Kết quả cuối cùng
  result?: {
    totalRecords: number;
    successCount: number;
    errorCount: number;
    errors?: string[];
    detailResult?: {
      totalRecords: number;
      successCount: number;
      errorCount: number;
      errors?: string[];
    };
  };
}

export default function HoaDonPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('banra');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFromDate, setFilterFromDate] = useState(getDateRange(1).fromDate);
  const [filterToDate, setFilterToDate] = useState(getDateRange(1).toDate);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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
  const [syncSavedConfigs, setSyncSavedConfigs] = useState<ApiConfig[]>([]);
  const [syncSelectedConfigId, setSyncSelectedConfigId] = useState<string>('');
  const [syncInvoiceType, setSyncInvoiceType] = useState<InvoiceType>('banra'); // Loại hóa đơn để đồng bộ
  const [syncConfig, setSyncConfig] = useState({
    configId: '',
    bearerToken: '',
    fromDate: getDateRange(1).fromDate,
    toDate: getDateRange(1).toDate,
    brandname: '',
    syncDetails: false, // Có đồng bộ chi tiết không
  });
  const [syncProgress, setSyncProgress] = useState<ExtendedSyncProgress | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSessionId, setSyncSessionId] = useState<string | null>(null);
  const [isStopping, setIsStopping] = useState(false);

  // Config dialog state
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<ApiConfig[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    id: '',
    name: 'thue_dienttu',
    congtyId: '',
    bearerToken: '',
    baseUrl: 'https://hoadondientu.gdt.gov.vn:30000',
    batchSize: 3,
    delayBetweenBatches: 3000,
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isDeletingConfig, setIsDeletingConfig] = useState(false);

  // Detail dialog state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSyncingDetail, setIsSyncingDetail] = useState(false);

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
    // Pre-load configs khi page load cho cả 2 dialog
    fetchAllConfigs();
    fetchSyncConfigs();
  }, []);

  // Fetch configs when config dialog opens
  useEffect(() => {
    if (showConfigDialog) {
      console.log('Config dialog opened, fetching configs...');
      fetchAllConfigs();
    }
  }, [showConfigDialog]);

  // Fetch configs when sync dialog opens
  useEffect(() => {
    if (showSyncDialog) {
      console.log('Sync dialog opened, fetching sync configs...');
      fetchSyncConfigs();
    }
  }, [showSyncDialog]);

  // Fetch invoices when filters change
  useEffect(() => {
    fetchInvoices();
  }, [selectedCompanyId, invoiceType, filterFromDate, filterToDate]);

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
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
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
  }, [invoices, invoiceType, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredInvoices.reduce(
      (acc, inv) => ({
        count: acc.count + 1,
        amount: acc.amount + inv.tgtttbso,
        tax: acc.tax + inv.tgtthue,
      }),
      { count: 0, amount: 0, tax: 0 }
    );
  }, [filteredInvoices]);

  // Paginated invoices for rendering
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [invoiceType, searchTerm, selectedCompanyId, filterFromDate, filterToDate]);

  // Handle export errors
  const handleExportErrors = () => {
    if (!syncProgress?.result?.errors?.length && !syncProgress?.result?.detailResult?.errors?.length) {
      toast.info('Không có lỗi để xuất');
      return;
    }

    const rows = [['Nội dung lỗi', 'Thời gian']];
    const timestamp = new Date().toLocaleString('vi-VN');

    // Collect errors from main result
    if (syncProgress.result?.errors) {
      syncProgress.result.errors.forEach(err => rows.push([err, timestamp]));
    }

    // Collect errors from detail result
    if (syncProgress.result?.detailResult?.errors) {
      syncProgress.result.detailResult.errors.forEach(err => rows.push([err, timestamp]));
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + rows.map(e => e.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `loi_dong_bo_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle sync với streaming
  const handleSync = async () => {
    // Kiểm tra phải chọn cấu hình hoặc nhập token
    if (!syncSelectedConfigId && !syncConfig.bearerToken) {
      toast.warning('Vui lòng chọn cấu hình API hoặc nhập Bearer Token');
      return;
    }

    setIsSyncing(true);
    setIsStopping(false);
    setSyncProgress({
      current: 0,
      total: 0,
      message: syncConfig.syncDetails
        ? 'Đang kết nối đến API Thuế Điện Tử...'
        : 'Đang kết nối...',
      percentage: -1 // -1 = indeterminate (hiệu ứng chạy liên tục)
    });

    try {
      const response = await fetch('/api/invoices/sync-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configId: syncSelectedConfigId || undefined,
          bearerToken: syncConfig.bearerToken || undefined,
          invoiceType: syncInvoiceType, // Sử dụng loại hóa đơn từ dialog
          fromDate: syncConfig.fromDate,
          toDate: syncConfig.toDate,
          brandname: syncConfig.brandname,
          congtyId: selectedCompanyId,
          syncDetails: syncConfig.syncDetails,
        }),
      });

      // Lấy session ID từ header
      const sessionId = response.headers.get('X-Session-Id');
      if (sessionId) {
        setSyncSessionId(sessionId);
      }

      // Đọc streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Không thể đọc response');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Giữ lại line chưa hoàn thành

        let lastProgressUpdate: any = null;

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamProgress = JSON.parse(line.slice(6));

              // Update session ID if present
              if (data.sessionId && !syncSessionId) {
                setSyncSessionId(data.sessionId);
              }

              // Xử lý các event đặc biệt ngay lập tức
              if (data.type === 'complete' || data.type === 'aborted' || data.type === 'error') {
                if (lastProgressUpdate) {
                  setSyncProgress(lastProgressUpdate);
                  lastProgressUpdate = null;
                }

                if (data.type === 'complete') {
                  setSyncProgress({
                    current: data.result?.successCount || 0,
                    total: data.result?.totalRecords || 0,
                    message: `Đã đồng bộ ${data.result?.successCount}/${data.result?.totalRecords} hóa đơn`,
                    percentage: 100,
                    result: data.result,
                  });
                  let successMsg = `Đồng bộ thành công: ${data.result?.successCount}/${data.result?.totalRecords} hóa đơn`;
                  if (data.result?.detailResult) {
                    successMsg += `. Chi tiết: ${data.result.detailResult.successCount}/${data.result.detailResult.totalRecords} dòng`;
                  }
                  toast.success(successMsg);
                  fetchInvoices();
                } else if (data.type === 'aborted') {
                  setSyncProgress({
                    current: 0,
                    total: 0,
                    message: 'Đã dừng đồng bộ',
                    percentage: 0,
                  });
                  toast.info('Đã dừng đồng bộ');
                  fetchInvoices();
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'Lỗi không xác định');
                }
              } else {
                // Gộp các update tiến độ (progress, invoice, detail)
                lastProgressUpdate = {
                  current: data.current || 0,
                  total: data.total || 0,
                  message: data.message || (data.type === 'detail' ? 'Đang đồng bộ chi tiết...' : 'Đang xử lý...'),
                  percentage: data.percentage ?? -1,
                  phase: data.type === 'detail' ? 'detail' : data.phase,
                  currentInvoice: data.invoice,
                  detail: data.detail,
                };
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete data
            }
          }
        }

        // Cập nhật progress cuối cùng của chunk này
        if (lastProgressUpdate) {
          setSyncProgress(lastProgressUpdate);
        }
      }
    } catch (error) {
      toast.error(`Lỗi đồng bộ: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      setSyncProgress(null);
    } finally {
      setIsSyncing(false);
      setIsStopping(false);
      setSyncSessionId(null);
    }
  };

  // Handle stop sync
  const handleStopSync = async () => {
    if (!syncSessionId) return;

    setIsStopping(true);
    try {
      await fetch(`/api/invoices/sync-stream?sessionId=${syncSessionId}`, {
        method: 'DELETE',
      });
      toast.info('Đang dừng đồng bộ...');
    } catch (error) {
      toast.error('Không thể dừng đồng bộ');
      setIsStopping(false);
    }
  };

  // Handle sync detail for single invoice
  const handleSyncInvoiceDetail = async () => {
    if (!selectedInvoice) return;

    // Kiểm tra có config để lấy token
    if (syncSavedConfigs.length === 0) {
      toast.warning('Chưa có cấu hình API. Vui lòng vào Cài đặt để tạo cấu hình.');
      return;
    }

    setIsSyncingDetail(true);
    try {
      // Lấy config đầu tiên để dùng token
      const configId = syncSavedConfigs[0].id;

      const response = await fetch(`/api/invoices/${selectedInvoice.id}/sync-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Đã đồng bộ ${result.data.successCount} chi tiết`);
        // Refresh invoice detail
        const detailResponse = await fetch(`/api/invoices/${selectedInvoice.id}`);
        const detailResult = await detailResponse.json();
        if (detailResult.success) {
          setSelectedInvoice(detailResult.data);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(`Lỗi: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsSyncingDetail(false);
    }
  };

  // Fetch configs for sync dialog (all active configs)
  const fetchSyncConfigs = async () => {
    try {
      // Fetch TẤT CẢ configs (không filter theo công ty)
      const response = await fetch('/api/config');
      const result = await response.json();
      console.log('Sync configs result:', result);
      if (result.success) {
        setSyncSavedConfigs(result.data);
        // Auto select first config if available
        if (result.data.length > 0) {
          const firstConfigId = result.data[0].id;
          handleSelectSyncConfig(firstConfigId);
        } else {
          setSyncSelectedConfigId('');
        }
      }
    } catch (error) {
      console.error('Error fetching sync configs:', error);
    }
  };

  // Handle select config for sync
  const handleSelectSyncConfig = async (configId: string) => {
    setSyncSelectedConfigId(configId);

    if (configId) {
      // Fetch full config detail to get brandname
      try {
        const response = await fetch(`/api/config/${configId}`);
        const result = await response.json();
        if (result.success && result.data) {
          setSyncConfig(prev => ({
            ...prev,
            configId: configId,
            bearerToken: result.data.bearerToken || '',
            brandname: result.data.brandname || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching config detail:', error);
      }
    } else {
      // Clear brandname when no config selected
      setSyncConfig(prev => ({
        ...prev,
        configId: '',
        brandname: '',
      }));
    }
  };

  // Fetch invoices from API
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        loaihd: invoiceType,
        pageSize: '100000', // Đặt số lớn để lấy toàn bộ danh sách cho filter và tính tổng ở client-side
        fromDate: filterFromDate,
        toDate: filterToDate,
      });

      if (selectedCompanyId) {
        params.append('congtyId', selectedCompanyId);
      }

      const response = await fetch(`/api/invoices?${params.toString()}`);
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

    // Kiểm tra token không được là giá trị masked
    if (apiConfig.bearerToken.startsWith('***')) {
      toast.warning('Bearer Token không hợp lệ. Vui lòng nhập token đầy đủ.');
      return;
    }

    setIsSavingConfig(true);
    try {
      // Nếu đang edit thì dùng PUT, ngược lại dùng POST
      const url = isEditingConfig && apiConfig.id
        ? `/api/config/${apiConfig.id}`
        : '/api/config';
      const method = isEditingConfig && apiConfig.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiConfig),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(isEditingConfig ? 'Cập nhật cấu hình thành công!' : 'Lưu cấu hình thành công!');
        await fetchAllConfigs(); // Refresh danh sách configs
        resetConfigForm();
      } else {
        throw new Error(result.error || 'Không thể lưu cấu hình');
      }
    } catch (error) {
      toast.error(`Lỗi lưu cấu hình: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Reset config form
  const resetConfigForm = () => {
    setApiConfig({
      id: '',
      name: 'thue_dienttu',
      congtyId: selectedCompanyId,
      bearerToken: '',
      baseUrl: 'https://hoadondientu.gdt.gov.vn:30000',
      batchSize: 3,
      delayBetweenBatches: 3000,
    });
    setSelectedConfigId('');
    setIsEditingConfig(false);
  };

  // Fetch all configs
  const fetchAllConfigs = async () => {
    setIsLoadingConfigs(true);
    try {
      console.log('Fetching all configs...');
      const response = await fetch('/api/config');
      const result = await response.json();
      console.log('Configs result:', result);
      if (result.success && Array.isArray(result.data)) {
        setSavedConfigs(result.data);
        console.log('savedConfigs set to:', result.data.length, 'items');
      } else {
        setSavedConfigs([]);
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
      setSavedConfigs([]);
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  // Fetch config detail for editing (load full token from API)
  const fetchConfigDetail = async (configId: string) => {
    try {
      const response = await fetch(`/api/config/${configId}`);
      const result = await response.json();
      if (result.success && result.data) {
        const config = result.data;
        setApiConfig({
          id: config.id,
          name: config.name || 'thue_dienttu',
          congtyId: config.congtyId || '',
          bearerToken: config.bearerToken || '', // Full token từ API detail
          baseUrl: config.baseUrl || 'https://hoadondientu.gdt.gov.vn:30000',
          batchSize: config.batchSize || 3,
          delayBetweenBatches: config.delayBetweenBatches || 3000,
        });
        setIsEditingConfig(true);
      }
    } catch (error) {
      console.error('Error fetching config detail:', error);
      toast.error('Không thể tải chi tiết cấu hình');
    }
  };

  // Handle select config to edit
  const handleSelectConfig = async (configId: string) => {
    setSelectedConfigId(configId);
    if (configId) {
      await fetchConfigDetail(configId);
    } else {
      resetConfigForm();
    }
  };

  // Handle delete config
  const handleDeleteConfig = async () => {
    if (!selectedConfigId) return;

    setIsDeletingConfig(true);
    try {
      const response = await fetch(`/api/config/${selectedConfigId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Đã xóa cấu hình!');
        await fetchAllConfigs();
        resetConfigForm();
      } else {
        throw new Error(result.error || 'Không thể xóa cấu hình');
      }
    } catch (error) {
      toast.error(`Lỗi xóa cấu hình: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsDeletingConfig(false);
    }
  };

  // Fetch API config for selected company (old function - updated)
  const fetchApiConfig = async () => {
    if (!selectedCompanyId) return;

    try {
      const response = await fetch(`/api/config?congtyId=${selectedCompanyId}`);
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        const config = result.data[0];
        setApiConfig({
          id: config.id || '',
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
          id: '',
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
            {/* First row - Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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
              <div>
                <Label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Từ ngày
                </Label>
                <Input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Đến ngày
                </Label>
                <Input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                />
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
              paginatedInvoices.map((invoice) => (
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
                {paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Không có hóa đơn nào
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((invoice) => (
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

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Trước
                </Button>
                <div className="text-xs text-gray-500 flex items-center">Trang {currentPage}/{totalPages}</div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Sau
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredInvoices.length)}</span> của <span className="font-medium">{filteredInvoices.length}</span> hóa đơn
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button variant="outline" size="sm" className="rounded-r-none" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      Trước
                    </Button>
                    <div className="px-4 py-2 bg-white dark:bg-gray-800 border-y border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trang {currentPage} / {totalPages}
                    </div>
                    <Button variant="outline" size="sm" className="rounded-l-none" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      Sau
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={(open) => {
        // Không cho đóng dialog khi đang sync
        if (!open && isSyncing) {
          return;
        }
        setShowSyncDialog(open);
        if (open) {
          setSyncProgress(null);
          setSyncSessionId(null);
          setIsStopping(false);
          setSyncInvoiceType(invoiceType); // Đặt mặc định theo filter đang chọn
        } else {
          // Reset state when closing
          setSyncSelectedConfigId('');
          setSyncInvoiceType('banra');
          setSyncConfig({
            configId: '',
            bearerToken: '',
            fromDate: getDateRange(1).fromDate,
            toDate: getDateRange(1).toDate,
            brandname: '',
            syncDetails: false,
          });
          setSyncProgress(null);
          setSyncSessionId(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đồng bộ Hóa đơn</DialogTitle>
            <DialogDescription>
              Đồng bộ hóa đơn từ API Thuế Điện Tử về hệ thống
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              {/* Chọn cấu hình đã lưu */}
              <div>
                <Label className="text-sm font-medium">Chọn cấu hình API</Label>
                <Combobox
                  options={[
                    { value: '', label: 'Nhập token thủ công' },
                    ...syncSavedConfigs.map((c) => ({
                      value: c.id,
                      label: `${c.name} (${c.congty?.tenVietTat || c.congty?.ten || 'N/A'})`,
                    }))
                  ]}
                  value={syncSelectedConfigId}
                  onValueChange={handleSelectSyncConfig}
                  placeholder="Chọn cấu hình đã lưu"
                />
                {syncSavedConfigs.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Chưa có cấu hình nào. Vui lòng vào Cài đặt để tạo cấu hình mới.
                  </p>
                )}
              </div>

              {/* Chọn loại hóa đơn */}
              <div>
                <Label className="text-sm font-medium">Loại hóa đơn</Label>
                <Combobox
                  options={invoiceTypeOptions}
                  value={syncInvoiceType}
                  onValueChange={(val) => setSyncInvoiceType(val as InvoiceType)}
                  placeholder="Chọn loại hóa đơn"
                />
              </div>

              {/* Hiển thị input token khi chọn "Nhập token thủ công" */}
              {!syncSelectedConfigId && (
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
              )}

              {/* Thông báo đang dùng config đã lưu */}
              {syncSelectedConfigId && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-1.5">
                    <Settings className="h-4 w-4" />
                    Sử dụng Bearer Token từ cấu hình đã lưu
                  </p>
                  <div className="bg-white/50 dark:bg-black/20 rounded border border-green-100 dark:border-green-900/50 p-2 overflow-hidden">
                    <p className="text-[10px] font-mono break-all text-gray-500 dark:text-gray-400">
                      {syncConfig.bearerToken || 'Đang tải token...'}
                    </p>
                  </div>
                </div>
              )}

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

              {/* Option đồng bộ chi tiết */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  id="syncDetails"
                  checked={syncConfig.syncDetails}
                  onChange={(e) => setSyncConfig({ ...syncConfig, syncDetails: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <Label htmlFor="syncDetails" className="text-sm font-medium cursor-pointer">
                    Đồng bộ chi tiết hóa đơn
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Lấy thêm chi tiết hàng hóa/dịch vụ của từng hóa đơn (mất thêm thời gian)
                  </p>
                </div>
              </div>

              {/* Progress Display */}
              {syncProgress && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 space-y-3">
                  {/* Main Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {syncProgress.message}
                      </span>
                      {syncProgress.percentage >= 0 && (
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          {syncProgress.percentage}%
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
                      {syncProgress.percentage < 0 ? (
                        // Indeterminate progress - animated bar
                        <div className="h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-indeterminate" />
                      ) : (
                        // Determinate progress - fixed percentage
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${syncProgress.percentage}%` }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Current Invoice Detail */}
                  {syncProgress.currentInvoice && (
                    <div className="bg-white dark:bg-gray-800 rounded-md p-2 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mb-1">
                        <FileText className="h-3 w-3" />
                        <span>Đang xử lý hóa đơn:</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        #{syncProgress.currentInvoice.shdon} - {syncProgress.currentInvoice.khhdon}
                      </div>
                      {(syncProgress.currentInvoice.nbten || syncProgress.currentInvoice.nmten) && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {invoiceType === 'banra'
                            ? syncProgress.currentInvoice.nmten
                            : syncProgress.currentInvoice.nbten}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detail Sync Progress */}
                  {syncProgress.phase === 'detail' && syncProgress.detail && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3 border border-green-200 dark:border-green-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-green-700 dark:text-green-300">
                          <Download className="h-4 w-4" />
                          <span>Chi tiết HĐ #{syncProgress.detail.invoiceShdon}</span>
                        </div>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">
                          {syncProgress.detail.current} / {syncProgress.detail.total} HĐ
                        </span>
                      </div>

                      <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                        <div
                          className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(syncProgress.detail.current / syncProgress.detail.total) * 100}%` }}
                        />
                      </div>

                      <p className="text-[10px] text-green-600 dark:text-green-400 italic">
                        * Tự động điều tiết tốc độ để tránh bị chặn từ API Thuế...
                      </p>
                    </div>
                  )}

                  {/* Phase indicator */}
                  {syncProgress.phase && syncProgress.percentage < 100 && (
                    <div className="flex items-center gap-3 text-xs">
                      <div className={`flex items-center gap-1 ${syncProgress.phase === 'fetch' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${syncProgress.phase === 'fetch' ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`} />
                        <span>Tải từ API</span>
                      </div>
                      <div className={`flex items-center gap-1 ${syncProgress.phase === 'save' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${syncProgress.phase === 'save' ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`} />
                        <span>Lưu HĐ</span>
                      </div>
                      {syncConfig.syncDetails && (
                        <div className={`flex items-center gap-1 ${syncProgress.phase === 'detail' ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${syncProgress.phase === 'detail' ? 'bg-green-600 animate-pulse' : 'bg-gray-300'}`} />
                          <span>Chi tiết</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Kết quả chi tiết khi hoàn thành */}
                  {syncProgress.percentage === 100 && syncProgress.result && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white dark:bg-gray-800 rounded-md p-2">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {syncProgress.result.totalRecords}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Tổng số</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-md p-2">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {syncProgress.result.successCount}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Thành công</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-md p-2">
                          <div className="text-lg font-bold text-red-600 dark:text-red-400">
                            {syncProgress.result.errorCount}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Lỗi</div>
                        </div>
                      </div>

                      {/* Chi tiết hàng hóa nếu có */}
                      {syncProgress.result.detailResult && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-2 border border-green-200 dark:border-green-700">
                          <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                            Chi tiết hàng hóa/dịch vụ
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {syncProgress.result.detailResult.totalRecords}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400"> dòng</span>
                            </div>
                            <div>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {syncProgress.result.detailResult.successCount}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400"> OK</span>
                            </div>
                            <div>
                              <span className="font-semibold text-red-600 dark:text-red-400">
                                {syncProgress.result.detailResult.errorCount}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400"> lỗi</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Nút xuất lỗi nếu có */}
                      {(syncProgress.result.errorCount > 0 || (syncProgress.result.detailResult && syncProgress.result.detailResult.errorCount > 0)) && (
                        <div className="flex justify-end pt-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleExportErrors}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Xuất file lỗi ({syncProgress.result.errorCount + (syncProgress.result.detailResult?.errorCount || 0)})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (isSyncing) {
                  handleStopSync();
                } else {
                  setShowSyncDialog(false);
                }
              }}
              disabled={isStopping}
            >
              {isSyncing ? (
                isStopping ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="ml-1">Đang dừng...</span>
                  </>
                ) : (
                  'Dừng'
                )
              ) : (
                'Hủy'
              )}
            </Button>
            <Button onClick={handleSync} disabled={isSyncing || (!syncSelectedConfigId && !syncConfig.bearerToken)}>
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
        if (!open) {
          resetConfigForm();
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cài đặt API</DialogTitle>
            <DialogDescription>
              Cấu hình kết nối đến API Thuế Điện Tử
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              {/* Danh sách cấu hình đã lưu */}
              <div>
                <Label className="text-sm font-medium">Chọn cấu hình đã lưu</Label>
                {isLoadingConfigs ? (
                  <div className="flex items-center gap-2 mt-1 py-2 px-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                    <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500">Đang tải cấu hình...</span>
                  </div>
                ) : savedConfigs.length > 0 ? (
                  <Combobox
                    options={[
                      { value: '', label: '+ Tạo cấu hình mới' },
                      ...savedConfigs.map((c) => ({
                        value: c.id,
                        label: `${c.name} (${c.congty?.tenVietTat || c.congty?.ten || c.congtyId})`,
                      }))
                    ]}
                    value={selectedConfigId}
                    onValueChange={handleSelectConfig}
                    placeholder="Chọn cấu hình hoặc tạo mới"
                  />
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 py-2 px-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                    Chưa có cấu hình nào. Điền thông tin bên dưới để tạo mới.
                  </p>
                )}
              </div>

              {/* Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">
                    {isEditingConfig ? 'Chỉnh sửa cấu hình' : 'Thông tin cấu hình'}
                  </span>
                </div>
              </div>

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
            {isEditingConfig && selectedConfigId && (
              <Button
                variant="destructive"
                onClick={handleDeleteConfig}
                disabled={isDeletingConfig}
                className="mr-auto"
              >
                {isDeletingConfig ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="ml-1 hidden sm:inline">Xóa</span>
              </Button>
            )}
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
                <>
                  {isEditingConfig ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span className="ml-1">{isEditingConfig ? 'Cập nhật' : 'Lưu cấu hình'}</span>
                </>
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

                {/* Details section */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                    Chi tiết hàng hóa
                  </h4>
                  {selectedInvoice.details && selectedInvoice.details.length > 0 ? (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">STT</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Tên hàng hóa</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">SL</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Đơn giá</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {selectedInvoice.details.map((detail) => (
                            <tr key={detail.id}>
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{detail.stt}</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white truncate max-w-[200px]">{detail.ten}</td>
                              <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{detail.sluong}</td>
                              <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{formatCurrency(detail.dgia)}</td>
                              <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(detail.thtien)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Chưa có chi tiết. Nhấn &quot;Đồng bộ chi tiết&quot; để lấy từ API.
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
              Đóng
            </Button>
            <Button onClick={handleSyncInvoiceDetail} disabled={isSyncingDetail}>
              {isSyncingDetail ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="ml-1">Đang đồng bộ...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span className="ml-1">Đồng bộ chi tiết</span>
                </>
              )}
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
