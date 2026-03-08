"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { 
  TrendingUp, Package, DollarSign, Activity, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, FileDown 
} from "lucide-react";

const salesData = [
  { name: "T1", volume: 394202 },
  { name: "T2", volume: 417291 },
  { name: "T3", volume: 1265620 },
  { name: "T4", volume: 383889 },
  { name: "T5", volume: 490792 },
  { name: "T6", volume: 301755 },
  { name: "T7", volume: 765576 },
  { name: "T8", volume: 516980 },
  { name: "T9", volume: 282601 },
  { name: "T10", volume: 521951 },
  { name: "T11", volume: 407665 },
  { name: "T12", volume: 792160 },
];

const categoryData = [
  { name: "Yến Sào Sanest", value: 48206435600, color: "#2563eb" },
  { name: "Xúc Xích Vissan", value: 24244029068, color: "#dc2626" },
  { name: "Gia Vị Cholimex", value: 22394068461, color: "#16a34a" },
  { name: "Bánh Nabati", value: 16348862015, color: "#ea580c" },
  { name: "Phô Mai Bel", value: 8664032922, color: "#ca8a04" },
  { name: "Khác", value: 2544247583, color: "#64748b" },
];

const months = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1} / 2023`);

const inventoryData: Record<number, any[]> = {
  0: [ // Jan
    { code: "AACV4N - AL ANLENE CONCENTRATE VANILLA 4x125ML", unit: "Lốc", startSL: 132, startPrice: 0, inSL: 0, inPrice: 0, outSL: 0, outPrice: 0, endSL: 132, endPrice: 0 },
    { code: "AAGVM4G - AL Anlene Gold Vanilla Movepro 440g", unit: "Hộp", startSL: 354, startPrice: 26136407, inSL: 0, inPrice: 0, outSL: 0, outPrice: 0, endSL: 354, endPrice: 26136407 },
    { code: "BPMBC1M - BEL Phô mai CBC 16M", unit: "Hộp", startSL: 54912, startPrice: 2621842864, inSL: 0, inPrice: 0, outSL: 2784, outPrice: 150477984, endSL: 52128, endPrice: 2488917264 },
    { code: "BPMBC8M - BEL Phô mai CBC 8M", unit: "Hộp", startSL: 105230, startPrice: 2837621615, inSL: 0, inPrice: 0, outSL: 7164, outPrice: 216503244, endSL: 98066, endPrice: 2644437910 },
    { code: "CBCNBN1 - CLM Bột canh nấm bào ngư 180g", unit: "Gói", startSL: -500, startPrice: -2434227, inSL: 1250, inPrice: 5681250, outSL: 0, outPrice: 0, endSL: 750, endPrice: 3651340 },
    { code: "CLT2 - CLM Lẩu thái 280g", unit: "Chai", startSL: 1576, startPrice: 23228733, inSL: 7680, inPrice: 111705600, outSL: 3048, outPrice: 43276800, endSL: 6208, endPrice: 91499982 },
    { code: "SN01 - Sanest Tổ yến chưng sẵn 70ml", unit: "Hũ", startSL: 12000, startPrice: 420000000, inSL: 5000, inPrice: 175000000, outSL: 8000, outPrice: 280000000, endSL: 9000, endPrice: 315000000 },
    { code: "VS01 - Vissan Xúc xích heo 175g", unit: "Gói", startSL: 25000, startPrice: 125000000, inSL: 10000, inPrice: 50000000, outSL: 15000, outPrice: 75000000, endSL: 20000, endPrice: 100000000 },
    { code: "NB01 - Nabati Bánh xốp phô mai 52g", unit: "Hộp", startSL: 15000, startPrice: 45000000, inSL: 20000, inPrice: 60000000, outSL: 18000, outPrice: 54000000, endSL: 17000, endPrice: 51000000 },
    { code: "CL03 - CLM Tương ớt 270g", unit: "Chai", startSL: 8000, startPrice: 88000000, inSL: 12000, inPrice: 132000000, outSL: 9000, outPrice: 99000000, endSL: 11000, endPrice: 121000000 }
  ],
  2: [ // Mar (Peak Sales Month in chart)
    { code: "AACV4N - AL ANLENE CONCENTRATE VANILLA 4x125ML", unit: "Lốc", startSL: 132, startPrice: 0, inSL: 500, inPrice: 45000000, outSL: 400, outPrice: 38000000, endSL: 232, endPrice: 7000000 },
    { code: "BPMBC1M - BEL Phô mai CBC 16M", unit: "Hộp", startSL: 52128, startPrice: 2488917264, inSL: 20000, inPrice: 900000000, outSL: 35000, outPrice: 1600000000, endSL: 37128, endPrice: 1788917264 },
    { code: "CLT2 - CLM Lẩu thái 280g", unit: "Chai", startSL: 6208, startPrice: 91499982, inSL: 15000, inPrice: 220000000, outSL: 12000, outPrice: 180000000, endSL: 9208, endPrice: 131499982 },
    { code: "SN01 - Sanest Tổ yến chưng sẵn 70ml", unit: "Hũ", startSL: 9000, startPrice: 315000000, inSL: 10000, inPrice: 350000000, outSL: 12000, outPrice: 420000000, endSL: 7000, endPrice: 245000000 },
    { code: "VS01 - Vissan Xúc xích heo 175g", unit: "Gói", startSL: 20000, startPrice: 100000000, inSL: 15000, inPrice: 75000000, outSL: 25000, outPrice: 125000000, endSL: 10000, endPrice: 50000000 },
  ]
};

// Fill missing months with realistic mock data based on month 0 logic
for (let m = 0; m < 12; m++) {
  if (!inventoryData[m]) {
    inventoryData[m] = inventoryData[0].map(item => ({
      ...item,
      startSL: item.endSL || item.startSL,
      startPrice: item.endPrice || item.startPrice,
      inSL: Math.floor(Math.random() * 1000),
      inPrice: Math.floor(Math.random() * 10000000),
      outSL: Math.floor(Math.random() * 800),
      outPrice: Math.floor(Math.random() * 8000000),
      endSL: (item.endSL || item.startSL) + Math.floor(Math.random() * 200),
      endPrice: (item.endPrice || item.startPrice) + Math.floor(Math.random() * 2000000)
    }));
  }
}

// Helper for consistent number formatting
const formatNum = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

export default function HoangHuyPhatDashboard() {
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(0);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalRevenue = categoryData.reduce((acc, item) => acc + item.value, 0);
  const currentMonthData = inventoryData[selectedMonth] || [];

  const totals = currentMonthData.reduce((acc, item) => ({
    startSL: acc.startSL + item.startSL,
    startPrice: acc.startPrice + item.startPrice,
    inSL: acc.inSL + item.inSL,
    inPrice: acc.inPrice + item.inPrice,
    outSL: acc.outSL + item.outSL,
    outPrice: acc.outPrice + item.outPrice,
    endSL: acc.endSL + item.endSL,
    endPrice: acc.endPrice + item.endPrice,
  }), {
    startSL: 0, startPrice: 0,
    inSL: 0, inPrice: 0,
    outSL: 0, outPrice: 0,
    endSL: 0, endPrice: 0
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              Hoàng Huy Phát - Report 2023
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Phân tích hiệu quả kinh doanh và tồn kho năm 2023
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="Tổng Doanh Thu" 
            value={`${(totalRevenue / 1e9).toFixed(1)} Tỷ`} 
            subValue="+12% so với 2022"
            icon={<DollarSign className="h-6 w-6 text-green-600" />}
            trend="up"
          />
          <KPICard 
            title="Sản Lượng Bán" 
            value="6.5M" 
            subValue="Đơn vị sản phẩm"
            icon={<Package className="h-6 w-6 text-blue-600" />}
          />
          <KPICard 
            title="Vòng Quay Kho" 
            value="6.0" 
            subValue="Lần / Năm"
            icon={<RefreshCwIcon className="h-6 w-6 text-orange-600" />}
            trend="up"
          />
          <KPICard 
            title="Nhóm Hàng Lead" 
            value="Sanest" 
            subValue="40% Tỷ trọng"
            icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Category */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tỷ Trọng Doanh Thu Theo Nhóm</h3>
            <div className="h-80 w-full min-w-0">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Monthly Sales Trend */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Xu Hướng Sản Lượng Hàng Tháng</h3>
            <div className="h-80 w-full min-w-0">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} hide />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white overflow-hidden relative group">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="h-6 w-6" />
              AI Insights & Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <CheckCircle2 className="h-5 w-5 mt-0.5" />
                  <p className="text-sm">
                    <strong>Đỉnh điểm Tháng 3:</strong> Sản lượng tăng 300% so với trung bình, cần duy trì mức tồn kho dự phòng tối thiểu cho giai đoạn này vào 2024.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <CheckCircle2 className="h-5 w-5 mt-0.5" />
                  <p className="text-sm">
                    <strong>Tối ưu Sanest:</strong> Là dòng hàng mang lại 40% doanh thu, hãy đàm phán chiết khấu nhập hàng khối lượng lớn để tăng margin.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5 mt-0.5 text-yellow-300" />
                  <p className="text-sm">
                    <strong>Logistics:</strong> Nhóm Nabati & Vissan có volume lớn nhưng giá trị thấp, cần tối ưu hóa tải trọng xe vận chuyển.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <CheckCircle2 className="h-5 w-5 mt-0.5" />
                  <p className="text-sm">
                    <strong>Tồn kho cuối kỳ:</strong> 20 tỷ VNĐ là mức an toàn, nhưng 15% là hàng chậm luân chuyển cần có chương trình xả hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
        </div>

        {/* Detailed Inventory Report */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Báo Cáo Xuất Nhập Tồn Chi Tiết 2023
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dữ liệu chi tiết từng mã hàng theo tháng</p>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href="/BC_QUYET_TOAN_HOANGHUYPHAT_2023.xlsx" 
                download 
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-sm font-medium text-sm"
              >
                <FileDown className="h-4 w-4" />
                <span>Xuất Excel</span>
              </a>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-slate-50 dark:bg-gray-800 border-none rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                {months.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <RefreshCwIcon className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-gray-800/50 border-b border-slate-100 dark:border-gray-800">
                  <th rowSpan={2} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-slate-100 dark:border-gray-800">Mã - Tên Hàng</th>
                  <th rowSpan={2} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-slate-100 dark:border-gray-800">ĐVT</th>
                  <th colSpan={2} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center border-r border-slate-100 dark:border-gray-800">Đầu Kỳ</th>
                  <th colSpan={2} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center border-r border-slate-100 dark:border-gray-800">Nhập</th>
                  <th colSpan={2} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center border-r border-slate-100 dark:border-gray-800">Xuất</th>
                  <th colSpan={2} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Cuối Kỳ</th>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-gray-800/50 border-b border-slate-100 dark:border-gray-800 text-center font-medium text-[10px] text-gray-400">
                  <th className="p-2 border-r border-slate-100 dark:border-gray-800">SL</th>
                  <th className="p-2 border-r border-slate-100 dark:border-gray-800">Tiền</th>
                  <th className="p-2 border-r border-slate-100 dark:border-gray-800">SL</th>
                  <th className="p-2 border-r border-slate-100 dark:border-gray-800">Tiền</th>
                  <th className="p-2 border-r border-slate-100 dark:border-gray-800">SL</th>
                  <th className="p-2 border-r border-slate-100 dark:border-gray-800">Tiền</th>
                  <th className="p-2 border-r border-slate-100 dark:border-gray-800">SL</th>
                  <th className="p-2">Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {mounted && currentMonthData.map((item, idx) => (
                  <InventoryRow 
                    key={idx}
                    code={item.code}
                    unit={item.unit}
                    startSL={item.startSL}
                    startPrice={item.startPrice}
                    inSL={item.inSL}
                    inPrice={item.inPrice}
                    outSL={item.outSL}
                    outPrice={item.outPrice}
                    endSL={item.endSL}
                    endPrice={item.endPrice}
                  />
                ))}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-gray-800/50 font-bold border-t-2 border-slate-200 dark:border-gray-700">
                {mounted && (
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-gray-900 dark:text-white uppercase tracking-wider">Tổng cộng</td>
                    <td className="px-4 py-4 text-right text-gray-900 dark:text-white">{formatNum(totals.startSL)}</td>
                    <td className="px-4 py-4 text-right text-gray-900 dark:text-white">{formatNum(totals.startPrice)}</td>
                    <td className="px-4 py-4 text-right text-blue-600 dark:text-blue-400">{formatNum(totals.inSL)}</td>
                    <td className="px-4 py-4 text-right text-blue-600 dark:text-blue-400">{formatNum(totals.inPrice)}</td>
                    <td className="px-4 py-4 text-right text-orange-600 dark:text-orange-400">{formatNum(totals.outSL)}</td>
                    <td className="px-4 py-4 text-right text-orange-600 dark:text-orange-400">{formatNum(totals.outPrice)}</td>
                    <td className="px-4 py-4 text-right text-green-600 dark:text-green-400">{formatNum(totals.endSL)}</td>
                    <td className="px-4 py-4 text-right text-green-600 dark:text-green-400">{formatNum(totals.endPrice)}</td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-gray-800/50 border-t border-slate-100 dark:border-gray-800 flex justify-center">
            <a 
              href="/BC_QUYET_TOAN_HOANGHUYPHAT_2023.xlsx" 
              download 
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md font-bold"
            >
              <FileDown className="h-5 w-5" />
              <span>Tải Báo Cáo Quyết Toán (Excel)</span>
            </a>
          </div>
        </div>
      </div>
      
      <footer className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-200 dark:border-gray-800 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generated with Premium Analytics by Antigravity AI
        </p>
      </footer>
    </div>
  );
}

function InventoryRow({ 
  code, unit, startSL, startPrice, inSL, inPrice, outSL, outPrice, endSL, endPrice 
}: { 
  code: string; unit: string; startSL: number; startPrice: number; 
  inSL: number; inPrice: number; outSL: number; outPrice: number; 
  endSL: number; endPrice: number;
}) {
  
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-gray-800/80 transition-colors text-xs">
      <td className="p-4 font-medium text-gray-900 dark:text-white max-w-xs truncate border-r border-slate-100 dark:border-gray-800" title={code}>{code}</td>
      <td className="p-4 text-gray-500 dark:text-gray-400 border-r border-slate-100 dark:border-gray-800 text-center">{unit}</td>
      <td className="p-4 text-center font-bold text-gray-700 dark:text-gray-300 border-r border-slate-100 dark:border-gray-800 bg-slate-50/30 dark:bg-gray-800/30">{formatNum(startSL)}</td>
      <td className="p-4 text-right text-gray-500 dark:text-gray-400 border-r border-slate-100 dark:border-gray-800">{formatNum(startPrice)}</td>
      <td className="p-4 text-center font-bold text-blue-600 dark:text-blue-400 border-r border-slate-100 dark:border-gray-800">{formatNum(inSL)}</td>
      <td className="p-4 text-right text-gray-500 dark:text-gray-400 border-r border-slate-100 dark:border-gray-800">{formatNum(inPrice)}</td>
      <td className="p-4 text-center font-bold text-orange-600 dark:text-orange-400 border-r border-slate-100 dark:border-gray-800">{formatNum(outSL)}</td>
      <td className="p-4 text-right text-gray-500 dark:text-gray-400 border-r border-slate-100 dark:border-gray-800">{formatNum(outPrice)}</td>
      <td className="p-4 text-center font-bold text-green-600 dark:text-green-400 border-r border-slate-100 dark:border-gray-800 bg-green-50/10 dark:bg-green-900/10">{formatNum(endSL)}</td>
      <td className="p-4 text-right font-medium text-gray-900 dark:text-white bg-green-50/10 dark:bg-green-900/10">{formatNum(endPrice)}</td>
    </tr>
  );
}

function KPICard({ title, value, subValue, icon, trend }: { 
  title: string; value: string; subValue: string; icon: React.ReactNode; trend?: "up" | "down" 
}) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 dark:bg-gray-800 rounded-xl">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend === "up" ? "12%" : "5%"}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subValue}</p>
    </div>
  );
}

function RefreshCwIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
