'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  RefreshCw,
  Plus,
  ArrowUpDown,
  StopCircle,
} from 'lucide-react';
import { useRef } from 'react';
import { DashboardLayout } from '@/app/components/dashboard-layout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Combobox } from '@/app/components/ui/combobox';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';

interface TrainingItem {
  tenGoc: string;
  tenChuan: string | null;
  dvtinh: string | null;
  frequency: number;
  isMapped: boolean;
}

export default function TrainingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<TrainingItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  // Filters
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [onlyUnmapped, setOnlyUnmapped] = useState(true);

  // Sorting
  const [orderBy, setOrderBy] = useState<'tenGoc' | 'frequency' | 'isMapped' | 'tenChuan'>('frequency');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Selection
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  // Update Dialog
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [standardName, setStandardName] = useState('');
  const [maHang, setMaHang] = useState('');
  const [nhomHang, setNhomHang] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestProgress, setSuggestProgress] = useState({ percent: 0, message: '' });
  const [aiLimit, setAiLimit] = useState<number>(80);
  const [apiKey, setApiKey] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch('/api/congty');
      const result = await response.json();
      if (result.success) {
        setCompanies(result.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'list',
        search: debouncedSearch,
        onlyUnmapped: String(onlyUnmapped),
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        orderBy,
        order
      });
      if (selectedCompanyId) params.append('congtyId', selectedCompanyId);

      const response = await fetch(`/api/training?${params}`);
      const result = await response.json();
      if (result.success) {
        setItems(result.items);
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu huấn luyện');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, onlyUnmapped, pagination.page, pagination.limit, selectedCompanyId, orderBy, order]);

  // Load cached company
  useEffect(() => {
    const cached = localStorage.getItem('last_selected_company_id');
    if (cached) setSelectedCompanyId(cached);
  }, []);

  // Save cached company
  useEffect(() => {
    if (selectedCompanyId) {
      localStorage.setItem('last_selected_company_id', selectedCompanyId);
    }
  }, [selectedCompanyId]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination(p => ({ ...p, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNames(items.map(i => i.tenGoc));
    } else {
      setSelectedNames([]);
    }
  };

  const handleSelectItem = (name: string, checked: boolean) => {
    if (checked) {
      setSelectedNames(prev => [...prev, name]);
    } else {
      setSelectedNames(prev => prev.filter(n => n !== name));
    }
  };

  const handleUpdateMapping = async () => {
    if (!standardName) {
      toast.error('Vui lòng nhập tên mặt hàng chuẩn');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          items: selectedNames,
          standardName,
          info: {
            maHang,
            nhomHang,
            congtyId: selectedCompanyId || undefined
          }
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        setShowUpdateDialog(false);
        setSelectedNames([]);
        setStandardName('');
        fetchItems();
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật chuẩn hóa');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSyncDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        fetchItems();
      }
    } catch (error) {
      toast.error('Lỗi khi đồng bộ dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoTraining = async () => {
    if (!apiKey || apiKey.trim() === '') {
      toast.error('Vui lòng nhập API Key để chạy AI Training');
      return;
    }

    setIsSuggesting(true);
    setSuggestions([]);
    setSuggestProgress({ percent: 5, message: 'Khởi tạo tiến trình phân tích AI...' });

    try {
      const params = new URLSearchParams({
        action: 'suggest_stream',
        aiLimit: aiLimit.toString()
      });
      if (selectedCompanyId) params.append('congtyId', selectedCompanyId);
      if (apiKey) params.append('apiKey', apiKey);

      const eventSource = new EventSource(`/api/training?${params}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('AI Training Progress:', data);
          setSuggestProgress({ percent: data.percent, message: data.message });

          if (data.percent === 100) {
            eventSource.close();
            eventSourceRef.current = null;
            setIsSuggesting(false);

            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
              setSuggestions(data.data);
              toast.success(`AI đã tìm thấy ${data.data.length} nhóm mặt hàng tương đồng`);
            } else {
              // Nếu data rỗng nhưng success thì báo tin nhắn của server
              if (data.message && data.message.includes('Lỗi')) {
                toast.error(data.message);
              } else {
                toast.info(data.message || 'Không tìm thấy thêm gợi ý tương đồng mới');
              }
            }
          }
        } catch (e) {
          console.error("Error parsing SSE data:", e);
        }
      };

      eventSource.onerror = (error) => {
        if (eventSourceRef.current) {
          eventSource.close();
          eventSourceRef.current = null;
          setIsSuggesting(false);
          toast.error('Mất kết nối với dịch vụ AI hoặc bạn đã dừng tiến trình');
        }
      };
    } catch (error) {
      setIsSuggesting(false);
      toast.error('Lỗi khi chạy training tự động');
    }
  };

  const handleStopAutoTraining = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsSuggesting(false);
      setSuggestProgress({ percent: 0, message: 'Đã dừng theo yêu cầu người dùng' });
      toast.info('Đã dừng tiến trình AI');
    }
  };

  const handleApplySuggestion = (suggestion: any) => {
    setSelectedNames(suggestion.variants);
    setStandardName(suggestion.standard);
    setShowUpdateDialog(true);
  };

  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const handleApplyAllSuggestions = async () => {
    if (suggestions.length === 0) return;

    if (!confirm(`Bạn có chắc muốn áp dụng tất cả ${suggestions.length} nhóm gợi ý từ AI?`)) {
      return;
    }

    setIsBulkUpdating(true);
    try {
      const response = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_update',
          suggestions,
          congtyId: selectedCompanyId || undefined
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        setSuggestions([]);
        fetchItems();
      }
    } catch (error) {
      toast.error('Lỗi khi áp dụng hàng loạt');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const toggleSort = (field: 'tenGoc' | 'frequency' | 'isMapped' | 'tenChuan') => {
    if (orderBy === field) {
      setOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(field);
      setOrder('desc');
    }
    setPagination(p => ({ ...p, page: 1 }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-500" />
              Huấn luyện & Chuẩn hóa mặt hàng
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gộp các mặt hàng tương đồng về cùng một tên chuẩn để báo cáo chính xác
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSyncDatabase} disabled={isLoading}>
              <Database className="h-4 w-4 mr-1" />
              Lưu & Đồng bộ bảng kê
            </Button>
            <Button
              size="sm"
              onClick={() => setShowUpdateDialog(true)}
              disabled={selectedNames.length === 0}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Cập nhật tương đồng ({selectedNames.length})
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center text-gray-700 dark:text-gray-300">
            <div className="w-full lg:w-72 space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-gray-500">Công ty</Label>
              <Combobox
                options={[{ value: '', label: 'Tất cả công ty' }, ...companies.map(c => ({ value: c.id, label: c.ten }))]}
                value={selectedCompanyId}
                onValueChange={setSelectedCompanyId}
                placeholder="Chọn công ty..."
              />
            </div>

            <div className="flex-1 space-y-1.5 w-full">
              <Label className="text-[10px] uppercase font-bold text-gray-500">Tìm kiếm mặt hàng gốc</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nhập tên mặt hàng gốc..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 lg:mt-6 px-2 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
              <Checkbox
                id="unmapped"
                checked={onlyUnmapped}
                onCheckedChange={(v: boolean) => setOnlyUnmapped(!!v)}
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <Label htmlFor="unmapped" className="text-xs font-medium cursor-pointer whitespace-nowrap">
                Chỉ hiện hàng chưa chuẩn hóa
              </Label>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchItems()}
              className="lg:mt-6 h-10 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <Checkbox
                      checked={selectedNames.length === items.length && items.length > 0}
                      onCheckedChange={(v: boolean) => handleSelectAll(!!v)}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-blue-600 transition-colors"
                      onClick={() => toggleSort('tenGoc')}
                    >
                      Tên gốc (Trên hóa đơn)
                      <ArrowUpDown className={`h-3 w-3 ${orderBy === 'tenGoc' ? 'text-blue-500' : 'text-gray-300'}`} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-blue-600 transition-colors"
                      onClick={() => toggleSort('tenChuan')}
                    >
                      Tên chuẩn hóa
                      <ArrowUpDown className={`h-3 w-3 ${orderBy === 'tenChuan' ? 'text-blue-500' : 'text-gray-300'}`} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-blue-600 transition-colors mx-auto"
                      onClick={() => toggleSort('frequency')}
                    >
                      Số lần
                      <ArrowUpDown className={`h-3 w-3 ${orderBy === 'frequency' ? 'text-blue-500' : 'text-gray-300'}`} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-blue-600 transition-colors mx-auto"
                      onClick={() => toggleSort('isMapped')}
                    >
                      Trạng thái
                      <ArrowUpDown className={`h-3 w-3 ${orderBy === 'isMapped' ? 'text-blue-500' : 'text-gray-300'}`} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {isLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy mặt hàng nào cần chuẩn hóa.'}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.tenGoc} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedNames.includes(item.tenGoc) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <Checkbox
                          checked={selectedNames.includes(item.tenGoc)}
                          onCheckedChange={(v: boolean) => handleSelectItem(item.tenGoc, !!v)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{item.tenGoc}</div>
                        <div className="text-xs text-gray-500 lowercase">{item.dvtinh}</div>
                      </td>
                      <td className="px-4 py-3">
                        {item.tenChuan ? (
                          <div className="flex items-center gap-2 text-blue-600 font-medium">
                            {item.tenChuan}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Chưa có mapping</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {item.frequency}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.isMapped ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-600">
                            ĐÃ HỌC
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600">
                            MỚI
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Hiển thị:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => setPagination(p => ({ ...p, limit: Number(e.target.value), page: 1 }))}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
              <div className="hidden sm:block text-gray-400">|</div>
              <div>
                Trang {pagination.page}/{pagination.totalPages} | Tổng {pagination.total} mặt hàng
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>

        {/* Suggestion Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Sparkles className="h-40 w-40 text-blue-600" />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 dark:bg-blue-500 rounded-2xl p-3 shadow-lg shadow-blue-500/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-blue-900 dark:text-blue-100 font-bold text-lg">Phân tích tương đồng thông minh</h3>
                <p className="text-sm text-blue-700/70 dark:text-blue-300/60">Hệ thống AI sẽ quét và tự động phát hiện các mặt hàng có cùng gốc từ.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                <Label className="text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap">API Key:</Label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Nhập API Key..."
                  className="w-32 bg-transparent text-sm text-blue-600 focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                <Label className="text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap">Số lượng quét:</Label>
                <input
                  type="number"
                  value={aiLimit}
                  onChange={(e) => setAiLimit(Math.min(500, Math.max(10, parseInt(e.target.value) || 0)))}
                  className="w-16 bg-transparent text-sm font-bold text-blue-600 focus:outline-none"
                />
              </div>

              {suggestions.length > 0 && (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white font-bold"
                  size="sm"
                  onClick={handleApplyAllSuggestions}
                  disabled={isBulkUpdating || isSuggesting}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {isBulkUpdating ? 'Đang áp dụng...' : `Áp dụng tất cả ${suggestions.length} gợi ý`}
                </Button>
              )}

              {isSuggesting ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleStopAutoTraining}
                  className="font-bold border-2 border-red-500 hover:bg-red-600 animate-pulse"
                >
                  <StopCircle className="h-4 w-4 mr-1" />
                  DỪNG LẠI
                </Button>
              ) : (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  size="sm"
                  onClick={handleAutoTraining}
                  disabled={isSuggesting}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Chạy Training Tự Động
                </Button>
              )}
            </div>
          </div>

          {isSuggesting && (
            <div className="mb-8 w-full bg-blue-100/50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                <span>Tiến trình: {suggestProgress.message}</span>
                <span>{suggestProgress.percent}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out relative" style={{ width: `${suggestProgress.percent}%` }}>
                  <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.length === 0 ? (
              <div className="bg-white/40 dark:bg-gray-800/40 p-10 rounded-xl border-2 border-dashed border-blue-200/50 dark:border-blue-700/30 col-span-full">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-3">
                    <Filter className="h-6 w-6 text-blue-500" />
                  </div>
                  <h4 className="text-blue-900 dark:text-blue-100 font-semibold mb-1">Chưa có gợi ý phân tích</h4>
                  <p className="text-xs text-blue-700/60 dark:text-blue-300/60 max-w-[300px]">Nhấn "Chạy Training Tự Động" để quét và tìm các nhóm mặt hàng tương đồng.</p>
                </div>
              </div>
            ) : (
              suggestions.map((s, idx) => (
                <div key={idx} className="group bg-white dark:bg-gray-800 p-5 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">GỢI Ý #{idx + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] font-bold text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg group-hover:scale-105 transition-all"
                      onClick={() => handleApplySuggestion(s)}
                    >
                      Áp dụng ngay
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{s.standard}</div>
                    <div className="flex flex-wrap gap-1.5 overflow-hidden">
                      {s.variants.slice(0, 3).map((v: string) => (
                        <span key={v} className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                          {v}
                        </span>
                      ))}
                      {s.variants.length > 3 && (
                        <span className="text-[9px] px-1.5 py-0.5 text-gray-400 font-medium">+{s.variants.length - 3} hàng khác</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thiết lập Tên Mặt hàng Chuẩn</DialogTitle>
            <DialogDescription>
              Bạn đang chuẩn hóa {selectedNames.length} tên biến thể về một tên duy nhất.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 max-h-[200px] overflow-y-auto shadow-inner">
                <Label className="text-[10px] uppercase font-bold text-gray-500 mb-2 flex items-center gap-2">
                  <Database className="h-3 w-3" />
                  Các tên gốc đã chọn:
                </Label>
                <div className="grid grid-cols-1 gap-1">
                  {selectedNames.map(n => (
                    <div key={n} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span className="truncate">{n}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Tên mặt hàng chuẩn (Standard Name)</Label>
                <Input
                  placeholder="Vd: Thép Hòa Phát Phi 10"
                  value={standardName}
                  onChange={(e) => setStandardName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Mã hàng (Tùy chọn)</Label>
                  <Input
                    placeholder="Vd: THEP-HP-10"
                    value={maHang}
                    onChange={(e) => setMaHang(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Nhóm hàng (Tùy chọn)</Label>
                  <Input
                    placeholder="Vd: Vật dụng xây dựng"
                    value={nhomHang}
                    onChange={(e) => setNhomHang(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>Hủy</Button>
            <Button onClick={handleUpdateMapping} disabled={isUpdating}>
              {isUpdating ? 'Đang cập nhật...' : 'Xác nhận Chuẩn hóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
