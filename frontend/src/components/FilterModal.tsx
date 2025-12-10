import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/FilterModal.css'

interface FilterModalProps {
  onClose: () => void
  onApply?: (filters: { role: string; fields: string[]; skills: string[]; locations: string[] }) => void
}

export default function FilterModal({ onClose, onApply }: FilterModalProps) {
  const [role, setRole] = useState('Mentor')
  const [fields, setFields] = useState<string[]>(['Công Nghệ'])
  const [skills, setSkills] = useState<string[]>(['Project Management'])
  const [locations, setLocations] = useState<string[]>(['TP. Hồ Chí Minh'])

  const dialogRef = useRef<HTMLDivElement | null>(null)

  const toggleItem = (item: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(item)) setter(list.filter(i => i !== item))
    else setter([...list, item])
  }

  const handleApply = () => {
    onApply?.({ role, fields, skills, locations })
    onClose()
  }

  // Close on Escape & simple initial focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    // focus first button
    const firstBtn = dialogRef.current?.querySelector('button') as HTMLButtonElement | null
    firstBtn?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-modal-title"
          onClick={(e) => e.stopPropagation()}
          ref={dialogRef}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <div className="modal-header">
            <h2 id="filter-modal-title">Bộ lọc nâng cao</h2>
            <button type="button" className="modal-close" aria-label="Đóng" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body">
            <div className="filter-section">
              <h3>Vai trò</h3>
              <div className="button-group" role="group" aria-label="Chọn vai trò">
                <button
                  type="button"
                  className={role === 'Mentor' ? 'active' : ''}
                  aria-pressed={role === 'Mentor'}
                  onClick={() => setRole('Mentor')}
                >Mentor</button>
                <button
                  type="button"
                  className={role === 'Mentee' ? 'active' : ''}
                  aria-pressed={role === 'Mentee'}
                  onClick={() => setRole('Mentee')}
                >Mentee</button>
              </div>
            </div>

            <div className="filter-section">
              <h3>Lĩnh vực</h3>
              <div className="button-group multi" role="group" aria-label="Chọn lĩnh vực">
                {['Công Nghệ', 'Thiết kế', 'Kinh doanh', 'Marketing', 'Dữ liệu'].map(field => (
                  <button
                    key={field}
                    type="button"
                    className={fields.includes(field) ? 'active' : ''}
                    aria-pressed={fields.includes(field)}
                    onClick={() => toggleItem(field, fields, setFields)}
                  >{field}</button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Kỹ năng</h3>
              <div className="button-group multi" role="group" aria-label="Chọn kỹ năng">
                {['JavaScript', 'Python', 'UX/UI', 'Project Management', 'Public Speaking'].map(skill => (
                  <button
                    key={skill}
                    type="button"
                    className={skills.includes(skill) ? 'active' : ''}
                    aria-pressed={skills.includes(skill)}
                    onClick={() => toggleItem(skill, skills, setSkills)}
                  >{skill}</button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Khu vực</h3>
              <div className="button-group multi" role="group" aria-label="Chọn khu vực">
                {['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Online'].map(location => (
                  <button
                    key={location}
                    type="button"
                    className={locations.includes(location) ? 'active' : ''}
                    aria-pressed={locations.includes(location)}
                    onClick={() => toggleItem(location, locations, setLocations)}
                  >{location}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-apply" onClick={handleApply}>Áp dụng bộ lọc</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
