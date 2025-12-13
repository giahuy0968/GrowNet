import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  postService,
  connectionService,
  userService,
  type Post,
  type PaginationMeta,
  type User
} from '../services'
import '../styles/Social.css'

interface CommentDraftMap {
  [postId: string]: string
}

type ConnectState = 'idle' | 'pending' | 'sent'

const isUserObject = (value: User | string | null | undefined): value is User => Boolean(value && typeof value !== 'string')

const formatRelativeTime = (value: string) => {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ngày trước`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} tháng trước`
  const years = Math.floor(months / 12)
  return `${years} năm trước`
}

export default function Social() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator'
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | undefined>()
  const [page, setPage] = useState(1)
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [composerContent, setComposerContent] = useState('')
  const [composerImages, setComposerImages] = useState<string[]>([])
  const [imageDraft, setImageDraft] = useState('')
  const [creatingPost, setCreatingPost] = useState(false)
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [connectStatus, setConnectStatus] = useState<Record<string, ConnectState>>({})
  const [commentDrafts, setCommentDrafts] = useState<CommentDraftMap>({})
  const [toast, setToast] = useState<string | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [deletingComment, setDeletingComment] = useState<{ postId: string; commentId: string } | null>(null)
  const [moderationQuery, setModerationQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'mentor' | 'mentee'>('all')
  const [mediaOnly, setMediaOnly] = useState(false)

  const heroCopy = user?.role === 'mentor'
    ? 'Kể lại trải nghiệm mentoring gần nhất hoặc gửi lời động viên đến mentee của bạn.'
    : 'Chia sẻ cảm nghĩ sau buổi học, lan tỏa câu chuyện phát triển bản thân cùng cộng đồng GrowNet.'

  useEffect(() => {
    void loadPosts()
    void loadSuggestions()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(timer)
  }, [toast])

  const loadPosts = async (targetPage = 1, append = false) => {
    append ? setLoadingMore(true) : setLoadingPosts(true)
    try {
      const { posts: result, pagination: meta } = await postService.getAllPosts(targetPage, 6)
      setPagination(meta)
      setPage(targetPage)
      setPosts(prev => append ? [...prev, ...result] : result)
    } catch (error) {
      console.error('Không thể tải bài viết', error)
      setToast('Không thể tải bài viết, thử lại sau nhé.')
    } finally {
      append ? setLoadingMore(false) : setLoadingPosts(false)
    }
  }

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true)
      const result = await userService.getSuggestedUsers()
      setSuggestions(result.slice(0, 6))
    } catch (error) {
      console.error('Không thể tải gợi ý kết nối', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleAddImage = () => {
    const url = imageDraft.trim()
    if (!url) return
    setComposerImages(prev => prev.includes(url) ? prev : [...prev, url])
    setImageDraft('')
  }

  const handleRemoveImage = (url: string) => {
    setComposerImages(prev => prev.filter(item => item !== url))
  }

  const handleCreatePost = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!composerContent.trim()) return
    setCreatingPost(true)
    try {
      const payload = {
        content: composerContent.trim(),
        images: composerImages.length ? composerImages : undefined
      }
      const created = await postService.createPost(payload)
      setPosts(prev => [created, ...prev])
      setComposerContent('')
      setComposerImages([])
      setToast('Đã đăng bài chia sẻ của bạn!')
    } catch (error) {
      console.error('Không thể đăng bài', error)
      setToast('Đăng bài thất bại, thử lại sau nhé.')
    } finally {
      setCreatingPost(false)
    }
  }

  const handleToggleLike = async (postId: string) => {
    if (!user?._id) return
    setPosts(prev => prev.map(post => {
      if (post._id !== postId) return post
      const liked = post.likes.includes(user._id as string)
      const likes = liked ? post.likes.filter(id => id !== user._id) : [...post.likes, user._id]
      return { ...post, likes }
    }))
    try {
      await postService.toggleLike(postId)
    } catch (error) {
      console.error('Không thể cập nhật lượt thích', error)
      setToast('Không thể cập nhật lượt thích')
      void loadPosts(page)
    }
  }

  const handleCommentDraft = (postId: string, value: string) => {
    setCommentDrafts(prev => ({ ...prev, [postId]: value }))
  }

  const handleSubmitComment = async (postId: string) => {
    const content = commentDrafts[postId]?.trim()
    if (!content) return
    try {
      const updated = await postService.addComment(postId, content)
      setPosts(prev => prev.map(post => (post._id === postId ? updated : post)))
      setCommentDrafts(prev => ({ ...prev, [postId]: '' }))
    } catch (error) {
      console.error('Không thể gửi bình luận', error)
      setToast('Không thể gửi bình luận, thử lại nhé.')
    }
  }

  const handleConnect = async (targetId: string) => {
    setConnectStatus(prev => ({ ...prev, [targetId]: 'pending' }))
    try {
      const result = await connectionService.sendRequest(targetId)
      setConnectStatus(prev => ({ ...prev, [targetId]: 'sent' }))

      if (result.matched && result.chat?._id) {
        setToast('Hai bạn đã match! Mở chat ngay nhé.')
        navigate('/chat', { state: { chatId: result.chat._id } })
        return
      }

      setToast('Đã gửi lời mời kết nối')
    } catch (error) {
      console.error('Không thể gửi lời mời', error)
      setConnectStatus(prev => ({ ...prev, [targetId]: 'idle' }))
      setToast('Không thể gửi lời mời kết nối')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!isAdmin && !posts.find(post => post._id === postId && isUserObject(post.authorId) && post.authorId._id === user?._id)) {
      return
    }
    if (typeof window !== 'undefined' && !window.confirm('Xoá bài viết này?')) {
      return
    }
    setDeletingPostId(postId)
    try {
      await postService.deletePost(postId)
      setPosts(prev => prev.filter(post => post._id !== postId))
      setToast('Đã xoá bài viết')
    } catch (error) {
      console.error('Không thể xoá bài viết', error)
      setToast('Không thể xoá bài viết, thử lại')
    } finally {
      setDeletingPostId(null)
    }
  }

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!isAdmin) return
    setDeletingComment({ postId, commentId })
    try {
      await postService.deleteComment(postId, commentId)
      setPosts(prev => prev.map(post => {
        if (post._id !== postId) return post
        return { ...post, comments: post.comments.filter(comment => comment._id !== commentId) }
      }))
      setToast('Đã xoá bình luận vi phạm')
    } catch (error) {
      console.error('Không thể xoá bình luận', error)
      setToast('Không thể xoá bình luận, thử lại')
    } finally {
      setDeletingComment(null)
    }
  }

  const canLoadMore = useMemo(() => {
    if (!pagination) return false
    if (!pagination.pages) return false
    return page < pagination.pages
  }, [page, pagination])

  const communityStats = useMemo(() => {
    const voices = new Set(posts.map(post => (isUserObject(post.authorId) ? post.authorId._id : post.authorId))).size
    const engagement = posts.reduce((sum, post) => sum + post.likes.length + post.comments.length, 0)
    const imageStories = posts.filter(post => (post.images?.length ?? 0) > 0).length
    return [
      { label: 'Tiếng nói tích cực', value: voices || '—' },
      { label: 'Tương tác mới', value: engagement || '—' },
      { label: 'Khoảnh khắc có ảnh', value: imageStories || '—' }
    ]
  }, [posts])

  const displayPosts = useMemo(() => {
    if (!isAdmin) return posts
    return posts.filter(post => {
      const matchesQuery = moderationQuery
        ? post.content.toLowerCase().includes(moderationQuery.toLowerCase())
        : true
      const authorRole = isUserObject(post.authorId) ? post.authorId.role : undefined
      const matchesRole = roleFilter === 'all' ? true : authorRole === roleFilter
      const matchesMedia = mediaOnly ? (post.images?.length ?? 0) > 0 : true
      return matchesQuery && matchesRole && matchesMedia
    })
  }, [isAdmin, posts, moderationQuery, roleFilter, mediaOnly])

  const moderationActive = isAdmin && (Boolean(moderationQuery.trim()) || roleFilter !== 'all' || mediaOnly)

  return (
    <div className="social-page">
      {toast && <div className="social-toast">{toast}</div>}

      <section className="social-hero">
        <div className="social-hero__content">
          <p className="hero-tagline">GrowNet Social Space</p>
          <h1>Cộng đồng mentee & mentor sau khi match</h1>
          <p>{heroCopy}</p>
        </div>
        <div className="social-hero__stats">
          {communityStats.map(stat => (
            <article key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <div className="social-grid">
        <div className="social-feed">
          {isAdmin && (
            <section className="moderation-controls" aria-label="Bộ lọc quản trị bài viết">
              <div className="moderation-row">
                <input
                  type="search"
                  placeholder="Từ khoá nội dung hoặc tên tác giả"
                  value={moderationQuery}
                  onChange={event => setModerationQuery(event.target.value)}
                />
                <select value={roleFilter} onChange={event => setRoleFilter(event.target.value as typeof roleFilter)}>
                  <option value="all">Tất cả vai trò</option>
                  <option value="mentor">Mentor</option>
                  <option value="mentee">Mentee</option>
                </select>
              </div>
              <label className="moderation-toggle">
                <input type="checkbox" checked={mediaOnly} onChange={event => setMediaOnly(event.target.checked)} />
                Chỉ hiện bài có ảnh đính kèm
              </label>
            </section>
          )}

          <article className="composer-card">
            <header>
              <div>
                <p>Đăng bài chia sẻ</p>
                <span>Chỉ mentee & mentor đã match mới thấy bài viết của nhau</span>
              </div>
            </header>
            <form onSubmit={handleCreatePost}>
              <textarea
                placeholder="Hôm nay bạn học được điều gì?"
                value={composerContent}
                onChange={event => setComposerContent(event.target.value)}
                maxLength={800}
              />
              {composerImages.length > 0 && (
                <div className="composer-attachments">
                  {composerImages.map(url => (
                    <div key={url} className="attachment-pill">
                      <span>{url}</span>
                      <button type="button" aria-label="Xoá hình" onClick={() => handleRemoveImage(url)}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="composer-actions">
                <div className="composer-add-media">
                  <input
                    type="url"
                    placeholder="Dán link ảnh (tuỳ chọn)"
                    value={imageDraft}
                    onChange={event => setImageDraft(event.target.value)}
                  />
                  <button type="button" onClick={handleAddImage} disabled={!imageDraft.trim()}>Thêm ảnh</button>
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!composerContent.trim() || creatingPost}
                >
                  {creatingPost ? 'Đang đăng...' : 'Chia sẻ ngay'}
                </button>
              </div>
            </form>
          </article>

          {loadingPosts ? (
            <div className="feed-placeholder">Đang tải bài viết...</div>
          ) : displayPosts.length === 0 ? (
            <div className="feed-empty">
              {moderationActive ? 'Không có bài viết khớp tiêu chí quản trị hiện tại.' : 'Hãy là người đầu tiên mở lời cho cộng đồng hôm nay.'}
            </div>
          ) : (
            displayPosts.map(post => {
              const author = isUserObject(post.authorId) ? post.authorId : null
              const authorName = author?.fullName || author?.username || 'Thành viên GrowNet'
              const location = author?.location
                ? [author.location.city, author.location.country].filter(Boolean).join(', ')
                : 'Kết nối toàn quốc'
              const canDeletePost = isAdmin || (author?._id && user?._id && author._id === user._id)
              return (
                <article key={post._id} className="post-card">
                  <header className="post-card__header">
                    <div className="author-meta">
                      <img src={author?.avatar || '/user_avt.png'} alt={authorName} />
                      <div>
                        <strong>{authorName}</strong>
                        <span>{location}</span>
                      </div>
                    </div>
                    <span className="post-time">{formatRelativeTime(post.createdAt)}</span>
                  </header>
                  <div className="post-content">
                    <p>{post.content}</p>
                    {post.images && post.images.length > 0 && (
                      <div className="post-images">
                        {post.images.map(url => (
                          <img src={url} alt="Ảnh chia sẻ" key={url} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="post-actions">
                    <button type="button" onClick={() => handleToggleLike(post._id)}>
                      <span role="img" aria-label="Thả tim">💙</span>
                      {post.likes.length}
                    </button>
                    <div className="post-comments-count">
                      💬 {post.comments.length}
                    </div>
                    {canDeletePost && (
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDeletePost(post._id)}
                        disabled={deletingPostId === post._id}
                      >
                        {deletingPostId === post._id ? 'Đang xoá...' : 'Xoá bài'}
                      </button>
                    )}
                  </div>
                  <section className="comment-section">
                    {post.comments.length > 0 && (
                      <div className="comment-list">
                        {post.comments.slice(-3).map(comment => {
                          const commentator = isUserObject(comment.userId) ? comment.userId : null
                          const canDeleteComment = isAdmin
                          return (
                            <div key={comment._id} className="comment-item">
                              <strong>{commentator?.fullName || commentator?.username || 'Ẩn danh'}</strong>
                              <p>{comment.content}</p>
                              {canDeleteComment && (
                                <button
                                  type="button"
                                  aria-label="Xoá bình luận"
                                  onClick={() => handleDeleteComment(post._id, comment._id)}
                                  disabled={Boolean(deletingComment && deletingComment.commentId === comment._id)}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          )
                        })}
                        {post.comments.length > 3 && (
                          <span className="comment-more">Xem thêm {post.comments.length - 3} bình luận</span>
                        )}
                      </div>
                    )}
                    <div className="comment-form">
                      <input
                        type="text"
                        placeholder="Viết bình luận..."
                        value={commentDrafts[post._id] ?? ''}
                        onChange={event => handleCommentDraft(post._id, event.target.value)}
                      />
                      <button type="button" onClick={() => handleSubmitComment(post._id)} disabled={!commentDrafts[post._id]?.trim()}>
                        Gửi
                      </button>
                    </div>
                  </section>
                </article>
              )
            })
          )}

          {canLoadMore && (
            <button
              type="button"
              className="load-more"
              onClick={() => void loadPosts(page + 1, true)}
              disabled={loadingMore}
            >
              {loadingMore ? 'Đang tải thêm...' : 'Xem thêm câu chuyện'}
            </button>
          )}
        </div>

        <aside className="social-sidebar">
          <div className="match-tip">
            <p>Khuyến khích</p>
            <h3>Kết nối thêm mentor / mentee để mở rộng vòng tròn tích cực.</h3>
            <span>Gợi ý dựa trên kỹ năng & hành vi matching của bạn.</span>
          </div>

          <div className="suggestions-panel">
            <header>
              <strong>Gợi ý kết nối</strong>
              <span>{loadingSuggestions ? 'Đang tải...' : `${suggestions.length} đề xuất`}</span>
            </header>
            {suggestions.length === 0 && !loadingSuggestions && (
              <p className="suggestion-empty">Chưa có đề xuất nào, hoàn thiện hồ sơ để được ghép đôi nhanh hơn.</p>
            )}
            {suggestions.map(person => (
              <article key={person._id} className="suggestion-card">
                <div className="suggestion-info">
                  <img src={person.avatar || '/user_avt.png'} alt={person.fullName || person.username} />
                  <div>
                    <strong>{person.fullName || person.username}</strong>
                    <span>{person.jobTitle || person.role}</span>
                    {person.interests?.length ? (
                      <small>{person.interests.slice(0, 2).join(' • ')}</small>
                    ) : (
                      <small>Luôn sẵn sàng kết nối</small>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleConnect(person._id)}
                  disabled={connectStatus[person._id] === 'pending' || connectStatus[person._id] === 'sent'}
                >
                  {connectStatus[person._id] === 'sent' ? 'Đã gửi' : 'Kết nối'}
                </button>
              </article>
            ))}
          </div>

          {isAdmin && (
            <div className="moderation-panel">
              <header>
                <strong>Quản trị Social</strong>
                <span>Bài viết hiện có: {posts.length}</span>
              </header>
              <ul>
                <li>• Xoá bài viết vi phạm trực tiếp trong danh sách.</li>
                <li>• Bộ lọc bên trái giúp rà soát nhanh theo vai trò và bài có ảnh.</li>
                <li>• Có thể xoá bình luận spam bằng nút ✕ trong từng bình luận.</li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
