import React from 'react'
import '../styles/Sidebar.css'
import { Icon } from './ui/Icon'

const FIELD_GROUPS = [
  {
    title: 'Sản phẩm & Thiết kế',
    options: ['Product Design', 'UX/UI', 'Branding', 'Content Design', 'Motion', 'Illustration']
  },
  {
    title: 'Công nghệ',
    options: ['TypeScript', 'ReactJS', 'Node.js', 'DevOps', 'Data Science', 'AI/ML']
  },
  {
    title: 'Kinh doanh & Marketing',
    options: ['Growth', 'Marketing', 'Product Ops', 'Sales', 'Customer Success', 'Strategy']
  }
]

const LOCATION_OPTIONS = [
  { label: 'TP HCM', value: 'TP HCM' },
  { label: 'Hà Nội', value: 'Hà Nội' },
  { label: 'Đà Nẵng', value: 'Đà Nẵng' },
  { label: 'Cần Thơ', value: 'Cần Thơ' },
  { label: 'Hải Phòng', value: 'Hải Phòng' },
  { label: 'Singapore', value: 'Singapore' },
  { label: 'Remote', value: 'Remote' },
  { label: 'Khác...', value: 'Khác' }
]

const EXPERIENCE_MARKS = [0, 2, 5, 8, 10, 15, 20]
const MAX_EXPERIENCE = EXPERIENCE_MARKS[EXPERIENCE_MARKS.length - 1]

const describeExperience = (value: number) => {
  if (value <= 0) return 'Chưa yêu cầu kinh nghiệm cụ thể'
  if (value < 3) return `Từ ${value}+ năm (Junior trở lên)`
  if (value < 8) return `Từ ${value}+ năm (Mid-level trở lên)`
  return `Từ ${value}+ năm (Senior / Lead)`
}

interface SidebarProps {
  onOpenFilter: () => void
  selectedFields: string[]
  selectedLocation: string
  experienceYears: number
  onToggleField: (field: string) => void
  onSelectLocation: (location: string) => void
  onExperienceChange: (value: number) => void
}

export default function Sidebar({
  onOpenFilter,
  selectedFields,
  selectedLocation,
  experienceYears,
  onToggleField,
  onSelectLocation,
  onExperienceChange
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="section-header">
          <h3>Bộ lọc nhanh</h3>
          <button className="filter-icon" onClick={onOpenFilter} aria-label="Bộ lọc">
            <Icon name="settings" size="md" aria-hidden />
          </button>
        </div>

        <div className="filter-group">
          <h4>Lĩnh vực</h4>
          <div className="field-groups">
            {FIELD_GROUPS.map(group => (
              <div key={group.title} className="field-group">
                <p className="field-group__title">{group.title}</p>
                <div className="tag-list">
                  {group.options.map(tag => {
                    const active = selectedFields.includes(tag)
                    return (
                      <button
                        type="button"
                        key={tag}
                        className={`tag ${active ? 'active' : ''}`}
                        aria-pressed={active}
                        onClick={() => onToggleField(tag)}
                      >
                        {tag}
                      </button>
                    )}
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h4>Khu vực</h4>
          <div className="location-grid">
            {LOCATION_OPTIONS.map(option => {
              const active = selectedLocation === option.value
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`location-option ${active ? 'active' : ''}`}
                  onClick={() => onSelectLocation(option.value)}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          <p className="location-hint">Ưu tiên những mentor cùng khu vực để dễ gặp mặt, hoặc chọn "Remote" nếu bạn muốn học hoàn toàn online.</p>
        </div>
        <div className="filter-group">
          <h4>Kinh nghiệm (Năm)</h4>
          <input
            type="range"
            min="0"
            max={MAX_EXPERIENCE}
            step="1"
            value={Math.min(experienceYears, MAX_EXPERIENCE)}
            onChange={(e) => onExperienceChange(Number(e.target.value))}
            className="experience-slider"
          />
          <div className="experience-scale">
            {EXPERIENCE_MARKS.map(mark => (
              <span key={mark} className="experience-mark">
                <span className={`dot ${experienceYears >= mark ? 'is-active' : ''}`} />
                <small>{mark}+</small>
              </span>
            ))}
          </div>
          <span className="experience-value">{describeExperience(experienceYears)}</span>
        </div>
        <div className="filter-group">
          <h4>Trạng thái</h4>
          <button className="status-btn active">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              Đang hoạt động
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}
