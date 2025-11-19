import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ChangePassword.css'
import Toast from "../components/Toast";

export default function ChangePassword() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [open, setOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: xử lý logic đổi mật khẩu tại đây
    console.log('Password changed:', form)
    setOpen(true);
  }

  return (
    <div className="change-password-container">
        <Toast
        open={open}
        onOpenChange={setOpen}
        message="Đã cập nhật thông tin"
        duration={5000}
        position="top-right"
      />
      <div className="change-password-card">
        <div className="card-header">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h2 className="title">Đổi Mật Khẩu</h2>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <label>Mật khẩu hiện tại</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            required
          />

          <label>Mật khẩu mới</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
          <small className="hint">
            Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa và số.
          </small>

          <label>Xác nhận mật khẩu mới</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn-confirm">
            XÁC NHẬN ĐỔI MẬT KHẨU
          </button>
        </form>
      </div>
    </div>
  )
}
