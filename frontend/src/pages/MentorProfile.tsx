import React from 'react';
import '../styles/MentorProfile.css';
import { Navigate, useNavigate } from 'react-router-dom';
interface ExperienceItem {
    role: string;
    company: string;
    from: string;
    to: string;
    current?: boolean;
}

interface ReviewItem {
    author: string;
    content: string;
    stars: number;
}
interface WorkingFor {
    role: string,
    company: string,
}
interface MentorProfileProps {
    isOwner?: boolean;
}

const EXPERIENCES: ExperienceItem[] = [
    { role: 'Senior UX/UI Designer', company: 'CreativeLab', from: '2019', to: 'Hiện tại', current: true },
    { role: 'Product Designer', company: 'Innovatech Solutions', from: '2017', to: '2019' },
    { role: 'Junior Graphic Designer', company: 'Fresh Branding Agency', from: '2016', to: '2017' }
];

const REVIEWS: ReviewItem[] = [
    { author: 'Trần Văn C', stars: 5, content: 'Buổi học rất chi tiết và dễ hiểu. Anh Minh Anh đã giúp tôi sắp xếp lại portfolio một cách logic và chuyên nghiệp. Rất khuyến khích cho các bạn mới vào ngành!' },
    { author: 'Lê Thị D', stars: 5, content: 'Thời gian phản hồi nhanh chóng, kiến thức sâu rộng về Figma. Rất hài lòng với chất lượng buổi mentoring.' }
];
const WORKING_FOR: WorkingFor[] = [
    { role: 'UX/UI Designer', company: 'CreativeLab' },
];
const CORE_SKILLS = ['Figma', 'UX Research', 'UI Design', 'Teamwork', 'Prototyping', 'Mobile App Design'];

export default function MentorProfile({ isOwner = false }: MentorProfileProps) {
    const navigate = useNavigate();
    return (
        <div className="mentor-profile-page">
            <div className="mentor-grid">
                {/* Left Primary Profile Card */}
                <section className="profile-card-large">
                    <header className="profile-header-row">
                        <div className="avatar-wrapper">
                            <img src="https://placehold.co/96x96" alt="Mentor Avatar" className="avatar" />
                            <span className="status-dot" aria-label="Online" />
                        </div>
                        <div className="profile-header-info">
                            <h1 className="mentor-name">Nguyễn Minh Anh</h1>
                            <p className="mentor-meta">Mentor • UX/UI Designer • TP.HCM</p>
                            {!isOwner && (
                                <div className="action-row">
                                    <button className="btn-primary" type="button" onClick={() => navigate('/chat')}>🤝 Kết nối ngay</button>
                                    <button className="btn-ghost" type="button" onClick={() => navigate('/schedule')}>📅 Đặt lịch</button>
                                    <button className="btn-mess" type="button" onClick={() => navigate('/chat')}>
                                        <img src="/paper-plane.svg" alt="send" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </header>
                    <div className="profile-body-section">
                        <section className="section-block">
                            <h2 className="section-title">Giới thiệu</h2>
                            <div className="intro-text">
                                <p>Tôi là một nhà thiết kế giao diện người dùng với 5 năm kinh nghiệm làm việc tại các startup công nghệ phát triển nhanh. Mục tiêu của tôi là giúp các mentee định hướng nghề nghiệp và phát triển tư duy thiết kế sản phẩm sáng tạo.</p>
                                <p>Tôi đặc biệt quan tâm đến việc tạo ra các giải pháp thân thiện với người dùng và có khả năng mở rộng. Tôi có thể hỗ trợ bạn từ việc xây dựng portfolio, chuẩn bị phỏng vấn, đến việc giải quyết các thách thức thiết kế phức tạp.</p>
                            </div>
                        </section>
                        <section className="section-block">
                            <h2 className="section-title">Kinh nghiệm làm việc</h2>
                            <ul className="experience-timeline">
                                {EXPERIENCES.map(exp => (
                                    <li key={exp.role} className="exp-item">
                                        <div className="exp-marker" />
                                        <div className="exp-content">
                                            <p className="exp-role">{exp.role}</p>
                                            <p className="exp-company">{exp.company}</p>
                                            <p className="exp-range">{exp.from} - {exp.to}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <section className="section-block">
                            <h2 className="section-title">Công việc hiện tại</h2>
                            <ul className="experience-timeline">
                                {WORKING_FOR.map(exp => (
                                    <li key={exp.role} className="exp-item">
                                        <div />
                                        <div className="working-for-content">
                                            <p className="role">{exp.role}</p>
                                            <p className="company-name">{exp.company}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </section>

                {/* Right Column Cards */}
                <aside className="right-column">
                    <div className="skills-card">
                        <h3 className="skills-title">Kỹ năng cốt lõi</h3>
                        <div className="skills-tags">
                            {CORE_SKILLS.map(s => (
                                <span key={s} className="skill-tag">{s}</span>
                            ))}
                        </div>
                    </div>
                    <div className="rating-card">
                        <div className="rating-top">
                            <div className="stars" aria-label="4.8 trên 5">
                                {'★★★★★'.slice(0, 4)}<span className="star-dim">★</span>
                            </div>
                            <div className="rating-score">4.8<span className="rating-out">/5.0</span></div>
                            <p className="rating-count">Từ 24 lượt đánh giá</p>
                        </div>
                        <div className="rating-stats-grid">
                            <div className="stat-box">
                                <div className="stat-value">50+</div>
                                <div className="stat-label">Tổng số buổi</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-value">1h</div>
                                <div className="stat-label">Phản hồi TB</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-value">95%</div>
                                <div className="stat-label">Tỷ lệ thành công</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-value">5</div>
                                <div className="stat-label">Năm kinh nghiệm</div>
                            </div>
                        </div>
                    </div>
                    <div className="pricing-card">
                        <div className="pricing-header">Phí Mentoring</div>
                        <div className="pricing-value">200.000 VND / giờ</div>
                        <p className="pricing-sub">(Áp dụng cho các buổi cố vấn cá nhân)</p>
                    </div>
                </aside>

                {/* Reviews full width under left card */}
                <section className="reviews-card">
                    <h2 className="reviews-title">24 lượt đánh giá</h2>
                    <ul className="reviews-list">
                        {REVIEWS.map(r => (
                            <li key={r.author} className="review-item">
                                <div className="review-header">
                                    <span className="review-author">{r.author}</span>
                                    <span className="review-stars" aria-label={`${r.stars} sao`}>
                                        {'★★★★★'.slice(0, r.stars)}
                                    </span>
                                </div>
                                <p className="review-text">{r.content}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="reviews-footer">
                        <button type="button" className="btn-link">Xem tất cả đánh giá</button>
                    </div>

                </section>
            </div>
        </div >
    );
}