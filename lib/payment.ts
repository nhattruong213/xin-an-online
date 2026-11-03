// Thông tin và QR giữ nguyên theo website mẫu.
// Khi đổi người nhận, phải thay cả cấu hình này và public/payment-qr.png.
export const PAYMENT = {
  bank: "Ngân hàng Bản Việt (BVBank)",
  holder: "CHU ANH PHUONG",
  account: "9037041118903",
};
export const money = (amount: number) => amount.toLocaleString("vi-VN") + "đ";
