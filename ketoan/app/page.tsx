import Link from "next/link";
import { FileText, Database, Settings, RefreshCw, BarChart3, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* Header - Mobile First */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Kế Toán</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Quản lý Hóa đơn Điện tử
                </p>
              </div>
            </div>
            <Link 
              href="/hoadon"
              className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="hidden sm:inline">Vào ứng dụng</span>
              <span className="sm:hidden">Vào app</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Mobile First */}
      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Hệ thống Quản lý Hóa đơn Điện tử
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Đồng bộ và quản lý hóa đơn từ API Thuế Điện Tử (hoadondientu.gdt.gov.vn).
            Hỗ trợ RAG dữ liệu kế toán với n8n.
          </p>
        </div>

        {/* Feature Cards - Mobile First Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Link 
            href="/hoadon"
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
          >
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Quản lý Hóa đơn
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              Xem danh sách, tìm kiếm và quản lý hóa đơn bán ra/mua vào đã đồng bộ.
            </p>
          </Link>

          <Link 
            href="/hoadon"
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all group"
          >
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
              <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Đồng bộ từ API Thuế
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              Kết nối và đồng bộ hóa đơn từ cổng thuế điện tử tự động theo lịch.
            </p>
          </Link>

          <Link 
            href="/hoadon"
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all group"
          >
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <Database className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              RAG với n8n
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              Dữ liệu được lưu trữ phục vụ cho truy vấn RAG thông qua n8n workflow.
            </p>
          </Link>

          <Link 
            href="/hoadon"
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600 transition-all group"
          >
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Thống kê Báo cáo
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              Xem thống kê tổng hợp theo thời gian, theo loại hóa đơn và trạng thái.
            </p>
          </Link>

          <Link 
            href="/hoadon"
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-red-300 dark:hover:border-red-600 transition-all group sm:col-span-2 lg:col-span-1"
          >
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Cài đặt API
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              Cấu hình Bearer Token, base URL và các thông số kết nối API Thuế.
            </p>
          </Link>
        </div>

        {/* Quick Start - Mobile First */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Hướng dẫn Bắt đầu
          </h3>
          <ol className="space-y-4 sm:space-y-6">
            <li className="flex gap-3 sm:gap-4">
              <span className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs sm:text-sm font-medium">
                1
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Lấy Bearer Token</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Đăng nhập vào cổng thuế điện tử (hoadondientu.gdt.gov.vn) và lấy Bearer Token từ Developer Tools.
                </p>
              </div>
            </li>
            <li className="flex gap-3 sm:gap-4">
              <span className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs sm:text-sm font-medium">
                2
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Cấu hình API</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Vào phần Cài đặt API và nhập Bearer Token cùng các thông số cần thiết.
                </p>
              </div>
            </li>
            <li className="flex gap-3 sm:gap-4">
              <span className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs sm:text-sm font-medium">
                3
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Đồng bộ Hóa đơn</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Chọn khoảng thời gian và loại hóa đơn cần đồng bộ, hệ thống sẽ tự động tải về.
                </p>
              </div>
            </li>
            <li className="flex gap-3 sm:gap-4">
              <span className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs sm:text-sm font-medium">
                4
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Sử dụng với n8n</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Truy vấn dữ liệu hóa đơn thông qua các API endpoints hoặc kết nối trực tiếp database với n8n.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </main>

      {/* Footer - Mobile First */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-8 sm:mt-12">
        <div className="container mx-auto px-4 py-4 sm:py-6 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 Kế Toán - Hệ thống Quản lý Hóa đơn Điện tử</p>
        </div>
      </footer>
    </div>
  );
}
