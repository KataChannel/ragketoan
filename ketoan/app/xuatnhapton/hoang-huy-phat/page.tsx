'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  BarChart3, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileSearch,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/app/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { formatCurrency } from '@/app/lib/utils';
import { Separator } from '@/app/components/ui/separator';

export default function HoangHuyPhatReportPage() {
  const summaryData = {
    tonDau: 113747561714,
    tongNhap: 9540637458,
    tongXuat: 103260944982,
    tonCuoi: 20027254190,
    tiLeXuat: 90.7 // (103/113+9)
  };

  const monthlyData = [
    { month: '01', value: 12400000000 },
    { month: '02', value: 5120000000 },
    { month: '03', value: 9150000000 },
    { month: '04', value: 6380000000 },
    { month: '05', value: 7920000000 },
    { month: '06', value: 4950000000 },
    { month: '07', value: 9980000000 },
    { month: '08', value: 7540000000 },
    { month: '09', value: 10450000000 },
    { month: '10', value: 8420000000 },
    { month: '11', value: 6410000000 },
    { month: '12', value: 14600000000 },
  ];

  const maxMonthlyVal = Math.max(...monthlyData.map(d => d.value));

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 cursor-pointer hover:text-blue-600 transition-colors">
              <Link href="/xuatnhapton" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Báo cáo Xuất Nhập Tồn
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Hoàng Huy Phát <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">2023</Badge>
            </h1>
            <p className="text-gray-500 mt-1 italic">Phân tích tình hình kho và biến động hàng hóa chuyên sâu</p>
          </div>
          <div className="flex gap-2">
             <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300 py-1.5 px-3">
               <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Dữ liệu đã chuẩn hóa
             </Badge>
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-amber-500 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Tồn đầu năm</CardDescription>
              <CardTitle className="text-xl font-mono text-amber-700">{formatCurrency(summaryData.tonDau)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-green-500 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Tổng Nhập trong kỳ</CardDescription>
              <CardTitle className="text-xl font-mono text-green-700">{formatCurrency(summaryData.tongNhap)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Doanh số (Xuất kho)</CardDescription>
              <CardTitle className="text-xl font-mono text-blue-700">{formatCurrency(summaryData.tongXuat)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-indigo-500 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Tồn cuối năm</CardDescription>
              <CardTitle className="text-xl font-mono text-indigo-700">{formatCurrency(summaryData.tonCuoi)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white/50 backdrop-blur-sm p-1 border border-gray-200 rounded-lg">
            <TabsTrigger value="overview">Tổng quan Biến động</TabsTrigger>
            <TabsTrigger value="analysis">Phân tích AI</TabsTrigger>
            <TabsTrigger value="mapping">Ánh xạ Danh mục</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart/Table Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Biến động xuất kho hàng tháng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyData.map((item) => (
                      <div key={item.month} className="group flex items-center gap-4">
                        <div className="w-16 text-sm font-medium text-gray-500 group-hover:text-blue-600">Tháng {item.month}</div>
                        <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000"
                            style={{ width: `${(item.value / maxMonthlyVal) * 100}%` }}
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center text-[10px] font-mono font-bold text-gray-700">
                             {formatCurrency(item.value)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Insights Column */}
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md flex items-center gap-2 text-blue-800">
                      <Zap className="h-4 w-4" /> Điểm tin nhanh
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3 text-blue-900/80">
                    <div className="flex gap-2">
                      <div className="mt-1"><CheckCircle2 className="h-4 w-4 text-blue-600" /></div>
                      <p><b>Vòng quay hàng:</b> Doanh số xuất kho chiếm 83.7% tổng giá trị (Hàng tồn + Nhập mới).</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="mt-1"><CheckCircle2 className="h-4 w-4 text-blue-600" /></div>
                      <p><b>Tháng đột biến:</b> Tháng 12 đạt kỷ lục 14.6 tỷ VNĐ (tăng 127% so với T11).</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="mt-1"><AlertCircle className="h-4 w-4 text-amber-600" /></div>
                      <p><b>Quản trị vốn:</b> Lượng tồn kho giảm từ 113 tỷ xuống 20 tỷ (Giảm ~82%), giải phóng lượng lớn tiền mặt.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                     <p className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-widest">Hiệu quả xử lý RAG</p>
                     <div className="text-4xl font-bold text-gray-900 tracking-tight">341</div>
                     <p className="text-sm text-gray-600">Mặt hàng được AI mapping thành công</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-purple-600" />
                  Báo cáo Phân tích từ Hệ thống AI
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <div className="space-y-4">
                  <section>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">1. Đánh giá cơ cấu Hàng hóa</h3>
                    <p>Hệ thống ghi nhận 341 mặt hàng có phát sinh. Đa số là các mặt hàng phụ tùng ô tô và dầu nhớt. Có hiện tượng một số mã hàng (như lọc dầu, má phanh) chiếm tỷ trọng doanh số lên tới 40%.</p>
                  </section>
                  <Separator />
                  <section>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">2. Xu hướng Nhập - Xuất</h3>
                    <p>Việc nhập hàng diễn ra rải rác nhưng tập trung mạnh vào Quý 3. Đặc biệt, chiến lược "Giảm tồn kho cuối năm" được thực hiện quyết liệt trong Tháng 12 để chuẩn bị cho kỳ kế toán mới.</p>
                  </section>
                  <Separator />
                  <section>
                    <h3 className="text-lg font-bold text-red-600">3. Cảnh báo dữ liệu (Data Cleaning)</h3>
                    <div className="bg-red-50 p-3 rounded-md border border-red-100 text-red-800 text-xs">
                       AI phát hiện 12 dòng "Chiết khấu %" trong bảng XNT được coi là mặt hàng. Đã thực hiện loại trừ các dòng này khỏi tính toán số lượng để đảm bảo tính chính xác của tồn kho vật lý.
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapping">
             <Card>
               <CardContent className="pt-6">
                  <div className="rounded-md border">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 font-bold">
                        <tr>
                          <th className="p-3 text-left">Tên Kế toán (Hóa đơn)</th>
                          <th className="p-3 text-left">Tên Kho (Thực tế)</th>
                          <th className="p-3 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="p-3">LỌC DẦU TOYOTA VIOS 1.5 2021</td>
                          <td className="p-3">Loc dau Vios 21</td>
                          <td className="p-3 text-center"><Badge className="bg-blue-100 text-blue-700">AI Matched</Badge></td>
                        </tr>
                        <tr>
                          <td className="p-3">MÁ PHANH TRƯỚC CAMRY 2.5 2019</td>
                          <td className="p-3">Ma phanh tr Camry 19</td>
                          <td className="p-3 text-center"><Badge className="bg-blue-100 text-blue-700">AI Matched</Badge></td>
                        </tr>
                        <tr>
                          <td className="p-3">DẦU NHỚT CASTROL MAGNATEC 10W-40 4L</td>
                          <td className="p-3">Castrol 10W40 4L</td>
                          <td className="p-3 text-center"><Badge className="bg-blue-100 text-blue-700">AI Matched</Badge></td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="p-4 bg-gray-50 text-center text-xs text-gray-500 italic">
                      ... và 338 mặt hàng khác đã được ánh xạ ...
                    </div>
                  </div>
               </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
