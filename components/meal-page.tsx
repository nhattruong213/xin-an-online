"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PAYMENT, money } from "@/lib/payment";

const MEALS = [
  { value: "5000", label: "Ly trà đá", memo: "MOI MINH LY TRA DA" },
  { value: "20000", label: "Ổ bánh mì", memo: "MOI MINH O BANH MI" },
  { value: "50000", label: "Tô phở", memo: "MOI MINH TO PHO" },
  { value: "100000", label: "Bữa cơm đủ đầy", memo: "MOI MINH BUA COM" },
  { value: "custom", label: "Tuỳ tâm bạn", memo: "MOI MINH AN" },
];
const THANKS = [
  {
    min: 100000,
    title: 'Cảm ơn bạn, bữa nay có canh có thịt rồi!',
    body: (a: string) => 'Bạn vừa mời mình ' + a + ', đủ cho một bữa cơm tử tế. Mình xin phép ăn thật ngon để không phụ tấm lòng của bạn.',
    vow: 'Mình hứa ăn đủ rau, nhớ uống nước, và kể lại bữa cơm này như một câu chuyện đẹp.'
  },
  {
    min: 50000,
    title: 'Tô phở này ấm cả bụng lẫn lòng!',
    body: (a: string) => 'Cảm ơn bạn đã mời mình ' + a + '. Nước dùng thơm, bánh phở mềm, còn lòng tốt của bạn thì thơm hơn cả hành phi.',
    vow: 'Mình hứa húp hết nước dùng và gửi lời cảm ơn đến bạn trong từng thìa.'
  },
  {
    min: 20000,
    title: 'Ổ bánh mì giòn, tấm lòng còn giòn hơn!',
    body: (a: string) => 'Cảm ơn bạn đã mời mình ' + a + '. Bụng mình vừa khẽ nói "cảm ơn", mình xin phép nói to thay nó.',
    vow: 'Mình hứa ăn từ tốn, không làm rơi vụn nào, vì vụn bánh nào cũng mang theo thiện ý của bạn.'
  },
  {
    min: 1000,
    title: 'Ly trà đá mát lành, cảm ơn bạn nhiều!',
    body: (a: string) => 'Cảm ơn bạn đã mời mình ' + a + '. Nhỏ thôi nhưng đúng lúc, như cơn gió chiều giữa buổi trưa nắng.',
    vow: 'Mình hứa uống từng ngụm thật chậm và nhớ rằng thế giới này vẫn còn nhiều người dễ thương.'
  }
]

type Coin = { id: number; dx: number; delay: number };
export default function MealPage() {
  const [selection, setSelection] = useState("50000");
  const [customAmount, setCustomAmount] = useState("30000");
  const [caption, setCaption] = useState("Bát đang trống, bụng cũng vậy. Chọn một món bên dưới để thả đồng xu đầu tiên.");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [showThanks, setShowThanks] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coinId = useRef(0);
  const thanksRef = useRef<HTMLDivElement>(null);
  const selected = MEALS.find((meal) => meal.value === selection)!;
  const amount = selection === "custom" ? Number.parseInt(customAmount, 10) || 0 : Number(selection);
  const valid = Number.isSafeInteger(amount) && amount >= 1000;
  const shown = valid ? money(amount) : "Từ 1.000đ";
  const tier = THANKS.find((item) => amount >= item.min) || THANKS[THANKS.length - 1];

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  function toast(message: string) {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(""), 2200);
  }
  function dropCoins(value: number) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const count = value >= 100000 ? 4 : value >= 50000 ? 3 : value >= 20000 ? 2 : 1;
    setCoins((items) => [...items, ...Array.from({ length: count }, (_, index) => ({ id: coinId.current++, dx: Math.random() * 60 - 30, delay: index * 150 }))]);
  }
  function updateCustomCaption(value: string) {
    const custom = Number.parseInt(value, 10);
    if (Number.isSafeInteger(custom) && custom >= 1000) {
      setCaption("Tuỳ tâm bạn · " + money(custom) + ". Cảm ơn bạn nhiều lắm!");
      dropCoins(custom);
    }
  }
  function choose(value: string) {
    setSelection(value);
    const meal = MEALS.find((item) => item.value === value)!;
    const valueAmount = value === "custom" ? Number.parseInt(customAmount, 10) || 0 : Number(value);
    if (valueAmount >= 1000 && Number.isSafeInteger(valueAmount)) {
      setCaption(meal.label + " · " + money(valueAmount) + ". Cảm ơn bạn nhiều lắm!");
      dropCoins(valueAmount);
    }
  }
  async function copyText(value: string, success: string) {
    try { await navigator.clipboard.writeText(value); toast(success); }
    catch {
      // A manual fallback also works in browsers that block clipboard access.
      window.prompt("Sao chép nội dung bên dưới:", value);
    }
  }
  function copyValue(key: string) {
    const value = key === "account" ? PAYMENT.account : key === "memo" ? selected.memo : valid ? String(amount) : "";
    if (!value) { toast("Bạn nhập số tiền từ 1.000đ trở lên nhé"); return; }
    void copyText(value, "Đã sao chép");
  }
  function shareLink() {
    void copyText(window.location.href.split("#")[0], "Đã sao chép đường dẫn. Cảm ơn bạn đã lan tỏa!");
  }
  function thankYou() {
    if (!valid) { toast("Bạn nhập số tiền từ 1.000đ trở lên nhé"); return; }
    setShowThanks(true);
    setCaption("Đồng xu của bạn đã vào bát. Mình xin chân thành cảm ơn!");
    dropCoins(Math.max(amount, 50000));
    requestAnimationFrame(() => {
      thanksRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      thanksRef.current?.focus({ preventScroll: true });
    });
  }
  return <>
