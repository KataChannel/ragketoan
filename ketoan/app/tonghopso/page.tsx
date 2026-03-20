'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
    TrendingUp,
    Building2,
    AlertTriangle,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/app/components/dashboard-layout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Combobox, Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui';
import { formatCurrency, getDateRange } from '@/app/lib/utils';
import { CongTy } from '@/app/types';
import * as XLSX from 'xlsx';

// ============================================================================
// Component
// ============================================================================

export default function TongHopSoPage() {
    // State
    const [isLoading, setIsLoading] = useState(false);
    const [companies, setCompanies] = useState<CongTy[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const initialFetchRef = useRef(false);
    const [fromDate, setFromDate] = useState(getDateRange(1).fromDate);
    const [toDate, setToDate] = useState(getDateRange(0).toDate);
    const [search, setSearch] = useState('');
    const [journalData, setJournalData] = useState<any[]>([]);
    const [ledgerData, setLedgerData] = useState<any[]>([]);
    const [trialBalanceData, setTrialBalanceData] = useState<any[]>([]);
    const [detailLedgerData, setDetailLedgerData] = useState<any[]>([]);
    const [plData, setPlData] = useState<any[]>([]);
    const [balanceSheetData, setBalanceSheetData] = useState<any[]>([]);
    const [negativeInventory, setNegativeInventory] = useState<any[]>([]);
    const [auditAlerts, setAuditAlerts] = useState<any[]>([]);
    const [auditReport, setAuditReport] = useState<string>('');
    const [showFullReport, setShowFullReport] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<string>('111');
    const [searchObject, setSearchObject] = useState<string>('');

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

    const safeFormatDate = (dateStr: string | Date | null | undefined, formatStr = 'dd/MM/yyyy') => {
        if (!dateStr) return '...';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '...';
            return format(date, formatStr);
        } catch (e) {
            return '...';
        }
    };

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

    const fetchDetailLedger = useCallback(async () => {
        if (!selectedAccount || isLoading) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'sochitiet',
                tk: selectedAccount,
                doiTuong: searchObject,
                fromDate,
                toDate,
            });
            if (selectedCompanyId) params.append('congtyId', selectedCompanyId);

            const response = await fetch(`/api/tonghopso?${params}`);
            const result = await response.json();
            if (result.success) {
                setDetailLedgerData(result.data);
            }
        } catch (error) {
            console.error('Error fetching detail ledger:', error);
            toast.error('Lỗi khi tải dữ liệu sổ chi tiết');
        } finally {
            setIsLoading(false);
        }
    }, [selectedAccount, searchObject, selectedCompanyId, fromDate, toDate, isLoading]);

    const fetchPLReport = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'bckqkd',
                fromDate,
                toDate,
            });
            if (selectedCompanyId) params.append('congtyId', selectedCompanyId);

            const response = await fetch(`/api/tonghopso?${params}`);
            const result = await response.json();
            if (result.success) {
                setPlData(result.data);
            }
        } catch (error) {
            console.error('Error fetching P&L report:', error);
            toast.error('Lỗi khi tải báo cáo KQKD');
        } finally {
            setIsLoading(false);
        }
    }, [selectedCompanyId, fromDate, toDate, isLoading]);

    const fetchBalanceSheet = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'bangcandoi_b01',
                fromDate,
                toDate,
            });
            if (selectedCompanyId) params.append('congtyId', selectedCompanyId);

            const response = await fetch(`/api/tonghopso?${params}`);
            const result = await response.json();
            if (result.success) {
                setBalanceSheetData(result.data);
            }
        } catch (error) {
            console.error('Error fetching Balance Sheet:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCompanyId, fromDate, toDate, isLoading]);

    const fetchNegativeInventory = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                action: 'xnt-mathang',
                onlyNegative: 'true'
            });
            if (selectedCompanyId) params.append('congtyId', selectedCompanyId);

            const response = await fetch(`/api/tonghop?${params}`);
            const result = await response.json();
            if (result.success) {
                setNegativeInventory(result.items.filter((i: any) => i.tonCuoi < 0));
            }
        } catch (error) {
            console.error('Error fetching negatives:', error);
        }
    }, [selectedCompanyId]);

    const fetchAudit = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                action: 'audit',
                fromDate,
                toDate,
            });
            if (selectedCompanyId) params.append('congtyId', selectedCompanyId);

            const response = await fetch(`/api/tonghopso?${params}`);
            const result = await response.json();
            if (result.success) {
                setAuditAlerts(result.data);
            }

            // Fetch detailed markdown report
            const reportParams = new URLSearchParams({
                action: 'audit-report',
                fromDate,
                toDate,
            });
            if (selectedCompanyId) reportParams.append('congtyId', selectedCompanyId);
            const reportResponse = await fetch(`/api/tonghopso?${reportParams}`);
            const reportResult = await reportResponse.json();
            if (reportResult.success) {
                setAuditReport(reportResult.data);
            }
        } catch (error) {
            console.error('Error fetching audit:', error);
        }
    }, [selectedCompanyId, fromDate, toDate]);

    useEffect(() => {
        fetchCompanies();
        const cached = localStorage.getItem('last_selected_company_id');
        if (cached) setSelectedCompanyId(cached);
    }, [fetchCompanies]);

    // Initial fetch - only run once when selectedCompanyId is first determined
    useEffect(() => {
        if (selectedCompanyId && !initialFetchRef.current) {
            handleSearch();
            initialFetchRef.current = true;
        }
    }, [selectedCompanyId]); 

    useEffect(() => {
        if (initialFetchRef.current) {
            fetchLedger();
        }
    }, [selectedAccount]); 

    useEffect(() => {
        if (initialFetchRef.current) {
            fetchDetailLedger();
        }
    }, [selectedAccount, searchObject]); 

    const handleSearch = () => {
        if (!selectedCompanyId) {
            toast.error('Vui lòng chọn công ty');
            return;
        }
        
        fetchJournal();
        fetchLedger();
        fetchTrialBalance();
        fetchDetailLedger();
        fetchPLReport();
        fetchBalanceSheet();
        fetchNegativeInventory();
        fetchAudit();
        
        toast.success(`Đã cập nhật dữ liệu từ ${safeFormatDate(fromDate)} đến ${safeFormatDate(toDate)}`);
    };

    const handleRefresh = () => {
        handleSearch();
    };

    const handleExportExcel = async () => {
        if (!selectedCompanyId) {
            toast.error('Vui lòng chọn công ty');
            return;
        }

        try {
            setIsLoading(true);
            toast.info('Đang xuất Excel, quá trình này có thể mất vài giây...');

            const wb = XLSX.utils.book_new();
            const company = companies.find(c => c.id === selectedCompanyId);
            const companyName = company ? (company.tenVietTat || company.ten) : 'CongTy';

            // 1. Sổ Nhật Ký Chung
            if (journalData && journalData.length > 0) {
                const nkHeader = [['NGÀY', 'SỐ HD', 'DIỄN GIẢI', 'ĐỐI TÁC', 'NỢ', 'CÓ', 'SỐ TIỀN']];
                const nkData = journalData.map(i => [safeFormatDate(i.ngay), i.soHdon, i.dienGiai, i.doitac, i.tkNo, i.tkCo, i.soTien]);
                const totalNk = journalData.reduce((acc, curr) => acc + curr.soTien, 0);
                nkData.push(['', '', '', '', '', 'TỔNG CỘNG', totalNk]);
                const wsNk = XLSX.utils.aoa_to_sheet([...nkHeader, ...nkData]);
                XLSX.utils.book_append_sheet(wb, wsNk, 'Sổ Nhật Ký Chung');
            }

            // 2 & 3. Sổ Cái và Sổ Chi Tiết cho từng tài khoản chung
            for (const acc of commonAccounts) {
                // Sổ Cái
                const scParams = new URLSearchParams({
                    action: 'socai',
                    tk: acc.value,
                    fromDate,
                    toDate,
                });
                if (selectedCompanyId) scParams.append('congtyId', selectedCompanyId);
                const ledgerRes = await fetch(`/api/tonghopso?${scParams}`);
                
                if (ledgerRes.ok) {
                    const ledgerResult = await ledgerRes.json();
                    if (ledgerResult.success && ledgerResult.data && ledgerResult.data.length > 0) {
                        const scHeader = [['NGÀY', 'CHỨNG TỪ', 'DIỄN GIẢI', 'TK Đ/Ứ', 'NỢ', 'CÓ']];
                        const scData = ledgerResult.data.map((i: any) => [safeFormatDate(i.ngay), i.soHdon, i.dienGiai, i.tkDoiUng, i.no || 0, i.co || 0]);
                        const totalScNo = ledgerResult.data.reduce((acc: number, curr: any) => acc + (curr.no || 0), 0);
                        const totalScCo = ledgerResult.data.reduce((acc: number, curr: any) => acc + (curr.co || 0), 0);
                        scData.push(['', '', '', 'TỔNG CỘNG PHÁT SINH', totalScNo, totalScCo]);
                        const wsSc = XLSX.utils.aoa_to_sheet([...scHeader, ...scData]);
                        
                        const sheetName = `Sổ Cái ${acc.value}`.substring(0, 31);
                        try {
                            XLSX.utils.book_append_sheet(wb, wsSc, sheetName);
                        } catch (e) {
                            console.log('Sheet name duplication or error', sheetName);
                        }
                    }
                }

                // Sổ Chi Tiết
                const sctParams = new URLSearchParams({
                    action: 'sochitiet',
                    tk: acc.value,
                    fromDate,
                    toDate,
                });
                if (selectedCompanyId) sctParams.append('congtyId', selectedCompanyId);
                const detailRes = await fetch(`/api/tonghopso?${sctParams}`);

                if (detailRes.ok) {
                    const detailResult = await detailRes.json();
                    if (detailResult.success && detailResult.data && detailResult.data.length > 0) {
                        const sctHeader = [['NGÀY', 'CHỨNG TỪ', 'DIỄN GIẢI', 'TK Đ/Ứ', 'NỢ', 'CÓ']];
                        const sctData = detailResult.data.map((i: any) => [safeFormatDate(i.ngay), i.soHdon, i.dienGiai, i.tkDoiUng, i.no || 0, i.co || 0]);
                        const totalSctNo = detailResult.data.reduce((acc: number, curr: any) => acc + (curr.no || 0), 0);
                        const totalSctCo = detailResult.data.reduce((acc: number, curr: any) => acc + (curr.co || 0), 0);
                        sctData.push(['', '', '', 'TỔNG CỘNG', totalSctNo, totalSctCo]);
                        const wsSct = XLSX.utils.aoa_to_sheet([...sctHeader, ...sctData]);
                        
                        const sheetName = `Sổ CT ${acc.value}`.substring(0, 31);
                        try {
                            XLSX.utils.book_append_sheet(wb, wsSct, sheetName);
                        } catch (e) {
                            console.log('Sheet name duplication or error', sheetName);
                        }
                    }
                }
            }

            // 4. Bảng Cân Đối SPS
            if (trialBalanceData && trialBalanceData.length > 0) {
                const bcdHeader = [['SỐ HIỆU TK', 'TÊN TÀI KHOẢN', 'PHÁT SINH NỢ', 'PHÁT SINH CÓ']];
                const bcdData = trialBalanceData.map(item => {
                    const accLabel = commonAccounts.find(a => a.value === item.tk)?.label.split(' - ')[1] || 'Tài khoản chi tiết';
                    return [item.tk, accLabel, item.no || 0, item.co || 0];
                });
                const totalBcdNo = trialBalanceData.reduce((acc, curr) => acc + (curr.no || 0), 0);
                const totalBcdCo = trialBalanceData.reduce((acc, curr) => acc + (curr.co || 0), 0);
                bcdData.push(['', 'TỔNG CỘNG', totalBcdNo, totalBcdCo]);
                const wsBcd = XLSX.utils.aoa_to_sheet([...bcdHeader, ...bcdData]);
                XLSX.utils.book_append_sheet(wb, wsBcd, 'Bảng Cân Đối SPS');
            }

            // 5. Kết Quả Kinh Doanh
            if (plData && plData.length > 0) {
                const kqkHeader = [['Chỉ tiêu', 'Mã số', 'Số kỳ này']];
                const kqkData = plData.map(i => [i.target, i.code || '', i.value || 0]);
                const wsKqk = XLSX.utils.aoa_to_sheet([...kqkHeader, ...kqkData]);
                XLSX.utils.book_append_sheet(wb, wsKqk, 'KQ Kinh Doanh');
            }

            // 6. Bảng Cân Đối KT
            if (balanceSheetData && balanceSheetData.length > 0) {
                const bckHeader = [['Chỉ tiêu', 'Mã số', 'Số cuối kỳ']];
                const bckData = balanceSheetData.map(i => [i.target, i.code || '', i.value || 0]);
                const wsBck = XLSX.utils.aoa_to_sheet([...bckHeader, ...bckData]);
                XLSX.utils.book_append_sheet(wb, wsBck, 'Bảng CĐKT');
            }

            XLSX.writeFile(wb, `SoKeToan_${companyName}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
            toast.success('Xuất file Excel thành công!');
        } catch (error) {
            console.error('Lỗi khi xuất Excel:', error);
            toast.error('Có lỗi xảy ra khi xuất Excel');
        } finally {
            setIsLoading(false);
        }
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                        <div className="flex items-end">
                            <Button 
                                onClick={handleSearch} 
                                className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                disabled={isLoading}
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Tìm kiếm
                            </Button>
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
                        <TabsTrigger value="bckqkd" className="py-2.5">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Báo cáo KQKD
                        </TabsTrigger>
                        <TabsTrigger value="can-can-doi-kt" className="py-2.5 text-blue-600 font-bold">
                            <Building2 className="h-4 w-4 mr-2" />
                            Bảng Cân Đối KT
                        </TabsTrigger>
                        <TabsTrigger value="canh-bao-kho" className="py-2.5 text-red-500">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Cảnh báo Kho ({negativeInventory.length})
                        </TabsTrigger>
                        <TabsTrigger value="ai-audit" className="py-2.5 text-secondary-600 font-bold border-l-2 border-secondary-100 ml-2 pl-4">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            AI Audit ({auditAlerts.length})
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
                                                        {safeFormatDate(item.ngay)}
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
                                                        {safeFormatDate(item.ngay)}
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
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-4">
                                <div className="flex items-center gap-2 max-w-xs w-full">
                                    <Label className="text-xs font-bold whitespace-nowrap">TK:</Label>
                                    <Combobox
                                        options={commonAccounts}
                                        value={selectedAccount}
                                        onValueChange={setSelectedAccount}
                                        placeholder="Chọn tài khoản..."
                                    />
                                </div>
                                <div className="flex items-center gap-2 flex-1 w-full">
                                    <Label className="text-xs font-bold whitespace-nowrap">ĐỐI TƯỢNG:</Label>
                                    <div className="relative w-full">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Tên khách hàng, nhà cung cấp hoặc mã hàng..."
                                            value={searchObject}
                                            onChange={(e) => setSearchObject(e.target.value)}
                                            className="pl-9 h-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                                    <p>Đang tải dữ liệu sổ chi tiết...</p>
                                </div>
                            ) : detailLedgerData.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p>Không có dữ liệu cho đối tượng này trong kỳ</p>
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
                                            {detailLedgerData.map((item, idx) => (
                                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                                                        {safeFormatDate(item.ngay)}
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
                                                <td colSpan={4} className="px-4 py-3 text-right">TỔNG CỘNG</td>
                                                <td className="px-4 py-3 text-right text-blue-600">
                                                    {formatCurrency(detailLedgerData.reduce((acc, curr) => acc + (curr.no || 0), 0))}
                                                </td>
                                                <td className="px-4 py-3 text-right text-amber-600">
                                                    {formatCurrency(detailLedgerData.reduce((acc, curr) => acc + (curr.co || 0), 0))}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
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
                        <TabsContent value="bckqkd" className="m-0">
                            {isLoading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                                    <p>Đang lập báo cáo KQKD...</p>
                                </div>
                            ) : plData.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p>Không có dữ liệu trong kỳ này</p>
                                </div>
                            ) : (
                                <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto bg-white dark:bg-gray-800">
                                    <div className="text-center mb-8">
                                        <h3 className="text-xl font-bold uppercase">Báo cáo Kết quả Hoạt động Kinh doanh</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Kỳ báo cáo: Từ {safeFormatDate(fromDate)} đến {safeFormatDate(toDate)}
                                        </p>
                                        <p className="text-xs text-secondary-500 mt-0.5">(Đơn vị tính: Đồng Việt Nam)</p>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-bold border-b border-gray-200 dark:border-gray-700">Chỉ tiêu</th>
                                                    <th className="px-4 py-3 text-center font-bold border-b border-gray-200 dark:border-gray-700 w-24">Mã số</th>
                                                    <th className="px-4 py-3 text-right font-bold border-b border-gray-200 dark:border-gray-700 w-48">Số kỳ này</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {plData.map((row, idx) => (
                                                    <tr key={idx} className={`${idx === 2 || idx === 4 || idx === 6 || idx === 9 ? 'bg-blue-50/20 dark:bg-blue-900/10 font-bold' : ''}`}>
                                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.target}</td>
                                                        <td className="px-4 py-3 text-center text-gray-500">{row.code}</td>
                                                        <td className="px-4 py-3 text-right font-mono font-medium">
                                                            {formatCurrency(row.value)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="grid grid-cols-3 mt-12 text-center text-sm font-bold">
                                        <div>NGƯỜI LẬP BIỂU</div>
                                        <div>KẾ TOÁN TRƯỞNG</div>
                                        <div>GIÁM ĐỐC</div>
                                    </div>
                                    <div className="grid grid-cols-3 mt-2 text-center text-xs text-gray-400 italic">
                                        <div>(Ký, họ tên)</div>
                                        <div>(Ký, họ tên)</div>
                                        <div>(Ký, đóng dấu, họ tên)</div>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="can-can-doi-kt" className="m-0">
                            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-bold uppercase">Bảng Cân Đối Kế Toán</h3>
                                    <p className="text-sm text-gray-500">Kỳ báo cáo: Đến ngày {safeFormatDate(toDate)}</p>
                                </div>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Chỉ tiêu</th>
                                                <th className="px-4 py-3 text-center w-24">Mã số</th>
                                                <th className="px-4 py-3 text-right w-48">Số cuối kỳ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {balanceSheetData.map((row, idx) => (
                                                <tr key={idx} className={`${row.isHeader ? 'bg-gray-50 font-bold' : ''} ${row.isTotal ? 'bg-blue-50 font-bold text-blue-700' : ''}`}>
                                                    <td className="px-4 py-3">{row.target}</td>
                                                    <td className="px-4 py-3 text-center text-gray-400">{row.code}</td>
                                                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(row.value)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="canh-bao-kho" className="m-0">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center">
                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                    Danh sách mặt hàng bị âm kho (Yêu cầu xử lý gấp)
                                </h3>
                                {negativeInventory.length === 0 ? (
                                    <div className="p-8 text-center text-green-600 bg-green-50 rounded-lg border border-green-200">
                                        Không phát hiện sản phẩm bị âm kho. Kho hàng đang ở trạng thái tốt.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {negativeInventory.map((item, idx) => (
                                            <div key={idx} className="p-4 border-l-4 border-red-500 bg-red-50/50 dark:bg-red-900/10 rounded-r-lg flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white uppercase">{item.tenMatHang}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        Số lượng âm: <span className="text-red-600 font-bold">{item.tonCuoi}</span> {item.dvtinh}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 italic">
                                                        Gợi ý: Cần bổ sung hóa đơn nhập kho hoặc kiểm tra lại đơn vị tính của mặt hàng này.
                                                    </p>
                                                </div>
                                                <Button variant="outline" size="sm" className="bg-white border-red-200 text-red-600 hover:bg-red-50">
                                                    Xử lý ngay (Cần AI hỗ trợ)
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="ai-audit" className="m-0">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold flex items-center text-secondary-700">
                                        <ShieldCheck className="h-6 w-6 mr-2 text-secondary-500" />
                                        AI Audit: Hệ thống rà soát rủi ro thuế & kế toán
                                    </h3>
                                    <div className="text-sm bg-secondary-50 text-secondary-600 px-3 py-1 rounded-full border border-secondary-100">
                                        Đã quét {auditAlerts.length} rủi ro
                                    </div>
                                </div>

                                 {auditAlerts.length === 0 ? (
                                    <div className="p-12 text-center bg-green-50 rounded-xl border-2 border-dashed border-green-200">
                                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShieldCheck className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h4 className="text-lg font-bold text-green-800">Sổ sách của bạn thật tuyệt vời!</h4>
                                        <p className="text-green-600 mt-2">AI không tìm thấy sai sót nghiêm trọng nào trong kỳ báo cáo này.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex justify-end">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => setShowFullReport(!showFullReport)}
                                                className="bg-secondary-50 border-secondary-200 text-secondary-700 hover:bg-secondary-100"
                                            >
                                                {showFullReport ? 'Ẩn báo cáo chi tiết' : 'Xem báo cáo AI chuyên sâu (Markdown)'}
                                            </Button>
                                        </div>

                                        {showFullReport && auditReport && (
                                            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm overflow-auto max-h-[600px] prose dark:prose-invert max-w-none">
                                                <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                                                    {auditReport}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-4">
                                            {auditAlerts.map((alert, idx) => (
                                                <div key={idx} className={`p-5 rounded-xl border-l-4 shadow-sm flex gap-4 items-start ${alert.type === 'error'
                                                    ? 'bg-red-50/30 border-red-500 border-y border-r border-red-100'
                                                    : 'bg-amber-50/30 border-amber-500 border-y border-r border-amber-100'
                                                    }`}>
                                                    <div className={`p-2 rounded-lg ${alert.type === 'error' ? 'bg-red-100' : 'bg-amber-100'}`}>
                                                        {alert.type === 'error' ? (
                                                            <AlertTriangle className={`h-5 w-5 ${alert.type === 'error' ? 'text-red-600' : 'text-amber-600'}`} />
                                                        ) : (
                                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-bold text-gray-900 uppercase tracking-tight">{alert.title}</h4>
                                                            {alert.amount && (
                                                                <span className="text-sm font-mono font-bold bg-white px-2 py-0.5 rounded shadow-sm">
                                                                    {formatCurrency(alert.amount)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600 mt-1 leading-relaxed">{alert.detail}</p>
                                                        <div className="mt-3 flex gap-2">
                                                            <Button size="sm" variant="outline" className="text-[10px] h-7 px-2 border-gray-200">
                                                                Xem giao dịch
                                                            </Button>
                                                            <Button size="sm" className={`${alert.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'} text-[10px] h-7 px-2`}>
                                                                Xử lý ngay
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
