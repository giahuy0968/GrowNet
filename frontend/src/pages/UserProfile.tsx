import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService, connectionService } from '../services';
import type { User } from '../services';
import type { UserStats } from '../services/user.service';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import '../styles/connect.css';

interface ToastState {
  open: boolean;
  message: string;
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' });

  const isOwnProfile = authUser?._id === id;

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!id) {
        setError('Không tìm thấy hồ sơ cần xem.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [userData, statsData] = await Promise.all([
          userService.getUserById(id),
          userService.getUserStats(id).catch(() => null)
        ]);

        if (!mounted) {
          return;
        }

        setProfile(userData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        if (mounted) {
          setError('Không thể tải hồ sơ. Vui lòng thử lại sau.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [id]);

  const highlightCards = useMemo(() => {
    if (!profile) {
      return [];
    }

    const createdLabel = profile.createdAt
      ? new Intl.DateTimeFormat('vi-VN', { month: 'short', year: 'numeric' }).format(new Date(profile.createdAt))
      : 'Đang cập nhật';

    return [
      { label: 'Kết nối', value: stats?.connections != null ? stats.connections.toString() : '—' },
      { label: 'Bài viết', value: stats?.posts != null ? stats.posts.toString() : '—' },
      { label: 'Kinh nghiệm', value: profile.experienceYears ? `${profile.experienceYears}+ năm` : 'Đang cập nhật' },
      { label: 'Tham gia từ', value: createdLabel }
    ];
  }, [profile, stats]);

  const heroTags = useMemo(() => {
    if (!profile) {
      return [];
    }
    const tags = profile.fields?.length ? profile.fields : profile.interests;
    return tags && tags.length ? tags.slice(0, 5) : ['Chưa cập nhật'];
  }, [profile]);

  const handleConnect = async () => {
    if (!profile?._id) {
      return;
    }

    try {
      setConnecting(true);
      const result = await connectionService.sendRequest(profile._id);
      const message = result.matched
        ? 'Hai bạn đã kết nối! Hãy bắt đầu trò chuyện ngay nhé.'
        : 'Đã gửi lời mời kết nối.';
      setToast({ open: true, message });

      if (result.matched && result.chat?._id) {
        navigate(`/chat/${result.chat._id}`, { state: { chatId: result.chat._id } });
      }
    } catch (err) {
      setToast({ open: true, message: 'Không thể gửi lời mời. Vui lòng thử lại.' });
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="user-profile user-profile__state">
        <p>Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="user-profile user-profile__state">
        <div>
          <p>{error || 'Không tìm thấy hồ sơ.'}</p>
          <button type="button" className="btn ghost" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="uprof-user-profile">
        <div className="profile-container">
          <section className="user-profile__hero">
            <div className="hero-shell">
              <div className="hero-main">
                <img
                  src={profile.avatar || '/user_avt.png'}
                  alt={profile.fullName || profile.username}
                  className="hero-avatar"
                />
                <div>
                  <p className="hero-label">{profile.fields?.[0] || 'Hồ sơ GrowNet'}</p>
                  <h1>{profile.fullName || profile.username}</h1>
                  <p className="hero-meta">
                    @{profile.username}
                    {profile.location?.city && (
                      <>
                        {' · '}
                        {[profile.location?.city, profile.location?.country].filter(Boolean).join(', ')}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="hero-side">
                <div className="hero-tags">
                  {heroTags.slice(2).map(tag => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="hero-actions">
                {!isOwnProfile && (
                  <button type="button" className="btn primary" onClick={handleConnect} disabled={connecting}>
                    {connecting ? 'Đang xử lý...' : 'Kết nối'}
                  </button>
                )}
                <button type="button" className="btn ghost" onClick={() => navigate('/dashboard')}>
                  Quay lại
                </button>
              </div>
            </div>
          </section>

          <div className="profile-body">
            <main className="profile-main">
              <section className="user-profile__sections">
                <article className="section-card section-span-2">
                  <header>
                    <h2>Giới thiệu</h2>
                    <p>Thông tin tổng quan về {profile.fullName || profile.username}</p>
                  </header>
                  <p className="bio">{profile.bio || 'Chưa có mô tả chi tiết.'}</p>
                  <dl className="definition-list">
                    <div>
                      <dt>Chức danh</dt>
                      <dd>{profile.fields?.[0] || 'Chưa cập nhật'}</dd>
                    </div>
                    <div>
                      <dt>Kỹ năng chính</dt>
                      <dd>
                        {profile.skills && profile.skills.length > 0
                          ? profile.skills.slice(0, 3).join(', ')
                          : 'Chưa cập nhật'}
                      </dd>
                    </div>
                    <div>
                      <dt>Kinh nghiệm</dt>
                      <dd>{profile.experienceYears ? `${profile.experienceYears} năm` : 'Chưa cập nhật'}</dd>
                    </div>
                    <div>
                      <dt>Độ tuổi</dt>
                      <dd>{profile.age || 'Chưa cập nhật'}</dd>
                    </div>
                  </dl>
                </article>

                <article className="section-card">
                  <header>
                    <h2>Chuyên môn & kỹ năng</h2>
                  </header>
                  <div className="tags-wrap">
                    {(profile.skills && profile.skills.length > 0 ? profile.skills : ['Chưa cập nhật']).map(skill => (
                      <span key={skill} className="chip neutral">
                        {skill}
                      </span>
                    ))}
                  </div>
                </article>

                <article className="section-card">
                  <header>
                    <h2>Lĩnh vực quan tâm</h2>
                  </header>
                  <div className="tags-wrap">
                    {(profile.interests && profile.interests.length > 0 ? profile.interests : ['Chưa cập nhật']).map(tag => (
                      <span key={tag} className="chip soft">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>

                <article className="section-card section-span-2">
                  <header>
                    <h2>Thông tin khác</h2>
                  </header>
                  <dl className="definition-list">
                    <div>
                      <dt>Giới tính</dt>
                      <dd>
                        {profile.gender
                          ? profile.gender === 'male'
                            ? 'Nam'
                            : profile.gender === 'female'
                              ? 'Nữ'
                              : 'Khác'
                          : 'Chưa cập nhật'}
                      </dd>
                    </div>
                    <div>
                      <dt>Ngôn ngữ</dt>
                      <dd>{profile.languages?.join(', ') || 'Chưa cập nhật'}</dd>
                    </div>
                    <div>
                      <dt>Thời gian rảnh</dt>
                      <dd>{profile.availability || 'Chưa cập nhật'}</dd>
                    </div>
                  </dl>
                </article>
              </section>
            </main>

            <aside className="profile-side">
              <section className="user-profile__metrics">
                {highlightCards.map(card => (
                  <article key={card.label} className="metric-card">
                    <p>{card.label}</p>
                    <strong>{card.value}</strong>
                  </article>
                ))}
              </section>
            </aside>
          </div>
        </div>
      </div>
      <Toast
        open={toast.open}
        message={toast.message}
        onOpenChange={open => setToast(prev => ({ ...prev, open }))}
      />
    </>
  );
}
