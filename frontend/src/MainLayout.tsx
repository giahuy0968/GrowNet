import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { Icon } from './components/ui/Icon'

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{ position: 'fixed', right: 16, bottom: 16, width: 40, height: 40, borderRadius: 20, border: '1px solid rgb(var(--border))', background: 'rgb(var(--card))' }}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="md" aria-hidden />
    </button>
  );
}

export default function MainLayout() {
  return (
    <ThemeProvider>
      <div className="main-layout">
        <Header />
        <div className="main-body">
          <Outlet /> {/* nơi các trang con (Dashboard, Chat...) sẽ hiển thị */}
        </div>
        <ThemeToggle />
      </div>
    </ThemeProvider>
  )
}
