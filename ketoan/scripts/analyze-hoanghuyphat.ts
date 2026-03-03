import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function analyze() {
  const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82';
  try {
    // 1. Phân tích Kho hàng bị Âm (Logic: Xuất nhiều hơn Nhập)
    const amKhoItems = await prisma.$queryRaw`
      SELECT th."tenHangChuan", th."maHang", th."dvtinh",
             SUM(CASE WHEN th."loaihd" = 'muavao' THEN th.sluong ELSE 0 END) as tong_nhap_qty,
             SUM(CASE WHEN th."loaihd" = 'banra' THEN th.sluong ELSE 0 END) as tong_xuat_qty,
             SUM(CASE WHEN th."loaihd" = 'muavao' THEN th."tongTien" ELSE 0 END) as tong_nhap_val,
             SUM(CASE WHEN th."loaihd" = 'banra' THEN th."tongTien" ELSE 0 END) as tong_xuat_val
      FROM ext_tonghop th
      WHERE th."congtyId" = ${congtyId}
      GROUP BY th."tenHangChuan", th."maHang", th."dvtinh"
      HAVING SUM(CASE WHEN th."loaihd" = 'muavao' THEN th.sluong ELSE 0 END) < SUM(CASE WHEN th."loaihd" = 'banra' THEN th.sluong ELSE 0 END)
         OR SUM(CASE WHEN th."loaihd" = 'muavao' THEN th."tongTien" ELSE 0 END) < SUM(CASE WHEN th."loaihd" = 'banra' THEN th."tongTien" ELSE 0 END)
      ORDER BY (SUM(CASE WHEN th."loaihd" = 'banra' THEN th."tongTien" ELSE 0 END) - SUM(CASE WHEN th."loaihd" = 'muavao' THEN th."tongTien" ELSE 0 END)) DESC
      LIMIT 10
    `;

    // 2. Phân tích Tiền mặt (Nguyên tắc: Tổng thanh toán mua vào > Tổng thu bán ra => có khả năng âm tiền nếu ko có vốn góp)
    const tienMat = await prisma.$queryRaw`
      SELECT 
         SUM(CASE WHEN loaihd = 'banra' THEN "tgtttbso" ELSE 0 END) as tong_thu_tu_ban_hang,
         SUM(CASE WHEN loaihd = 'muavao' THEN "tgtttbso" ELSE 0 END) as tong_chi_mua_hang
      FROM ext_listhoadon
      WHERE "congtyId" = ${congtyId}
    `;

    const tmResult = (tienMat as any[])[0];
    const tongThu = Number(tmResult.tong_thu_tu_ban_hang || 0);
    const tongChi = Number(tmResult.tong_chi_mua_hang || 0);
    const chenhLechTien = tongThu - tongChi;

    console.log(JSON.stringify({
      amKhoItems: amKhoItems,
      tienMat: { tongThu, tongChi, chenhLechTien }
    }, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
analyze();
