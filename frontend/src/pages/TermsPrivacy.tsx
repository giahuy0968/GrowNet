import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TermsPrivacy.css";

export default function TermsPrivacy() {
    const navigate = useNavigate();
  return (
    <div className="tp-container">
      <div className="tp-card">
        <div className="tp-header">
            <button className="tp-back-btn" onClick={() => navigate("/settings")}>←</button>
            <h1 className="tp-title">Điều Khoản & Quyền Riêng Tư</h1>
        </div>

        <section className="tp-section">
          <h2 className="tp-section-title">1. Điều khoản dịch vụ</h2>
          <p className="tp-text">
            Bằng việc sử dụng GrowNet, bạn đồng ý tuân thủ các điều khoản dịch vụ và
            chính sách của chúng tôi. Việc vi phạm có thể dẫn đến việc đình chỉ hoặc 
            khóa vĩnh viễn tài khoản.
          </p>
        </section>

        <section className="tp-section">
          <h2 className="tp-section-title">2. Chính sách quyền riêng tư</h2>
          <p className="tp-text">
            Chúng tôi cam kết bảo vệ dữ liệu cá nhân của bạn. Các thông tin thu thập bao gồm:
          </p>
          <ul className="tp-list">
            <li>Dữ liệu hồ sơ (tên, chức danh, kỹ năng).</li>
            <li>Lịch sử hoạt động Match và Chat (được mã hoá).</li>
            <li>Dữ liệu vị trí (tuỳ chọn, phục vụ gợi ý Match gần bạn).</li>
          </ul>
          <p className="tp-text">
            Chúng tôi không chia sẻ dữ liệu cá nhân của bạn với bên thứ ba mà không có
            sự đồng ý rõ ràng của bạn.
          </p>
        </section>
      </div>
    </div>
  );
}
