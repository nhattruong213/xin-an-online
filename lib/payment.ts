// Thông tin và QR giữ nguyên theo website mẫu.
// Khi đổi người nhận, phải thay cả cấu hình này và public/payment-qr.png.
export const PAYMENT = {
  bank: "Ngân hàng Thương mại Cổ phần Tiên Phong (TPBank)",
  holder: "NGUYEN NHAT TRUONG",
  account: "02468966201",
};
export const money = (amount: number) => amount.toLocaleString("vi-VN") + "đ";
