import React, { useEffect, useMemo, useState } from 'react';
import { courseService, certificateService, type Course, type CourseModule, type Certificate } from '../services';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import '../styles/MentorAcademy.css';

interface CourseFormState {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  format: 'online' | 'hybrid' | 'onsite';
  language: string;
  durationHours: number;
  sessions: number;
  price: number;
  coverImage: string;
  tags: string;
  tools: string;
  startDate: string;
  endDate: string;
  modules: CourseModule[];
}

interface CertificateFormState {
  menteeEmail: string;
  menteeId: string;
  courseId: string;
  summary: string;
  skills: string;
  badgeUrl: string;
  evidenceUrl: string;
  issuedAt: string;
}

const emptyModule: CourseModule = {
  title: '',
  content: '',
  durationHours: 2,
  deliverable: ''
};

const createCourseFormState = (): CourseFormState => ({
  title: '',
  subtitle: '',
  description: '',
  category: '',
  level: 'intermediate',
  format: 'online',
  language: 'vi',
  durationHours: 12,
  sessions: 4,
  price: 0,
  coverImage: '',
  tags: '',
  tools: '',
  startDate: '',
  endDate: '',
  modules: [{ ...emptyModule }]
});

const createCertificateFormState = (): CertificateFormState => ({
  menteeEmail: '',
  menteeId: '',
  courseId: '',
  summary: '',
  skills: '',
  badgeUrl: '',
  evidenceUrl: '',
  issuedAt: new Date().toISOString().split('T')[0]
});

