import { useState } from 'react'
import './App.css'
import TextAnalyzer from './components/TextAnalyzer'
import TextDiff from './components/TextDiff'

function App() {
  const [activeView, setActiveView] = useState('analyzer')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h1>Hid Char Helper</h1>
            <p>A tool to identify and analyze hidden characters in text</p>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={activeView === 'analyzer' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveView('analyzer')}
              aria-current={activeView === 'analyzer' ? 'page' : undefined}
            >
              Text Analyzer
            </button>
            <button 
              className={activeView === 'diff' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveView('diff')}
              aria-current={activeView === 'diff' ? 'page' : undefined}
            >
              Text Comparison
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="made-by">
              Made by Naji
              <a href="https://www.linkedin.com/in/najinaji/" target="_blank" rel="noopener noreferrer" className="linkedin-link">
                LinkedIn Profile
              </a>
            </div>
          </div>
        </div>
      </aside>

      <button 
        className="sidebar-toggle"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? '›' : '‹'}
      </button>

      <div className="main-area">
        {activeView === 'analyzer' && <TextAnalyzer />}
        {activeView === 'diff' && <TextDiff />}
      </div>
    </div>
  )
}

export default App
