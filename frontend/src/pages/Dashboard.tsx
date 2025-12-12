import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ProfileCard from '../components/ProfileCard'
import Calendar from '../components/Calendar'
import FilterModal from '../components/FilterModal'
import Toast from '../components/Toast'
import { userService, connectionService, chatService } from '../services'
import type { User } from '../services'
import '../styles/Dashboard.css'

interface FilterState {
  fields: string[]
  location: string
  experienceYears: number
}

export default function Dashboard() {
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)
  const [processingDecision, setProcessingDecision] = useState(false)
  const [toastState, setToastState] = useState({ open: false, message: '' })
  const [filters, setFilters] = useState<FilterState>({ fields: [], location: '', experienceYears: 0 })

  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true)
    setSuggestionError(null)
    try {
      let suggestions: User[]
      if (filters.fields.length || (filters.location && filters.location !== 'Khác')) {
        const { users } = await userService.filterUsers({
          interests: filters.fields,
          location: filters.location && filters.location !== 'Khác' ? filters.location : undefined
        })
        suggestions = users
      } else {
        suggestions = await userService.getSuggestedUsers()
      }

      let filtered = suggestions

      if (filters.location) {
        const norm = filters.location.toLowerCase()
        if (norm === 'khác') {
          filtered = filtered.filter(user => {
            const city = user.location?.city?.toLowerCase() || ''
            return !city || (city !== 'tp hcm' && city !== 'hà nội')
          })
        } else {
          filtered = filtered.filter(user => user.location?.city?.toLowerCase() === norm)
        }
      }

      if (filters.fields.length) {
        filtered = filtered.filter(user => {
          const tags = (user.fields && user.fields.length > 0
            ? user.fields
            : user.interests) || []
          return filters.fields.some(field => tags.includes(field))
        })
      }

      if (filters.experienceYears > 0) {
        filtered = filtered.filter(user => (user.experienceYears ?? 0) >= filters.experienceYears)
      }

      setSuggestedUsers(filtered)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Không thể tải danh sách gợi ý'
      setSuggestionError(message)
    } finally {
      setLoadingSuggestions(false)
    }
  }, [filters])

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
        await connectionService.sendRequest(profile._id)
        await chatService.getOrCreateChat(profile._id)
        showToast(`Đã gửi lời mời kết nối tới ${profile.fullName || profile.username}`)
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
  }, [processingDecision, showToast])

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <Sidebar
          onOpenFilter={() => setShowFilterModal(true)}
          selectedFields={filters.fields}
          selectedLocation={filters.location}
          experienceYears={filters.experienceYears}
          onToggleField={handleToggleField}
          onSelectLocation={handleSelectLocation}
          onExperienceChange={handleExperienceChange}
        />

        <main className="main-content">
          {loadingSuggestions && (
            <div className="profile-card loading">
              <p>Đang tải các mentor/mentee gợi ý...</p>
            </div>
          )}

          {!loadingSuggestions && suggestionError && (
            <div className="profile-card loading">
              <p>{suggestionError}</p>
              <button type="button" className="btn-read-more" onClick={fetchSuggestions}>Thử lại</button>
            </div>
          )}

          {!loadingSuggestions && !suggestionError && currentProfile && (
            <ProfileCard
              profile={currentProfile}
              onSwipe={handleSwipeDecision}
              disabled={processingDecision}
            />
          )}

          {!loadingSuggestions && !suggestionError && !currentProfile && (
            <div className="profile-card loading">
              <p>Đã hết gợi ý phù hợp. Hãy điều chỉnh bộ lọc hoặc thử lại sau.</p>
              <button type="button" className="btn-read-more" onClick={fetchSuggestions}>Tải lại danh sách</button>
            </div>
          )}
        </main>

        <aside className="right-sidebar">
          <Calendar />
        </aside>
      </div>

      {showFilterModal && (
        <FilterModal onClose={() => setShowFilterModal(false)} />
      )}

      <Toast
        open={toastState.open}
        message={toastState.message}
        onOpenChange={(open) => setToastState(prev => ({ ...prev, open }))}
      />
    </div>
  )
}