export default function MentorAcademy() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [courseForm, setCourseForm] = useState<CourseFormState>(() => createCourseFormState());
  const [certificateForm, setCertificateForm] = useState<CertificateFormState>(() => createCertificateFormState());
  const [loading, setLoading] = useState(true);
  const [certificateLoading, setCertificateLoading] = useState(true);
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [issuingCertificate, setIssuingCertificate] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '' });

  const isMentor = user?.role === 'mentor' || user?.role === 'admin';

  useEffect(() => {
    if (!isMentor) {
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const result = await courseService.listMine();
        setCourses(result);
      } catch (error) {
        console.error('Không thể tải danh sách khóa học', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [isMentor]);

  useEffect(() => {
    if (!isMentor) {
      return;
    }

    const fetchCertificates = async () => {
      try {
        setCertificateLoading(true);
        const result = await certificateService.listMentorCertificates();
        setCertificates(result);
      } catch (error) {
        console.error('Không thể tải chứng chỉ', error);
      } finally {
        setCertificateLoading(false);
      }
    };

    fetchCertificates();
  }, [isMentor]);

  const stats = useMemo(() => {
    const totalHours = courses.reduce((sum, course) => sum + (course.durationHours || 0), 0);
    return [
      { label: 'Khoá học đã tạo', value: courses.length.toString() },
      { label: 'Giờ mentoring', value: totalHours ? `${totalHours}h` : '—' },
      { label: 'Chứng chỉ đã cấp', value: certificates.length.toString() }
    ];
  }, [courses, certificates]);

  const handleCourseFormChange = (field: keyof CourseFormState, value: string | number | CourseModule[]) => {
    setCourseForm(prev => ({ ...prev, [field]: value }));
  };

  const handleModuleChange = (index: number, field: keyof CourseModule, value: string | number | undefined) => {
    setCourseForm(prev => {
      const modules = prev.modules.map((module, idx) => (idx === index ? { ...module, [field]: value } : module));
      return { ...prev, modules };
    });
  };

  const addModule = () => {
    setCourseForm(prev => ({ ...prev, modules: [...prev.modules, { ...emptyModule }] }));
  };

  const removeModule = (index: number) => {
    setCourseForm(prev => ({ ...prev, modules: prev.modules.filter((_, idx) => idx !== index) }));
  };

  const handleCreateCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittingCourse(true);
    try {
      const payload = {
        title: courseForm.title.trim(),
        subtitle: courseForm.subtitle.trim() || undefined,
        description: courseForm.description.trim(),
        category: courseForm.category.trim() || undefined,
        level: courseForm.level,
        format: courseForm.format,
        language: courseForm.language,
        durationHours: courseForm.durationHours,
        sessions: courseForm.sessions,
        price: courseForm.price || undefined,
        coverImage: courseForm.coverImage.trim() || undefined,
        tags: courseForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        tools: courseForm.tools.split(',').map(tool => tool.trim()).filter(Boolean),
        startDate: courseForm.startDate || undefined,
        endDate: courseForm.endDate || undefined,
        modules: courseForm.modules.map(module => ({
          title: module.title.trim(),
          content: module.content.trim(),
          durationHours: module.durationHours,
          deliverable: module.deliverable?.trim() || undefined
        }))
      };

      const created = await courseService.create(payload);
      setCourses(prev => [created, ...prev]);
      setCourseForm(createCourseFormState());
      setToast({ open: true, message: 'Đã tạo khóa học mới với dữ liệu thực tế' });
    } catch (error: any) {
      setToast({ open: true, message: error?.message || 'Không thể tạo khóa học' });
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleIssueCertificate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIssuingCertificate(true);
    try {
      const payload = {
        menteeEmail: certificateForm.menteeEmail.trim() || undefined,
        menteeId: certificateForm.menteeId.trim() || undefined,
        courseId: certificateForm.courseId,
        summary: certificateForm.summary.trim(),
        skills: certificateForm.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        badgeUrl: certificateForm.badgeUrl.trim() || undefined,
        evidenceUrl: certificateForm.evidenceUrl.trim() || undefined,
        issuedAt: certificateForm.issuedAt
      };

      const issued = await certificateService.issue(payload);
      setCertificates(prev => [issued, ...prev]);
      setCertificateForm(createCertificateFormState());
      setToast({ open: true, message: 'Đã cấp chứng chỉ cho mentee' });
    } catch (error: any) {
      setToast({ open: true, message: error?.message || 'Không thể cấp chứng chỉ' });
    } finally {
      setIssuingCertificate(false);
    }
  };

  if (!isMentor) {
    return (
      <div className="mentor-academy gate">
        <h1>Học viện Mentor</h1>
        <p>Chức năng tạo khóa học và cấp chứng chỉ chỉ mở cho mentor được xác thực.</p>
      </div>
    );
  }

  return (
    <div className="mentor-academy">
      <section className="academy-hero">
        <div>
          <p className="eyebrow">GrowNet Mentor Workspace</p>
          <h1>Tạo khóa học chuẩn thực tế & cấp chứng chỉ cho mentee</h1>
          <p className="lead">Thông tin được lưu trực tiếp vào MongoDB production, hiển thị cho mentee ngay khi bạn tạo.</p>
        </div>
        <div className="stats-grid">
          {stats.map(stat => (
            <article key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="academy-panels">
        <article className="panel">
          <header>
            <div>
              <p className="eyebrow">Khóa học</p>
              <h2>Nhập thông tin khóa học thực tế</h2>
            </div>
          </header>
          <form className="form-grid" onSubmit={handleCreateCourse}>
            <label>
              <span>Tiêu đề *</span>
              <input
                type="text"
                value={courseForm.title}
                onChange={event => handleCourseFormChange('title', event.target.value)}
                required
              />
            </label>
            <label>
              <span>Phụ đề</span>
              <input
                type="text"
                value={courseForm.subtitle}
                onChange={event => handleCourseFormChange('subtitle', event.target.value)}
              />
            </label>
            <label className="full">
              <span>Mô tả *</span>
              <textarea
                value={courseForm.description}
                minLength={60}
                onChange={event => handleCourseFormChange('description', event.target.value)}
                required
              />
            </label>
            <label>
              <span>Danh mục</span>
              <input value={courseForm.category} onChange={event => handleCourseFormChange('category', event.target.value)} />
            </label>
            <label>
              <span>Cấp độ</span>
              <select value={courseForm.level} onChange={event => handleCourseFormChange('level', event.target.value as CourseFormState['level'])}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label>
              <span>Hình thức</span>
              <select value={courseForm.format} onChange={event => handleCourseFormChange('format', event.target.value as CourseFormState['format'])}>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </label>
            <label>
              <span>Ngôn ngữ</span>
              <input value={courseForm.language} onChange={event => handleCourseFormChange('language', event.target.value)} />
            </label>
            <label>
              <span>Thời lượng (giờ)</span>
              <input
                type="number"
                min={1}
                value={courseForm.durationHours}
                onChange={event => handleCourseFormChange('durationHours', Number(event.target.value))}
              />
            </label>
            <label>
              <span>Số buổi</span>
              <input
                type="number"
                min={1}
                value={courseForm.sessions}
                onChange={event => handleCourseFormChange('sessions', Number(event.target.value))}
              />
            </label>
            <label>
              <span>Học phí (VND)</span>
              <input
                type="number"
                min={0}
                step={50000}
                value={courseForm.price}
                onChange={event => handleCourseFormChange('price', Number(event.target.value))}
              />
            </label>
            <label>
              <span>Link ảnh cover</span>
              <input value={courseForm.coverImage} onChange={event => handleCourseFormChange('coverImage', event.target.value)} />
            </label>
            <label>
              <span>Tags (phân tách dấu phẩy)</span>
              <input value={courseForm.tags} onChange={event => handleCourseFormChange('tags', event.target.value)} />
            </label>
            <label>
              <span>Công cụ sử dụng</span>
              <input value={courseForm.tools} onChange={event => handleCourseFormChange('tools', event.target.value)} />
            </label>
            <label>
              <span>Bắt đầu</span>
              <input type="date" value={courseForm.startDate} onChange={event => handleCourseFormChange('startDate', event.target.value)} />
            </label>
            <label>
              <span>Kết thúc</span>
              <input type="date" value={courseForm.endDate} onChange={event => handleCourseFormChange('endDate', event.target.value)} />
            </label>

            <div className="modules full">
              <div className="modules-header">
                <h3>Modules chuyên sâu</h3>
                <button type="button" onClick={addModule}>+ Thêm module</button>
              </div>
              {courseForm.modules.map((module, index) => (
                <div key={`module-${index}`} className="module-card">
                  <div className="module-grid">
                    <label>
                      <span>Tiêu đề</span>
                      <input value={module.title} onChange={event => handleModuleChange(index, 'title', event.target.value)} required />
                    </label>
                    <label>
                      <span>Thời lượng (giờ)</span>
                      <input
                        type="number"
                        min={1}
                        value={module.durationHours ?? ''}
                        onChange={event => handleModuleChange(index, 'durationHours', Number(event.target.value))}
                      />
                    </label>
                  </div>
                  <label>
                    <span>Nội dung</span>
                    <textarea value={module.content} onChange={event => handleModuleChange(index, 'content', event.target.value)} required />
                  </label>
                  <label>
                    <span>Deliverable</span>
                    <input value={module.deliverable || ''} onChange={event => handleModuleChange(index, 'deliverable', event.target.value)} />
                  </label>
                  {courseForm.modules.length > 1 && (
                    <button type="button" className="link danger" onClick={() => removeModule(index)}>
                      Xoá module
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" className="primary" disabled={submittingCourse}>
              {submittingCourse ? 'Đang lưu...' : 'Lưu khóa học'}
            </button>
          </form>
        </article>

        <article className="panel">
          <header>
            <div>
              <p className="eyebrow">Dữ liệu khóa học</p>
              <h2>Khoá học đã công bố</h2>
            </div>
          </header>
          {loading ? (
            <p>Đang tải khóa học thực tế...</p>
          ) : courses.length === 0 ? (
            <p>Chưa có khóa học nào. Hãy tạo lớp đầu tiên!</p>
          ) : (
            <ul className="course-list">
              {courses.map(course => (
                <li key={course._id}>
                  <div>
                    <h3>{course.title}</h3>
                    <p>{course.subtitle || course.category}</p>
                    <div className="course-meta">
                      <span>{course.level}</span>
                      {course.durationHours && <span>{course.durationHours}h</span>}
                      {course.startDate && (
                        <span>
                          {new Intl.DateTimeFormat('vi-VN').format(new Date(course.startDate))} →{' '}
                          {course.endDate ? new Intl.DateTimeFormat('vi-VN').format(new Date(course.endDate)) : 'Đang mở'}
                        </span>
                      )}
                    </div>
                  </div>
                  {course.price && <strong>{course.price.toLocaleString('vi-VN')} đ</strong>}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="academy-panels">
        <article className="panel">
          <header>
            <div>
              <p className="eyebrow">Chứng chỉ</p>
              <h2>Cấp chứng chỉ xác thực</h2>
            </div>
          </header>
          <form className="form-grid" onSubmit={handleIssueCertificate}>
            <label>
              <span>Email mentee *</span>
              <input
                type="email"
                value={certificateForm.menteeEmail}
                onChange={event => setCertificateForm(prev => ({ ...prev, menteeEmail: event.target.value }))}
                required={!certificateForm.menteeId}
              />
              <small>Có thể nhập menteeId nếu đã biết.</small>
            </label>
            <label>
              <span>Mentee ID</span>
              <input value={certificateForm.menteeId} onChange={event => setCertificateForm(prev => ({ ...prev, menteeId: event.target.value }))} />
            </label>
            <label>
              <span>Khóa học *</span>
              <select
                value={certificateForm.courseId}
                onChange={event => setCertificateForm(prev => ({ ...prev, courseId: event.target.value }))}
                required
              >
                <option value="">Chọn khóa học</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
            </label>
            <label className="full">
              <span>Tóm tắt thành tựu *</span>
              <textarea
                value={certificateForm.summary}
                minLength={20}
                onChange={event => setCertificateForm(prev => ({ ...prev, summary: event.target.value }))}
                required
              />
            </label>
            <label>
              <span>Kỹ năng nổi bật</span>
              <input
                value={certificateForm.skills}
                onChange={event => setCertificateForm(prev => ({ ...prev, skills: event.target.value }))}
                placeholder="Ví dụ: Product Strategy, OKR"
              />
            </label>
            <label>
              <span>Badge URL</span>
              <input value={certificateForm.badgeUrl} onChange={event => setCertificateForm(prev => ({ ...prev, badgeUrl: event.target.value }))} />
            </label>
            <label>
              <span>Tài liệu minh chứng</span>
              <input value={certificateForm.evidenceUrl} onChange={event => setCertificateForm(prev => ({ ...prev, evidenceUrl: event.target.value }))} />
            </label>
            <label>
              <span>Ngày cấp</span>
              <input type="date" value={certificateForm.issuedAt} onChange={event => setCertificateForm(prev => ({ ...prev, issuedAt: event.target.value }))} />
            </label>
            <button type="submit" className="primary" disabled={issuingCertificate}>
              {issuingCertificate ? 'Đang cấp...' : 'Cấp chứng chỉ'}
            </button>
          </form>
        </article>

        <article className="panel">
          <header>
            <div>
              <p className="eyebrow">Chứng chỉ đã phát hành</p>
              <h2>Lưu trữ minh bạch</h2>
            </div>
          </header>
          {certificateLoading ? (
            <p>Đang tải chứng chỉ đã cấp...</p>
          ) : certificates.length === 0 ? (
            <p>Chưa có chứng chỉ nào. Hãy cấp chứng chỉ đầu tiên!</p>
          ) : (
            <ul className="certificate-list">
              {certificates.map(cert => (
                <li key={cert._id}>
                  <div>
                    <h3>{cert.menteeId.fullName}</h3>
                    <p>{cert.courseId.title}</p>
                    <small>Mã: {cert.credentialId}</small>
                  </div>
                  <div className="certificate-meta">
                    <span>{new Intl.DateTimeFormat('vi-VN').format(new Date(cert.issuedAt))}</span>
                    <span>{cert.skills.slice(0, 3).join(', ')}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <Toast open={toast.open} message={toast.message} onOpenChange={open => setToast(prev => ({ ...prev, open }))} />
    </div>
  );
}
