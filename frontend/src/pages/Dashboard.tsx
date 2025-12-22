import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ProfileCard from '../components/ProfileCard'
import Calendar from '../components/Calendar'
import FilterModal, { type AdvancedFilterValues } from '../components/FilterModal'
import Toast from '../components/Toast'
import { userService, connectionService } from '../services'
import type { User } from '../services'
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Dashboard.css'

interface FilterState {
  fields: string[]
  location: string
  experienceYears: number
}

interface AdvancedFilterState extends AdvancedFilterValues {}

const normalizeText = (value?: string) => (
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
)

const LOCATION_ALIASES: Record<string, string[]> = {
  'tp hcm': ['tp hcm', 'ho chi minh', 'hochiminh', 'sai gon', 'saigon'],
  'ha noi': ['ha noi', 'hanoi'],
  'da nang': ['da nang', 'danang'],
  'can tho': ['can tho', 'cantho'],
  'hai phong': ['hai phong', 'haiphong'],
  remote: ['remote', 'online'],
  singapore: ['singapore']
}

const PRIORITY_LOCATIONS = new Set(
  Object.values(LOCATION_ALIASES).reduce<string[]>((acc, list) => acc.concat(list), [])
)

const matchesLocation = (user: User, target: string) => {
  const city = normalizeText(user.location?.city)
  const country = normalizeText(user.location?.country)

  if (target === 'khac') {
    if (!city) return true
    return !PRIORITY_LOCATIONS.has(city)
  }

  const aliases = LOCATION_ALIASES[target]
  if (aliases) {
    if (target === 'remote' || target === 'singapore') {
      return aliases.includes(city) || aliases.includes(country)
    }
    return aliases.includes(city)
  }

  return city === target
}

const userMatchesSearch = (user: User, query: string) => {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return true

  const haystacks = [
    normalizeText(user.fullName),
    normalizeText(user.username),
    normalizeText(user.bio)
  ]

  const collections = [user.skills, user.fields, user.interests]
  collections.forEach(list => {
    if (list && Array.isArray(list)) {
      list.forEach(item => haystacks.push(normalizeText(item)))
    }
  })

  return haystacks.some(value => value && value.includes(normalizedQuery))
}

