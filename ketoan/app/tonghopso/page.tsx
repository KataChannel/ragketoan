'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import {
    RefreshCw,
    Download,
    BookText,
    Search,
    Filter,
    ArrowUpDown,
    BookOpen,
    ClipboardList,
    ArrowRightLeft,
    Calculator,
} from 'lucide-react';
import { DashboardLayout } from '@/app/components/dashboard-layout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Combobox, Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui';
import { formatCurrency, getDateRange } from '@/app/lib/utils';
import { CongTy } from '@/app/types';

// ============================================================================
// Component
// ============================================================================

export default function TongHopSoPage() {
    // State
    const [isLoading, setIsLoading] = useState(false);
    const [companies, setCompanies] = useState<CongTy[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [fromDate, setFromDate] = useState(getDateRange(1).fromDate);
    const [toDate, setToDate] = useState(getDateRange(0).toDate);
    const [search, setSearch] = useState('');
    const [journalData, setJournalData] = useState<any[]>([]);
    const [ledgerData, setLedgerData] = useState<any[]>([]);
    const [trialBalanceData, setTrialBalanceData] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>('111');

    const commonAccounts = [
        { value: '111', label: '111 - Tiền mặt' },
        { value: '112', label: '112 - Tiền gửi ngân hàng' },
        { value: '131', label: '131 - Phải thu khách hàng' },
        { value: '156', label: '156 - Hàng hóa' },
        { value: '133', label: '133 - Thuế GTGT đầu vào' },
        { value: '331', label: '331 - Phải trả người bán' },
        { value: '3331', label: '3331 - Thuế GTGT đầu ra' },
        { value: '511', label: '511 - Doanh thu bán hàng' },
        { value: '632', label: '632 - Giá vốn hàng bán' },
        { value: '642', label: '642 - Chi phí quản lý doanh nghiệp' },
    ];

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

    const fetchJournal = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'nhatky',
                fromDate,
                toDate,
            });
            if (selectedCompanyId) params.append('congtyId', selectedCompanyId);
            if (search) params.append('search', search);

            const response = await fetch(`/api/tonghopso?${params}`);
            const result = await response.json();
            if (result.success) {
                setJournalData(result.data);
            }
        } catch (error) {
            console.error('Error fetching journal:', error);
            toast.error('Lỗi khi tải dữ liệu sổ');
        } finally {
            setIsLoading(false);
        }
    }, [selectedCompanyId, fromDate, toDate, search, isLoading]);

    const fetchLedger = useCallback(async () => {
        if (!selectedAccount || isLoading) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'socai',
                tk: selectedAccount,
                fromDate,
                toDate,
            });
            if (selectedCompanyId) params.append('congtyId', selectedCompanyId);

            const response = await fetch(`/api/tonghopso?${params}`);
            const result = await response.json();
            if (result.success) {
                setLedgerData(result.data);
            }
        } catch (error) {
            console.error('Error fetching ledger:', error);
            toast.error('Lỗi khi tải dữ liệu sổ cái');
        } finally {
            setIsLoading(false);
        }
    }, [selectedAccount, selectedCompanyId, fromDate, toDate, isLoading]);

    const fetchTrialBalance = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'bangcandoi',
                fromDate,
                toDate,
            });
            if (selectedCompanyId) params.append('congtyId', selectedCompanyId);

            const response = await fetch(`/api/tonghopso?${params}`);
            const result = await response.json();
            if (result.success) {
                setTrialBalanceData(result.data);
            }
        } catch (error) {
            console.error('Error fetching trial balance:', error);
            toast.error('Lỗi khi tải bảng cân đối');
        } finally {
            setIsLoading(false);
        }
    }, [selectedCompanyId, fromDate, toDate, isLoading]);

    useEffect(() => {
        fetchCompanies();
        const cached = localStorage.getItem('last_selected_company_id');
        if (cached) setSelectedCompanyId(cached);
    }, [fetchCompanies]);

    useEffect(() => {
        fetchJournal();
    }, [fromDate, toDate, selectedCompanyId]);

    useEffect(() => {
        fetchLedger();
    }, [selectedAccount, fromDate, toDate, selectedCompanyId]);

    useEffect(() => {
        fetchTrialBalance();
    }, [fromDate, toDate, selectedCompanyId]);

    const handleRefresh = () => {
        fetchJournal();
        fetchLedger();
        fetchTrialBalance();
    };

    const handleExportExcel = () => {
        toast.info('Tính năng xuất Excel đang được xử lý...');
    };

    return (
        <DashboardLayout>
            <div className="space-y-4 lg:space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Tổng Hợp Sổ Kế Toán
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Tự động lên các sổ kế toán từ dữ liệu hóa đơn điện tử
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline ml-1">Cập nhật dữ liệu sổ</span>
                        </Button>
                        <Button size="sm" onClick={handleExportExcel} disabled={isLoading}>
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Xuất Excel</span>
                        </Button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                            <Label className="text-xs text-secondary-500 mb-1 block font-bold">CÔNG TY</Label>
                            <Combobox
                                options={[
                                    { value: '', label: 'Tất cả công ty' },
                                    ...companies.map((c) => ({
                                        value: c.id,
                                        label: `${c.tenVietTat || c.ten} (${c.mst})`,
                                    })),
                                ]}
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
                </div>

                {/* Tabs Content */}
                <Tabs defaultValue="nhatky" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-gray-100 dark:bg-gray-900">
                        <TabsTrigger value="nhatky" className="py-2.5">
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Sổ Nhật Ký Chung
                        </TabsTrigger>
                        <TabsTrigger value="socai" className="py-2.5">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Sổ Cái
                        </TabsTrigger>
                        <TabsTrigger value="sochitiet" className="py-2.5">
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Sổ Chi Tiết
                        </TabsTrigger>
                        <TabsTrigger value="bangcandoi" className="py-2.5">
                            <Calculator className="h-4 w-4 mr-2" />
                            Bảng Cân Đối
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[400px]">
                        <TabsContent value="nhatky" className="m-0">
                            {isLoading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCw className="h-10 w-12 text-blue-500 animate-spin" />
                                        <p className="font-medium">Đang tải dữ liệu Sổ Nhật Ký...</p>
                                    </div>
                                </div>
                            ) : journalData.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p>Không có dữ liệu trong khoảng thời gian này</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">NGÀY</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">SỐ HD</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">DIỄN GIẢI</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">ĐỐI TÁC</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 text-center">NỢ</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 text-center">CÓ</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 text-right">SỐ TIỀN</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {journalData.map((item) => (
                                                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                                                        {format(new Date(item.ngay), 'dd/MM/yyyy')}
                                                    </td>
                                                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                                        {item.soHdon}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300 max-w-[300px] truncate" title={item.dienGiai}>
                                                        {item.dienGiai}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={item.doitac}>
                                                        {item.doitac}
                                                    </td>
                                                    <td className="px-4 py-2 text-center text-blue-600 dark:text-blue-400 font-bold">
                                                        {item.tkNo}
                                                    </td>
                                                    <td className="px-4 py-2 text-center text-amber-600 dark:text-amber-400 font-bold">
                                                        {item.tkCo}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">
                                                        {formatCurrency(item.soTien)}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50 dark:bg-gray-900/50 font-bold">
                                                <td colSpan={6} className="px-4 py-3 text-right">TỔNG CỘNG</td>
                                                <td className="px-4 py-3 text-right text-blue-600">
                                                    {formatCurrency(journalData.reduce((acc, curr) => acc + curr.soTien, 0))}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="socai" className="m-0">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 max-w-xs w-full">
                                    <Label className="text-xs font-bold whitespace-nowrap">CHỌN TK:</Label>
                                    <Combobox
                                        options={commonAccounts}
                                        value={selectedAccount}
                                        onValueChange={setSelectedAccount}
                                        placeholder="Chọn tài khoản..."
                                    />
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    Sổ cái tài khoản: <span className="text-blue-600 font-bold">{selectedAccount}</span>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                                    <p>Đang tải dữ liệu sổ cái...</p>
                                </div>
                            ) : ledgerData.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p>Không có phát sinh cho tài khoản {selectedAccount} trong kỳ này</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">NGÀY</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">CHỨNG TỪ</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">DIỄN GIẢI</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 text-center">TK Đ/Ứ</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 text-right">NỢ</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 text-right">CÓ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ledgerData.map((item, idx) => (
                                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                                                        {format(new Date(item.ngay), 'dd/MM/yyyy')}
                                                    </td>
                                                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                                        {item.soHdon}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300 max-w-[300px] truncate">
                                                        {item.dienGiai}
                                                    </td>
                                                    <td className="px-4 py-2 text-center font-bold text-gray-500">
                                                        {item.tkDoiUng}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-medium text-blue-600">
                                                        {item.no > 0 ? formatCurrency(item.no) : '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-medium text-amber-600">
                                                        {item.co > 0 ? formatCurrency(item.co) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50 dark:bg-gray-900/50 font-bold">
                                                <td colSpan={4} className="px-4 py-3 text-right">TỔNG CỘNG PHÁT SINH</td>
                                                <td className="px-4 py-3 text-right text-blue-600 underline">
                                                    {formatCurrency(ledgerData.reduce((acc, curr) => acc + (curr.no || 0), 0))}
                                                </td>
                                                <td className="px-4 py-3 text-right text-amber-600 underline">
                                                    {formatCurrency(ledgerData.reduce((acc, curr) => acc + (curr.co || 0), 0))}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="sochitiet" className="m-0">
                            <div className="p-8 text-center text-gray-500">
                                <p>Tính năng Sổ Chi Tiết đang được hoàn thiện</p>
                            </div>
                        </TabsContent>
                        <TabsContent value="bangcandoi" className="m-0">
                            {isLoading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                                    <p>Đang tải bảng cân đối...</p>
                                </div>
                            ) : trialBalanceData.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p>Không có dữ liệu phát sinh trong kỳ này</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">SỐ HIỆU TK</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">TÊN TÀI KHOẢN</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 text-right">PHÁT SINH NỢ</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 text-right">PHÁT SINH CÓ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trialBalanceData.map((item) => {
                                                const accLabel = commonAccounts.find(a => a.value === item.tk)?.label.split(' - ')[1] || 'Tài khoản chi tiết';
                                                return (
                                                    <tr key={item.tk} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                                        <td className="px-4 py-3 font-bold text-blue-600">
                                                            {item.tk}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                            {accLabel}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium">
                                                            {formatCurrency(item.no)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium">
                                                            {formatCurrency(item.co)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="bg-blue-50/30 dark:bg-blue-900/20 font-bold border-t-2 border-blue-100 dark:border-blue-900">
                                                <td colSpan={2} className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">TỔNG CỘNG</td>
                                                <td className="px-4 py-3 text-right text-blue-600">
                                                    {formatCurrency(trialBalanceData.reduce((acc, curr) => acc + curr.no, 0))}
                                                </td>
                                                <td className="px-4 py-3 text-right text-amber-600">
                                                    {formatCurrency(trialBalanceData.reduce((acc, curr) => acc + curr.co, 0))}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
