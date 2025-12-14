import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  adminService,
  type AdminUser,
  type AdminAccountStatus,
  type AdminProfileStatus,
  type AdminRole,
  type AdminLoginProvider
} from '../services';
import '../styles/AdminUserManagement.css';

type RoleFilter = 'all' | AdminRole;
type StatusFilter = 'all' | AdminAccountStatus;
type ProviderFilter = 'all' | AdminLoginProvider;
type AdminAction = 'role' | 'status' | 'profile' | 'reset' | 'delete';

interface ModalState {
  role: AdminRole;
  accountStatus: AdminAccountStatus;
  profileStatus: AdminProfileStatus;
  moderationNotes: string;
  flagged: boolean;
}

const providerLabels: Record<AdminLoginProvider, string> = {
  password: 'Password',
  google: 'Google OAuth',
  linkedin: 'LinkedIn OAuth',
  facebook: 'Facebook OAuth'
};

const accountStatusLabels: Record<AdminAccountStatus, string> = {
  active: 'Hoạt động',
  locked: 'Đã khóa',
  suspended: 'Bị treo'
};

const profileStatusLabels: Record<AdminProfileStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đạt chuẩn',
  rejected: 'Từ chối'
};

const roleLabels: Record<AdminRole, string> = {
  mentor: 'Mentor',
  mentee: 'Mentee',
  admin: 'Admin',
  moderator: 'Moderator'
};

