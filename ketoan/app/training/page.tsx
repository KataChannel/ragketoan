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
} from 'lucide-react';
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
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  
  // Filters
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [onlyUnmapped, setOnlyUnmapped] = useState(true);
  
  // Selection
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  
  // Update Dialog
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [standardName, setStandardName] = useState('');
  const [maHang, setMaHang] = useState('');
  const [nhomHang, setNhomHang] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
        search,
        onlyUnmapped: String(onlyUnmapped),
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
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
  }, [search, onlyUnmapped, pagination.page, pagination.limit, selectedCompanyId]);

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
      }
    } catch (error) {
      toast.error('Lỗi khi đồng bộ dữ liệu');
    } finally {
      setIsLoading(false);
    }
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end text-gray-700 dark:text-gray-300">
            <div className="w-full sm:w-64 space-y-1.5">
              <Label className="text-xs">Chọn Công ty</Label>
              <Combobox
                options={[{ value: '', label: 'Tất cả công ty' }, ...companies.map(c => ({ value: c.id, label: c.ten }))]}
                value={selectedCompanyId}
                onValueChange={setSelectedCompanyId}
                placeholder="Chọn công ty..."
              />
            </div>

            <div className="flex-1 space-y-1.5 w-full">
              <Label className="text-xs">Tìm kiếm mặt hàng</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nhập tên mặt hàng gốc..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Checkbox 
                id="unmapped" 
                checked={onlyUnmapped} 
                onCheckedChange={(v: boolean) => setOnlyUnmapped(!!v)}
              />
              <Label htmlFor="unmapped" className="text-sm cursor-pointer whitespace-nowrap">
                Chỉ hiện hàng chưa chuẩn hóa
              </Label>
            </div>

            <Button variant="outline" size="sm" onClick={() => fetchItems()}>
              Lọc dữ liệu
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên gốc (Trên hóa đơn)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên chuẩn hóa</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Số lần</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
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
            <div>
              Trang {pagination.page}/{pagination.totalPages} | Tổng số {pagination.total} mặt hàng
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
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-full p-2">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-blue-900 dark:text-blue-100 font-bold">Tự động nhận diện mặt hàng tương đồng</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">Hệ thống sẽ quét và gợi ý các mặt hàng có khả năng là một.</p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
              Chạy Training Tự Động
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700 opacity-50">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-bold text-gray-400">GỢI Ý #1</span>
                 <Button variant="ghost" size="sm" className="h-6 text-[10px]" disabled>Xem chi tiết</Button>
              </div>
              <p className="text-xs text-gray-500 italic">Tính năng tự động đang được hoàn thiện...</p>
            </div>
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
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-dashed border-gray-300 dark:border-gray-600 max-h-[120px] overflow-y-auto">
                <Label className="text-[10px] uppercase text-gray-500 mb-2 block">Các tên gốc đã chọn:</Label>
                <ul className="text-xs space-y-1">
                  {selectedNames.map(n => (
                    <li key={n} className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      {n}
                    </li>
                  ))}
                </ul>
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
