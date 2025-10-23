import React, { useState } from 'react'
import '../styles/FilterModal.css'

interface FilterModalProps {
  onClose: () => void
}

export default function FilterModal({ onClose }: FilterModalProps) {
  const [role, setRole] = useState('Mentor')
  const [fields, setFields] = useState<string[]>(['Công Nghệ'])
  const [skills, setSkills] = useState<string[]>(['Project Management'])
  const [locations, setLocations] = useState<string[]>(['TP. Hồ Chí Minh'])

  const toggleItem = (item: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item))
    } else {
      setter([...list, item])
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Bộ lọc nâng cao</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="filter-section">
            <h3>Vai trò</h3>
            <div className="button-group">
              <button 
                className={role === 'Mentor' ? 'active' : ''}
                onClick={() => setRole('Mentor')}
              >
                Mentor
              </button>
              <button 
                className={role === 'Mentee' ? 'active' : ''}
                onClick={() => setRole('Mentee')}
              >
                Mentee
              </button>
            </div>
          </div>

          <div className="filter-section">
            <h3>Lĩnh vực</h3>
            <div className="button-group multi">
              {['Công Nghệ', 'Thiết kế', 'Kinh doanh', 'Marketing', 'Dữ liệu'].map(field => (
                <button 
                  key={field}
                  className={fields.includes(field) ? 'active' : ''}
                  onClick={() => toggleItem(field, fields, setFields)}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Kỹ năng</h3>
            <div className="button-group multi">
              {['JavaScript', 'Python', 'UX/UI', 'Project Management', 'Public Speaking'].map(skill => (
                <button 
                  key={skill}
                  className={skills.includes(skill) ? 'active' : ''}
                  onClick={() => toggleItem(skill, skills, setSkills)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Khu vực</h3>
            <div className="button-group multi">
              {['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Online'].map(location => (
                <button 
                  key={location}
                  className={locations.includes(location) ? 'active' : ''}
                  onClick={() => toggleItem(location, locations, setLocations)}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-apply" onClick={onClose}>
            Áp dụng bộ lọc
          </button>
        </div>
      </div>
    </div>
  )
}