export default function AdminUserManagement() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [providerStats, setProviderStats] = useState<Record<string, number>>({});
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [currentAction, setCurrentAction] = useState<AdminAction | null>(null);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const isAdminOrModerator = user?.role === 'admin' || user?.role === 'moderator';

  const loadAccounts = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        q: search,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        accountStatus: statusFilter !== 'all' ? statusFilter : undefined,
        provider: providerFilter !== 'all' ? providerFilter : undefined,
        flagged: flaggedOnly || undefined
      };
      const { users: result, meta } = await adminService.listUsers(filters);
      setAccounts(result);
      setProviderStats(meta.providerStats || {});
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminOrModerator) {
      loadAccounts(appliedQuery);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminOrModerator, roleFilter, statusFilter, providerFilter, flaggedOnly]);

  const summary = useMemo(() => {
    const total = accounts.length;
    const mentors = accounts.filter(account => account.role === 'mentor').length;
    const mentees = accounts.filter(account => account.role === 'mentee').length;
    const admins = accounts.filter(account => account.role === 'admin').length;
    const locked = accounts.filter(account => account.accountStatus !== 'active').length;
    const flagged = accounts.filter(account => account.isSpamSuspected).length;
    return { total, mentors, mentees, admins, locked, flagged };
  }, [accounts]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    setAppliedQuery(value);
    loadAccounts(value);
  };

  const resetSearch = () => {
    setQuery('');
    setAppliedQuery('');
    loadAccounts();
  };

  const openActionModal = (account: AdminUser, action: AdminAction) => {
    setSelectedUser(account);
    setCurrentAction(action);
    setModalError(null);
    setTempPassword(null);
    setModalState({
      role: account.role,
      accountStatus: account.accountStatus,
      profileStatus: account.profileStatus,
      moderationNotes: account.moderationNotes || '',
      flagged: account.isSpamSuspected || false
    });
  };

  const closeModal = () => {
    setSelectedUser(null);
    setCurrentAction(null);
    setModalState(null);
    setModalError(null);
    setModalLoading(false);
    setTempPassword(null);
  };

  const handleRoleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser || !modalState) return;
    try {
      setModalLoading(true);
      await adminService.updateUserRole(selectedUser._id, modalState.role);
      await loadAccounts(appliedQuery);
      closeModal();
    } catch (err: any) {
      setModalError(err?.message || 'Không thể cập nhật vai trò');
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser || !modalState) return;
    try {
      setModalLoading(true);
      await adminService.updateAccountStatus(selectedUser._id, modalState.accountStatus, modalState.moderationNotes);
      await loadAccounts(appliedQuery);
      closeModal();
    } catch (err: any) {
      setModalError(err?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setModalLoading(false);
    }
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser || !modalState) return;
    try {
      setModalLoading(true);
      await adminService.updateProfileReview(selectedUser._id, {
        profileStatus: modalState.profileStatus,
        moderationNotes: modalState.moderationNotes,
        flagged: modalState.flagged
      });
      await loadAccounts(appliedQuery);
      closeModal();
    } catch (err: any) {
      setModalError(err?.message || 'Không thể cập nhật kiểm duyệt hồ sơ');
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    try {
      setModalLoading(true);
      const password = await adminService.resetUserPassword(selectedUser._id);
      setTempPassword(password);
    } catch (err: any) {
      setModalError(err?.message || 'Không thể reset mật khẩu');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setModalLoading(true);
      await adminService.deleteUser(selectedUser._id);
      await loadAccounts(appliedQuery);
      closeModal();
    } catch (err: any) {
      setModalError(err?.message || 'Không thể xóa user');
    } finally {
      setModalLoading(false);
    }
  };

  if (!isAdminOrModerator) {
    return (
      <div className="admin-users admin-users--gate">
        <h1>Chỉ dành cho admin</h1>
        <p>Vui lòng đăng nhập bằng tài khoản admin hoặc moderator để quản lý người dùng.</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <header className="admin-users__hero">
        <div>
          <p className="eyebrow">GrowNet Control Room</p>
          <h1>Điều hành tài khoản mentor / mentee</h1>
          <p className="lead">
            Kiểm soát trạng thái đăng nhập, phân quyền, và kiểm duyệt hồ sơ dựa trên dữ liệu thật từ MongoDB.
          </p>
          <div className="provider-stats">
            {(['password', 'google', 'linkedin', 'facebook'] as AdminLoginProvider[]).map((providerKey) => (
              <span key={providerKey}>
                {providerLabels[providerKey]}: {providerStats[providerKey] || 0}
              </span>
            ))}
          </div>
        </div>
        <dl className="admin-users__summary">
          <div>
            <dt>Đang hiển thị</dt>
            <dd>{summary.total}</dd>
          </div>
          <div>
            <dt>Mentor</dt>
            <dd>{summary.mentors}</dd>
          </div>
          <div>
            <dt>Mentee</dt>
            <dd>{summary.mentees}</dd>
          </div>
          <div>
            <dt>Admin</dt>
            <dd>{summary.admins}</dd>
          </div>
          <div>
            <dt>Tài khoản bị khóa</dt>
            <dd>{summary.locked}</dd>
          </div>
          <div>
            <dt>Đang nghi ngờ</dt>
            <dd>{summary.flagged}</dd>
          </div>
        </dl>
      </header>

      <section className="admin-users__filters">
        <form onSubmit={handleSearch}>
          <label>
            <span>Tìm theo email, tên, username</span>
            <input
              type="text"
              placeholder="Ví dụ: grownet.com"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </label>
          <button type="submit" className="primary">Tìm kiếm</button>
          {appliedQuery && (
            <button type="button" className="ghost" onClick={resetSearch}>
              Xóa tìm kiếm
            </button>
          )}
        </form>

        <div className="advanced-filters">
          <fieldset>
            <legend>Vai trò</legend>
            {(['all', 'mentor', 'mentee', 'admin', 'moderator'] as RoleFilter[]).map(role => (
              <button
                key={role}
                type="button"
                className={`chip ${roleFilter === role ? 'is-active' : ''}`}
                onClick={() => setRoleFilter(role)}
              >
                {role === 'all' ? 'Tất cả' : roleLabels[role]}
              </button>
            ))}
          </fieldset>
          <fieldset>
            <legend>Tài khoản</legend>
            {(['all', 'active', 'locked', 'suspended'] as StatusFilter[]).map(status => (
              <button
                key={status}
                type="button"
                className={`chip ${statusFilter === status ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'Tất cả' : accountStatusLabels[status]}
              </button>
            ))}
          </fieldset>
          <fieldset>
            <legend>Đăng nhập Auth</legend>
            {(['all', 'password', 'google', 'linkedin', 'facebook'] as ProviderFilter[]).map(provider => (
              <button
                key={provider}
                type="button"
                className={`chip ${providerFilter === provider ? 'is-active' : ''}`}
                onClick={() => setProviderFilter(provider)}
              >
                {provider === 'all' ? 'Tất cả' : providerLabels[provider]}
              </button>
            ))}
          </fieldset>

          <label className="flagged-toggle">
            <p className="flagged-toggle__text">Chỉ hiện hồ sơ nghi ngờ spam/fake</p>
            <div>
              <input
                type="checkbox"
                checked={flaggedOnly}
                onChange={event => setFlaggedOnly(event.target.checked)}
              />
            </div>
          </label>

        </div>
      </section>

      <section className="admin-users__table" aria-live="polite">
        {loading ? (
          <p>Đang tải danh sách người dùng...</p>
        ) : error ? (
          <div className="admin-users__error">
            <p>{error}</p>
            <button type="button" onClick={() => loadAccounts(appliedQuery)}>Thử lại</button>
          </div>
        ) : accounts.length === 0 ? (
          <p>Không có tài khoản nào khớp bộ lọc hiện tại.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Hồ sơ</th>
                  <th>Đăng nhập</th>
                  <th>Hoạt động</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(account => (
                  <tr key={account._id}>
                    <td>
                      <div className="identity">
                        <img src={account.avatar || '/user_avt.png'} alt={account.fullName} />
                        <div>
                          <strong>{account.fullName}</strong>
                          <small>@{account.username}</small>
                        </div>
                      </div>
                    </td>
                    <td>{account.email}</td>
                    <td>
                      <span className={`role-pill role-${account.role}`}>{roleLabels[account.role]}</span>
                    </td>
                    <td>
                      <span className={`status-pill status-${account.accountStatus}`}>
                        {accountStatusLabels[account.accountStatus]}
                      </span>
                      {account.isSpamSuspected && <span className="status-pill status-flag">Spam?</span>}
                    </td>
                    <td>
                      <span className={`status-pill profile-${account.profileStatus}`}>
                        {profileStatusLabels[account.profileStatus]}
                      </span>
                      {account.moderationNotes && <small>{account.moderationNotes}</small>}
                    </td>
                    <td>
                      <div className="login-cell">
                        <span className={`status-pill provider-${account.lastLoginProvider || 'password'}`}>
                          {account.lastLoginProvider ? providerLabels[account.lastLoginProvider] : 'Chưa xác định'}
                        </span>
                        {account.lastLoginAt && (
                          <small >
                            {new Intl.DateTimeFormat('vi-VN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            }).format(new Date(account.lastLoginAt))}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      {account.lastActive
                        ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(account.lastActive))
                        : '—'}
                    </td>
                    <td>
                      <div className="actions">
                        <button type="button" onClick={() => openActionModal(account, 'role')}>
                          Phân quyền
                        </button>
                        <button type="button" onClick={() => openActionModal(account, 'status')}>
                          Khóa / mở
                        </button>
                        <button type="button" onClick={() => openActionModal(account, 'profile')}>
                          Kiểm duyệt
                        </button>
                        <button type="button" onClick={() => openActionModal(account, 'reset')}>
                          Reset mật khẩu
                        </button>
                        <button type="button" className="danger" onClick={() => openActionModal(account, 'delete')}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedUser && currentAction && modalState && (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className="admin-modal__panel">
            <header>
              <h2>
                {currentAction === 'role' && `Phân quyền cho ${selectedUser.fullName}`}
                {currentAction === 'status' && `Khóa / mở tài khoản ${selectedUser.fullName}`}
                {currentAction === 'profile' && `Kiểm duyệt hồ sơ ${selectedUser.fullName}`}
                {currentAction === 'reset' && `Reset đăng nhập ${selectedUser.fullName}`}
                {currentAction === 'delete' && `Xóa ${selectedUser.fullName}`}
              </h2>
              <button type="button" className="ghost" onClick={closeModal}>
                Đóng
              </button>
            </header>

            {modalError && <p className="admin-modal__error">{modalError}</p>}

            {currentAction === 'role' && (
              <form onSubmit={handleRoleSubmit} className="admin-modal__form">
                <label>
                  Chọn vai trò mới
                  <select
                    value={modalState.role}
                    onChange={event =>
                      setModalState(state => state ? { ...state, role: event.target.value as AdminRole } : state)
                    }
                  >
                    {(['mentor', 'mentee', 'admin', 'moderator'] as AdminRole[]).map(role => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                </label>
                <footer>
                  <button type="button" className="ghost" onClick={closeModal}>Hủy</button>
                  <button type="submit" disabled={modalLoading}>Lưu</button>
                </footer>
              </form>
            )}

            {currentAction === 'status' && (
              <form onSubmit={handleStatusSubmit} className="admin-modal__form">
                <label>
                  Trạng thái tài khoản
                  <select
                    value={modalState.accountStatus}
                    onChange={event =>
                      setModalState(state => state ? { ...state, accountStatus: event.target.value as AdminAccountStatus } : state)
                    }
                  >
                    {(['active', 'locked', 'suspended'] as AdminAccountStatus[]).map(status => (
                      <option key={status} value={status}>
                        {accountStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Ghi chú / lý do
                  <textarea
                    rows={3}
                    value={modalState.moderationNotes}
                    onChange={event =>
                      setModalState(state => state ? { ...state, moderationNotes: event.target.value } : state)
                    }
                  />
                </label>
                <footer>
                  <button type="button" className="ghost" onClick={closeModal}>Hủy</button>
                  <button type="submit" disabled={modalLoading}>Cập nhật</button>
                </footer>
              </form>
            )}

            {currentAction === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="admin-modal__form">
                <label>
                  Trạng thái hồ sơ
                  <select
                    value={modalState.profileStatus}
                    onChange={event =>
                      setModalState(state => state ? { ...state, profileStatus: event.target.value as AdminProfileStatus } : state)
                    }
                  >
                    {(['pending', 'approved', 'rejected'] as AdminProfileStatus[]).map(status => (
                      <option key={status} value={status}>
                        {profileStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flagged-toggle">
                  <input
                    type="checkbox"
                    checked={modalState.flagged}
                    onChange={event =>
                      setModalState(state => state ? { ...state, flagged: event.target.checked } : state)
                    }
                  />
                  Đánh dấu nghi ngờ spam / fake
                </label>
                <label>
                  Ghi chú kiểm duyệt
                  <textarea
                    rows={3}
                    value={modalState.moderationNotes}
                    onChange={event =>
                      setModalState(state => state ? { ...state, moderationNotes: event.target.value } : state)
                    }
                  />
                </label>
                <footer>
                  <button type="button" className="ghost" onClick={closeModal}>Hủy</button>
                  <button type="submit" disabled={modalLoading}>Lưu</button>
                </footer>
              </form>
            )}

            {currentAction === 'reset' && (
              <div className="admin-modal__form">
                <p>
                  Hệ thống sẽ tạo mật khẩu tạm thời và buộc người dùng đặt lại sau khi đăng nhập. Sử dụng khi phát hiện đăng nhập bất thường.
                </p>
                <div className="reset-block">
                  {tempPassword ? (
                    <code>{tempPassword}</code>
                  ) : (
                    <button type="button" onClick={handleResetPassword} disabled={modalLoading}>
                      Tạo mật khẩu tạm
                    </button>
                  )}
                </div>
                <footer>
                  <button type="button" className="ghost" onClick={closeModal}>Đóng</button>
                </footer>
              </div>
            )}

            {currentAction === 'delete' && (
              <div className="admin-modal__form">
                <p>
                  Bạn sắp xóa vĩnh viễn tài khoản {selectedUser.fullName}. Hành động không thể hoàn tác.
                </p>
                <footer>
                  <button type="button" className="ghost" onClick={closeModal}>Hủy</button>
                  <button type="button" className="danger" disabled={modalLoading} onClick={handleDeleteUser}>
                    Xác nhận xóa
                  </button>
                </footer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
