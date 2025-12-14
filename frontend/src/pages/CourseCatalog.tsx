import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { courseService, type Course, type CourseQuery } from '../services';
import { useAuth } from '../contexts/AuthContext';
import '../styles/CourseCatalog.css';

interface CatalogFilters {
  category: string;
  level: '' | 'beginner' | 'intermediate' | 'advanced';
  mentorName: string;
}

const defaultFilters: CatalogFilters = {
  category: '',
  level: '',
  mentorName: ''
};

export default function CourseCatalog() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCourses = async (query?: Partial<Omit<CatalogFilters, 'mentorName'>>) => {
    try {
      setLoading(true);
      setError(null);
      const params: CourseQuery = {};
      if (query?.category?.trim()) {
        params.category = query.category.trim();
      }
      if (query?.level) {
        params.level = query.level;
      }
      const result = await courseService.list(params);
      setCourses(result.courses);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err?.message || 'Không thể tải dữ liệu khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const visibleCourses = useMemo(() => {
    if (!filters.mentorName.trim()) {
      return courses;
    }
    const keyword = filters.mentorName.trim().toLowerCase();
    return courses.filter(course => course.mentorId.fullName.toLowerCase().includes(keyword));
  }, [courses, filters.mentorName]);

  const stats = useMemo(() => {
    const mentorSet = new Set(visibleCourses.map(course => course.mentorId._id));
    const totalHours = visibleCourses.reduce((sum, course) => sum + (course.durationHours || 0), 0);
    return [
      { label: 'Khoá học đang mở', value: visibleCourses.length.toString() },
      { label: 'Mentor tham gia', value: mentorSet.size.toString() },
      { label: 'Giờ nội dung', value: totalHours ? `${totalHours}+` : 'Đang cập nhật' }
    ];
  }, [visibleCourses]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchCourses({ category: filters.category, level: filters.level });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    fetchCourses();
  };

  return (
    <div className="course-catalog">
      <section className="catalog-hero">
        <div>
          <p className="eyebrow">GrowNet Learning Hub</p>
          <h1>Kết nối mentee với khóa học mentor đang hướng dẫn</h1>
          <p className="lead">
            {user?.role === 'mentor'
              ? 'Xem các lớp học khác để chuẩn hóa nội dung và cập nhật xu hướng mentoring.'
              : 'Chọn một khóa học chuyên sâu phù hợp kỹ năng bạn muốn bứt phá và gửi yêu cầu học thử ngay.'}
          </p>
          {lastUpdated && (
            <small className="timestamp">
              Cập nhật lần cuối {new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(lastUpdated)}
            </small>
          )}
        </div>
        <div className="catalog-stats">
          {stats.map(stat => (
            <article key={stat.label} className="catalog-stat">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="catalog-filter">
        <form onSubmit={handleSubmit}>
          <label>
            <span>Danh mục</span>
            <input
              type="text"
              placeholder="Product, Data, Marketing..."
              value={filters.category}
              onChange={event => setFilters(prev => ({ ...prev, category: event.target.value }))}
            />
          </label>
          <label>
            <span>Cấp độ</span>
            <select
              value={filters.level}
              onChange={event => setFilters(prev => ({ ...prev, level: event.target.value as CatalogFilters['level'] }))}
            >
              <option value="">Tất cả</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label>
            <span>Mentor</span>
            <input
              type="text"
              placeholder="Nhập tên mentor"
              value={filters.mentorName}
              onChange={event => setFilters(prev => ({ ...prev, mentorName: event.target.value }))}
            />
          </label>
          <div className="filter-actions">
            <button type="submit" className="primary">Lọc kết quả</button>
            <button type="button" onClick={resetFilters}>Xóa lọc</button>
          </div>
        </form>
      </section>

      <section className="catalog-grid">
        {loading ? (
          <p>Đang tải khóa học thực tế...</p>
        ) : error ? (
          <div className="catalog-error">
            <p>{error}</p>
            <button type="button" onClick={() => fetchCourses()}>Thử lại</button>
          </div>
        ) : visibleCourses.length === 0 ? (
          <p>Chưa có khóa học phù hợp bộ lọc hiện tại.</p>
        ) : (
          visibleCourses.map(course => (
            <article key={course._id} className="course-card">
              <header>
                <div>
                  <p className="course-category">{course.category || 'Đa lĩnh vực'}</p>
                  <h2>{course.title}</h2>
                  {course.subtitle && <p className="course-subtitle">{course.subtitle}</p>}
                </div>
                <span className="course-level">{course.level}</span>
              </header>
              <p className="course-description">{course.description}</p>
              <ul className="course-meta">
                {course.durationHours && <li>{course.durationHours} giờ nội dung</li>}
                {course.sessions && <li>{course.sessions} buổi nhóm/1:1</li>}
                <li>{course.format === 'online' ? 'Online' : course.format === 'hybrid' ? 'Hybrid' : 'Onsite'}</li>
                {course.language && <li>{course.language.toUpperCase()}</li>}
              </ul>
              <div className="course-mentor">
                <div>
                  <h3>{course.mentorId.fullName}</h3>
                  <p>{course.subtitle || course.category || 'Mentor GrowNet'}</p>
                </div>
                {course.price && <strong>{course.price.toLocaleString('vi-VN')} đ</strong>}
              </div>
              <footer>
                <div className="course-tags">
                  {(course.tags || []).slice(0, 3).map(tag => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <button type="button" className="outline">Gửi yêu cầu match</button>
              </footer>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
