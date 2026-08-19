import { useState } from 'react'
import { mockUsers, currentUser } from '../data/mockData'
import './Login.css'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const matchedUser = mockUsers.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() ||
        u.email.toLowerCase() === username.trim().toLowerCase()
    )

    if (matchedUser) {
      onLogin?.(matchedUser)
    } else {
      setError('Invalid credentials. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">📦</div>
          <h1>ImportBiz Accounting</h1>
          <p>Sign in to your account</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-username">Email / Username</label>
            <input
              id="login-username"
              type="text"
              placeholder="Enter email or username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className="login-password-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading && <span className="login-spinner" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="login-hint">
            Mock authentication. Try <strong>admin</strong> or <strong>ali</strong>.
          </p>
        </form>
      </div>
    </div>
  )
}