<div className="wrap">

  <header className="top">
    <div className="brand">
      <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 14h26c0 8-5 14-13 14S3 22 3 14z" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round"></path><path d="M7 14c1-5 5-8 9-8s8 3 9 8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"></path></svg>
      Xin Một Bữa
    </div>
    <small>Xin online, no offline</small>
  </header>

  <section className="hero" aria-labelledby="h-hero">
    <div className="hero-text">
      <p className="eyebrow">Nền tảng ăn xin online · không áo rách, không bát sứt</p>
      <h1 id="h-hero"><span className="l">Ăn xin online.</span><em>Bạn quét, mình no.</em></h1>
      <p className="lead">Chào bạn, mình là người đi xin. Thời đại số rồi nên mình xin bằng mã QR cho văn minh: bạn chọn món, mình ăn, ai cũng vui. Một ly trà đá thôi cũng được tính là đóng góp cho nền ẩm thực nước nhà.</p>
      <p className="hand">— người xin ăn phiên bản 2.0, có cả wifi</p>
      <div className="cta-row">
        <a className="btn btn-primary" href="#moi">Mời mình ăn</a>
        <a className="btn btn-ghost" href="#hua">Mình hứa gì?</a>
      </div>
    </div>

    <div className="bowl-wrap">
      <div className="bowl-stage" id="stage">{coins.map((coin) => <span key={coin.id} className="coin" aria-hidden="true" style={{ "--dx": coin.dx + "px", animationDelay: coin.delay + "ms" } as CSSProperties} onAnimationEnd={() => setCoins((items) => items.filter((item) => item.id !== coin.id))}>₫</span>)}
        <svg viewBox="0 0 320 260" role="img" aria-label="Chiếc bát sứ men lam đựng cơm trắng và một quả trứng ốp la">
          <g className="steam" fill="none" stroke="var(--muted)" strokeWidth="3" strokeLinecap="round">
            <path d="M120 38c-8-8 8-14 0-24"></path>
            <path d="M160 30c-8-8 8-14 0-24"></path>
            <path d="M200 38c-8-8 8-14 0-24"></path>
          </g>
          <path d="M52 112C60 66 108 48 160 48s100 18 108 64z" fill="var(--rice)" stroke="var(--cobalt)" strokeWidth="3.5" strokeLinejoin="round"></path>
          <g fill="var(--line)">
            <ellipse cx="96" cy="86" rx="5" ry="2.5" transform="rotate(-25 96 86)"></ellipse>
            <ellipse cx="124" cy="72" rx="5" ry="2.5" transform="rotate(15 124 72)"></ellipse>
            <ellipse cx="112" cy="100" rx="5" ry="2.5" transform="rotate(35 112 100)"></ellipse>
            <ellipse cx="228" cy="92" rx="5" ry="2.5" transform="rotate(-30 228 92)"></ellipse>
            <ellipse cx="246" cy="104" rx="5" ry="2.5" transform="rotate(20 246 104)"></ellipse>
          </g>
          <path d="M162 68c4-14 26-18 40-10 14 8 12 24-4 28-12 3-20-2-30 0-8 2-10-8-6-18z" fill="#FFFFFF" stroke="var(--cobalt)" strokeWidth="2.5" strokeLinejoin="round"></path>
          <circle cx="188" cy="72" r="9" fill="var(--yolk)"></circle>
          <path d="M24 108h272c0 82-52 130-136 130S24 190 24 108z" fill="var(--surface)" stroke="var(--cobalt)" strokeWidth="4" strokeLinejoin="round"></path>
          <path d="M18 108h284" stroke="var(--cobalt)" strokeWidth="9" strokeLinecap="round"></path>
          <g fill="none" stroke="var(--cobalt)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M52 150q12-18 24 0q12-18 24 0q12-18 24 0q12-18 24 0q12-18 24 0q12-18 24 0q12-18 24 0q12-18 24 0q12-18 24 0"></path>
            <path d="M88 178q12-18 24 0q12-18 24 0q12-18 24 0q12-18 24 0q12-18 24 0q12-18 24 0"></path>
            <path d="M112 204q12-16 24 0q12-16 24 0q12-16 24 0q12-16 24 0"></path>
          </g>
          <path d="M118 236h84l-6 14h-72z" fill="var(--cobalt-soft)" stroke="var(--cobalt)" strokeWidth="3.5" strokeLinejoin="round"></path>
        </svg>
      </div>
      <p className="bowl-caption" id="caption" aria-live="polite">{caption}</p>
    </div>
  </section>

  <section id="moi" aria-labelledby="h-moi">
    <div className="section-head">
      <p className="eyebrow">Thực đơn mời mình</p>
      <h2 id="h-moi">Bạn muốn mời mình món gì?</h2>
      <p className="lead">Giá tham khảo cho một bữa bình dân ngoài phố. Chọn món nào cũng được, hoặc tự nhập số bạn thấy vui.</p>
    </div>

    <div className="menu" role="radiogroup" aria-label="Chọn món muốn mời">
      <label className="item">
        <input type="radio" name="mon" value="5000" data-label="Ly trà đá" data-memo="MOI MINH LY TRA DA" checked={selection === "5000"} onChange={() => choose("5000")} />
        <span className="card"><span className="name">Ly trà đá</span><span className="price">5.000đ</span><span className="note">Giải khát, giải nhiệt, giải sầu.</span></span>
      </label>
      <label className="item">
        <input type="radio" name="mon" value="20000" data-label="Ổ bánh mì" data-memo="MOI MINH O BANH MI" checked={selection === "20000"} onChange={() => choose("20000")} />
        <span className="card"><span className="name">Ổ bánh mì</span><span className="price">20.000đ</span><span className="note">Có thêm chút pate là hạnh phúc.</span></span>
      </label>
      <label className="item">
        <input type="radio" name="mon" value="50000" data-label="Tô phở" data-memo="MOI MINH TO PHO" checked={selection === "50000"} onChange={() => choose("50000")} />
        <span className="card"><span className="name">Tô phở</span><span className="price">50.000đ</span><span className="note">Nước dùng nóng, lòng người cũng ấm.</span></span>
      </label>
      <label className="item">
        <input type="radio" name="mon" value="100000" data-label="Bữa cơm đủ đầy" data-memo="MOI MINH BUA COM" checked={selection === "100000"} onChange={() => choose("100000")} />
        <span className="card"><span className="name">Bữa cơm đủ đầy</span><span className="price">100.000đ</span><span className="note">Có canh, có thịt, có rau, có nụ cười.</span></span>
      </label>
      <label className="item custom">
        <input type="radio" name="mon" value="custom" data-label="Tuỳ tâm bạn" data-memo="MOI MINH AN" checked={selection === "custom"} onChange={() => choose("custom")} />
        <span className="card">
          <span className="name">Tuỳ tâm</span>
          <span className="custom-field"><input id="customAmount" type="number" inputMode="numeric" min="1000" step="1000" aria-label="Số tiền tuỳ tâm, đơn vị đồng" value={customAmount} onChange={(event) => { setCustomAmount(event.target.value); setSelection("custom"); updateCustomCaption(event.target.value); }} /><span>đ</span></span>
          <span className="note">Bao nhiêu cũng quý.</span>
        </span>
      </label>
    </div>

    <div className="panel" aria-live="polite">
      <div className="rows">
        <div className="row"><div><span className="lbl">Ngân hàng</span><span className="val" id="bank">{PAYMENT.bank}</span></div></div>
        <div className="row"><div><span className="lbl">Chủ tài khoản</span><span className="val" id="holder">{PAYMENT.holder}</span></div></div>
        <div className="row"><div><span className="lbl">Số tài khoản</span><span className="val" id="account">{PAYMENT.account}</span></div><button className="copy" type="button" data-copy="account" onClick={() => copyValue("account")}>Sao chép</button></div>
        <div className="row"><div><span className="lbl">Số tiền</span><span className="val big" id="amount">{shown}</span></div><button className="copy" type="button" data-copy="amountRaw" onClick={() => copyValue("amountRaw")}>Sao chép</button></div>
        <div className="row"><div><span className="lbl">Nội dung chuyển khoản</span><span className="val" id="memo">{selected.memo}</span></div><button className="copy" type="button" data-copy="memo" onClick={() => copyValue("memo")}>Sao chép</button></div>
        <span id="amountRaw" hidden>{valid ? String(amount) : ""}</span>
      </div>
      <div className="qr">
        <img src="/payment-qr.png" width="220" height="220" alt="Mã QR chuyển khoản VietQR của Nguyen Nhat Truong, ngân hàng TPBank" />
        <p>Mở app ngân hàng, quét mã là xong. Mã không kèm số tiền, bạn nhập theo món đã chọn nhé.</p>
      </div>
    </div>
    <p className="sample-note" id="sampleNote" hidden><strong>Thông tin mẫu.</strong> Số tài khoản và tên bên trên chỉ là chỗ giữ chỗ. Hãy thay bằng thông tin chính chủ của bạn trước khi chia sẻ trang.</p>
    <div className="thanks-cta">
      <button className="btn btn-primary" type="button" id="doneBtn" aria-controls="thanks" aria-expanded={showThanks} onClick={thankYou}>Mình vừa chuyển xong</button>
      <span className="hand">Chuyển xong, bạn bấm đây để nhận lời cảm ơn nho nhỏ của mình nhé.</span>
    </div>
    <div className="thanks" id="thanks" tabIndex={-1} aria-live="polite" hidden={!showThanks} ref={thanksRef}>
      <h3 id="thanksTitle">{tier.title}</h3>
      <p className="body" id="thanksBody">{tier.body(valid ? money(amount) : "một chút lòng tốt")}</p>
      <p className="vow" id="thanksVow">{tier.vow}</p>
      <p className="sign">— Người xin ăn lịch sự nhất khu phố</p>
      <div className="actions">
        <button className="btn btn-primary" type="button" id="shareBtn2" onClick={shareLink}>Kể cho bạn bè nghe</button>
        <a className="btn btn-ghost" href="#moi">Xem lại thực đơn</a>
      </div>
    </div>
  </section>

  <section id="hua" className="split" aria-labelledby="h-hua">
    <div>
      <p className="eyebrow">Lời hứa của người đi xin</p>
      <h2 id="h-hua">Xin thì xin, nhưng mình xin có đạo đức.</h2>
      <ul className="promises">
        <li>
          <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="14" cy="14" r="11"></circle><path d="M8.5 14.5l4 4 7-8"></path></svg>
          <div><b>Nói thật, không vòng vo.</b><span>Không kể khổ quá đà, không bán hàng đa cấp. Cần một bữa ăn thì nói là cần một bữa ăn.</span></div>
        </li>
        <li>
          <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 24S3 17.5 3 10.5A6 6 0 0 1 14 7a6 6 0 0 1 11 3.5C25 17.5 14 24 14 24z"></path></svg>
          <div><b>Cảm ơn từng ly trà đá.</b><span>Mình đọc từng lời nhắn trong nội dung chuyển khoản và nhớ từng người.</span></div>
        </li>
        <li>
          <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 14a10 10 0 0 1 17-7l3 3"></path><path d="M24 4v6h-6"></path><path d="M24 14a10 10 0 0 1-17 7l-3-3"></path><path d="M4 24v-6h6"></path></svg>
          <div><b>Có dư thì cho lại.</b><span>Khi khá hơn, mình mời lại một người lạ một bữa cơm. Vòng tròn tử tế cứ thế quay tiếp.</span></div>
        </li>
      </ul>
    </div>

    <div className="receipt" aria-label="Hóa đơn niềm vui, tự cập nhật theo món bạn chọn">
      <h3>Hóa đơn niềm vui</h3>
      <p className="meta">Bàn: không có · Khách: người tốt bụng</p>
      <div className="line"><span className="t" id="rItem">{selected.label}</span><span className="dots"></span><span className="p" id="rPrice">{valid ? shown : "0đ"}</span></div>
      <div className="line"><span className="t">Lời cảm ơn chân thành ×1</span><span className="dots"></span><span className="p">0đ</span></div>
      <div className="line"><span className="t">Một nụ cười hôm nay ×1</span><span className="dots"></span><span className="p">0đ</span></div>
      <div className="line"><span className="t">Cảm giác vừa làm việc tốt ×1</span><span className="dots"></span><span className="p">0đ</span></div>
      <div className="total"><span>Bạn trả</span><strong id="rTotal">{valid ? shown : "0đ"}</strong></div>
      <p className="foot">Không cần xuất hóa đơn đỏ, mình nhớ ơn bạn rồi.</p>
    </div>
  </section>

  <section aria-labelledby="h-help">
    <div className="section-head">
      <p className="eyebrow">Chưa tiện chuyển khoản?</p>
      <h2 id="h-help">Vẫn có ba cách giúp mình.</h2>
    </div>
    <div className="help">
      <div>
        <h3>Chia sẻ trang này</h3>
        <p>Gửi cho một người bạn hay cười, hoặc người từng bị mình xin cơm rồi.</p>
        <button className="btn btn-primary" type="button" id="shareBtn" onClick={shareLink}>Sao chép đường dẫn</button>
      </div>
      <div>
        <h3>Gửi một lời chúc</h3>
        <p>Nhắn mình vài chữ động viên. Chữ không tốn tiền nhưng no lòng lâu.</p>
      </div>
      <div>
        <h3>Giới thiệu việc làm</h3>
        <p>Có chỗ nào cần người chăm chỉ, nhớ nhắn mình. Xin cần câu còn quý hơn xin cá.</p>
      </div>
    </div>
  </section>

  <section aria-labelledby="h-faq">
    <div className="section-head">
      <p className="eyebrow">Hỏi nhanh đáp gọn</p>
      <h2 id="h-faq">Bạn đang nghĩ gì, mình biết hết.</h2>
    </div>
    <div className="faq">
      <details>
        <summary>Đây có phải trò lừa đảo không?</summary>
        <p>Không hứa lãi, không bán gì, không ép ai. Bạn chỉ chuyển khi thấy muốn. Tên chủ tài khoản hiện ngay phía trên để bạn đối chiếu trước khi gửi.</p>
      </details>
      <details>
        <summary>Mình nên chuyển bao nhiêu?</summary>
        <p>Bao nhiêu cũng được. Một ly trà đá cũng là một lời động viên. Đừng chuyển số khiến bạn phải thắt lưng buộc bụng.</p>
      </details>
      <details>
        <summary>Chuyển xong có cần báo không?</summary>
        <p>Không cần. Nhưng nếu bạn để lại vài chữ trong nội dung chuyển khoản, mình sẽ đọc và cười một mình.</p>
      </details>
      <details>
        <summary>Mình không muốn cho tiền thì sao?</summary>
        <p>Hoàn toàn ổn. Bạn ghé thăm, đọc đến đây và mỉm cười là mình đã vui rồi.</p>
      </details>
    </div>
  </section>

  <footer>
    <p className="hand">Cảm ơn bạn đã ghé qua. Chúc bạn hôm nay ăn ngon.</p>
    <p>Làm bằng cơm nguội và lòng biết ơn.</p>
    <p className="copyright">© 2026 Bảo lưu mọi quyền. Lời văn, hình minh họa và bố cục của trang này thuộc về chủ trang. Vui lòng không sao chép hoặc dùng lại cho mục đích thương mại khi chưa được đồng ý. Chia sẻ đường dẫn thì luôn được hoan nghênh.</p>
  </footer>
</div>

<div className="toast-wrap"><div id="toast" role="status" aria-live="polite" className={toastMessage ? "toast show" : "toast"}>{toastMessage}</div></div>

</>;
}