export default function Dashboard() {
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)
  const [processingDecision, setProcessingDecision] = useState(false)
  const [toastState, setToastState] = useState({ open: false, message: '' })
  const [filters, setFilters] = useState<FilterState>({ fields: [], location: '', experienceYears: 0 })
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>({ role: '', fields: [], skills: [], locations: [] })
  const [searchTerm, setSearchTerm] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const navigate = useNavigate()
  const routerLocation = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search)
    setSearchTerm(params.get('search') || '')
  }, [routerLocation.search])

  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true)
    setSuggestionError(null)
    try {
      const combinedFields = Array.from(new Set([...filters.fields, ...advancedFilters.fields]))
      const locationTargets = new Set<string>()
      if (filters.location) {
        locationTargets.add(normalizeText(filters.location))
      }
      advancedFilters.locations.forEach(loc => {
        if (loc) {
          locationTargets.add(normalizeText(loc))
        }
      })

      let suggestions: User[]
      const shouldQuery = combinedFields.length || (filters.location && filters.location !== 'Khác') || searchTerm
      if (shouldQuery) {
        const { users } = await userService.filterUsers({
          q: searchTerm || undefined,
          interests: combinedFields.length ? combinedFields : undefined,
          location: filters.location && filters.location !== 'Khác' && !advancedFilters.locations.length ? filters.location : undefined
        })
        suggestions = users
      } else {
        suggestions = await userService.getSuggestedUsers()
      }

      let filtered = suggestions

      if (locationTargets.size) {
        filtered = filtered.filter(user => {
          return Array.from(locationTargets).some(target => matchesLocation(user, target))
        })
      }

      if (combinedFields.length) {
        filtered = filtered.filter(user => {
          const tags = (user.fields && user.fields.length > 0
            ? user.fields
            : user.interests) || []
          return combinedFields.some(field => tags.includes(field))
        })
      }

      if (advancedFilters.role) {
        filtered = filtered.filter(user => user.role?.toLowerCase() === advancedFilters.role)
      }

      if (advancedFilters.skills.length) {
        filtered = filtered.filter(user => {
          const skillSet = new Set((user.skills || []).map(item => item.toLowerCase()))
          return advancedFilters.skills.some(skill => skillSet.has(skill.toLowerCase()))
        })
      }

      if (filters.experienceYears > 0) {
        filtered = filtered.filter(user => (user.experienceYears ?? 0) >= filters.experienceYears)
      }

      if (searchTerm) {
        filtered = filtered.filter(user => userMatchesSearch(user, searchTerm))
      }

      setSuggestedUsers(filtered)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Không thể tải danh sách gợi ý'
      setSuggestionError(message)
    } finally {
      setLoadingSuggestions(false)
    }
  }, [filters, advancedFilters, searchTerm])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  const currentProfile = useMemo(() => suggestedUsers[0] ?? null, [suggestedUsers])

  const showToast = useCallback((message: string) => {
    setToastState({ open: true, message })
  }, [])

  const handleToggleField = useCallback((field: string) => {
    setFilters(prev => {
      const exists = prev.fields.includes(field)
      const nextFields = exists ? prev.fields.filter(item => item !== field) : [...prev.fields, field]
      return { ...prev, fields: nextFields }
    })
  }, [])

  const handleSelectLocation = useCallback((location: string) => {
    setFilters(prev => ({
      ...prev,
      location: prev.location === location ? '' : location
    }))
  }, [])

  const handleExperienceChange = useCallback((value: number) => {
    setFilters(prev => ({ ...prev, experienceYears: value }))
  }, [])

  const handleSwipeDecision = useCallback(async (direction: 'left' | 'right', profile: User) => {
    if (processingDecision) return

    if (direction === 'right') {
      setProcessingDecision(true)
      try {
        const result = await connectionService.sendRequest(profile._id)
        const displayName = profile.fullName || profile.username || 'thành viên'

        if (result.matched && result.chat) {
          showToast(`Bạn và ${displayName} đã match! Mở chat ngay.`)
          navigate('/chat', { state: { chatId: result.chat._id } })
        } else {
          showToast(`Đã gửi lời mời kết nối tới ${displayName}`)
        }

        setSuggestedUsers(prev => prev.slice(1))
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Không thể gửi lời mời kết nối'
        showToast(message)
      } finally {
        setProcessingDecision(false)
      }
      return
    }

    setSuggestedUsers(prev => prev.slice(1))
  }, [processingDecision, showToast, navigate])

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <div className={`mobile-drawer ${isSidebarOpen ? 'open' : ''}`}>
          <div className="drawer-overlay" onClick={() => setIsSidebarOpen(false)} />
          <Sidebar
            onOpenFilter={() => setShowFilterModal(true)}
            selectedFields={filters.fields}
            selectedLocation={filters.location}
            experienceYears={filters.experienceYears}
            onToggleField={handleToggleField}
            onSelectLocation={handleSelectLocation}
            onExperienceChange={handleExperienceChange}
          />
        </div>
        <main className="main-content">
          <div className="mobile-action-bar">
            <button className="btn-mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
              <span>🔍 Bộ lọc</span>
            </button>
            <button className="btn-mobile-toggle" onClick={() => setIsCalendarOpen(true)}>
              <span>📅 Lịch trình</span>
            </button>
          </div>
          {loadingSuggestions ? (
            <div className="profile-card loading">
              <p>Đang tải các mentor/mentee gợi ý...</p>
            </div>
          ): suggestionError ? (
          <div className="profile-card loading">
            <p>{suggestionError}</p>
            <button type="button" className="btn-read-more" onClick={fetchSuggestions}>Thử lại</button>
          </div>
        ) : currentProfile ? (
          <ProfileCard
            profile={currentProfile}
            onSwipe={handleSwipeDecision}
            disabled={processingDecision}
          />
        ) : (
          <div className="profile-card loading">
            <p>Đã hết gợi ý phù hợp. Hãy điều chỉnh bộ lọc hoặc thử lại sau.</p>
            <button type="button" className="btn-read-more" onClick={fetchSuggestions}>Tải lại danh sách</button>
          </div>
        )}
      </main>
      <aside className="right-sidebar desktop-only">
        <Calendar />
      </aside>
      </div>

      <AnimatePresence>
      {isCalendarOpen && (
        <div className="mobile-bottom-sheet-wrapper">
          {/* Overlay có hiệu ứng mờ dần */}
          <motion.div 
            className="sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCalendarOpen(false)}
          />
          
          <motion.div 
            className="sheet-content"
            initial={{ y: "100%" }} // Bắt đầu từ dưới cùng
            animate={{ y: 0 }}      // Trượt lên
            exit={{ y: "100%" }}    // Trượt xuống khi đóng
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"                // Chỉ cho phép kéo theo chiều dọc
            dragConstraints={{ top: 0 }} // Không cho kéo lên quá cao
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              // Nếu vận tốc kéo nhanh hoặc quãng đường kéo xuống > 100px thì đóng sheet
              if (info.offset.y > 100 || info.velocity.y > 500) {
                setIsCalendarOpen(false);
              }
            }}
          >
            <div className="sheet-handle-container">
              <div className="sheet-handle" />
            </div>
            <div className="sheet-inner-content">
               <Calendar />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          initialValues={advancedFilters}
          onApply={(values) => setAdvancedFilters(values)}
        />
      )}

      <Toast
        open={toastState.open}
        message={toastState.message}
        onOpenChange={(open) => setToastState(prev => ({ ...prev, open }))}
      />
    </div>
  )
}
