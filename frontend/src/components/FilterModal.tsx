import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/FilterModal.css'

export interface AdvancedFilterValues {
  role: '' | 'mentor' | 'mentee'
  fields: string[]
  skills: string[]
  locations: string[]
}

interface FilterModalProps {
  onClose: () => void
  onApply?: (filters: AdvancedFilterValues) => void
  initialValues?: AdvancedFilterValues
}

const ROLE_OPTIONS = [
  { label: 'Mentor', value: 'mentor' },
  { label: 'Mentee', value: 'mentee' }
]

const FIELD_OPTIONS = ['Công Nghệ', 'Thiết kế', 'Kinh doanh', 'Marketing', 'Dữ liệu']
const SKILL_OPTIONS = ['JavaScript', 'Python', 'UX/UI', 'Project Management', 'Public Speaking']
const LOCATION_OPTIONS = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Online']

export default function FilterModal({ onClose, onApply, initialValues }: FilterModalProps) {
  const [role, setRole] = useState<AdvancedFilterValues['role']>(initialValues?.role ?? '')
  const [fields, setFields] = useState<string[]>(initialValues?.fields ?? [])
  const [skills, setSkills] = useState<string[]>(initialValues?.skills ?? [])
  const [locations, setLocations] = useState<string[]>(initialValues?.locations ?? [])

  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setRole(initialValues?.role ?? '')
    setFields(initialValues?.fields ?? [])
    setSkills(initialValues?.skills ?? [])
    setLocations(initialValues?.locations ?? [])
  }, [initialValues])

  const toggleItem = (item: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(item)) setter(list.filter(i => i !== item))
    else setter([...list, item])
  }

  const handleApply = () => {
    onApply?.({ role, fields, skills, locations })
    onClose()
  }

  const handleReset = () => {
    setRole('')
    setFields([])
    setSkills([])
    setLocations([])
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
                {ROLE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={role === option.value ? 'active' : ''}
                    aria-pressed={role === option.value}
                    onClick={() => setRole(prev => (prev === option.value ? '' : option.value) as '' | 'mentor' | 'mentee')}
                  >{option.label}</button>
                ))}
                <button
                  type="button"
                  className={!role ? 'ghost active' : 'ghost'}
                  onClick={() => setRole('')}
                >Không giới hạn</button>
              </div>
            </div>

            <div className="filter-section">
              <h3>Lĩnh vực</h3>
              <div className="button-group multi" role="group" aria-label="Chọn lĩnh vực">
                {FIELD_OPTIONS.map(field => (
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
                {SKILL_OPTIONS.map(skill => (
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
                {LOCATION_OPTIONS.map(location => (
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
            <button type="button" className="btn-reset" onClick={handleReset}>Đặt lại</button>
            <button type="button" className="btn-apply" onClick={handleApply}>Áp dụng bộ lọc</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
