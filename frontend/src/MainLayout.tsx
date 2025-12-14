import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import './styles/MainLayout.css'

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Header />
      <div className="main-body">
        <Outlet />
      </div>
    </div>
  )
}
