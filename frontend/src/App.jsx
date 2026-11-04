
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight,
  Trophy,
  Crown,
  ShieldCheck,
  RotateCcw,
  X,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  CalendarDays,
  Clock3,
  LogOut,
  CheckCircle2,
  Search,
  Bell,
  LayoutDashboard,
  Plus,
  RefreshCw,
  CircleAlert,
  CalendarCheck,
  LoaderCircle,
  Users,
  Check,
  Ban,
  ClipboardList,
} from 'lucide-react'

import {
  loginUser,
  getMyBookings,
  checkBookingAvailability,
  createBooking,
  getAllAdminBookings,
  getPendingAdminBookings,
  approveBooking,
  rejectBooking,
} from './api/api'

const C = {
  bg: '#050914',
  panel: '#0b1425',
  border: 'rgba(148,163,184,0.18)',
  text: '#f8fafc',
  muted: '#94a3b8',
  green: '#a3e635',
  cyan: '#22d3ee',
  amber: '#fbbf24',
  red: '#f87171',
}

const pageStyle = {
  minHeight: '100vh',
  background: C.bg,
  color: C.text,
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
}

const primaryButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 9,
  padding: '12px 17px',
  border: 'none',
  borderRadius: 10,
  background: C.green,
  color: '#101827',
  fontWeight: 800,
  fontSize: 13,
  cursor: 'pointer',
}

const secondaryButton = {
  ...primaryButton,
  background: 'rgba(148,163,184,0.08)',
  border: `1px solid ${C.border}`,
  color: C.text,
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 13px',
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  background: '#07101e',
  color: C.text,
  fontSize: 13,
  outline: 'none',
}

const panelStyle = {
  border: `1px solid ${C.border}`,
  borderRadius: 15,
  background: 'linear-gradient(145deg,#0f1b2b,#09111e)',
  padding: 20,
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return '—'
  const [hours, minutes] = String(value).split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function normalizeStatus(status) {
  const value = String(status || 'PENDING').toUpperCase()
  if (value === 'DECLINED' || value === 'REJECTED') return 'REJECTED'
  if (value === 'APPROVED') return 'APPROVED'
  if (value === 'CANCELLED') return 'CANCELLED'
  return 'PENDING'
}


function StatusBadge({ status, isSuperAdmin = false }) {
  const normalized = normalizeStatus(status)

  const colors = {
    PENDING: {
      color: C.amber,
      background: 'rgba(251,191,36,.10)',
      border: 'rgba(251,191,36,.25)',
    },
    APPROVED: {
      color: C.green,
      background: 'rgba(163,230,53,.10)',
      border: 'rgba(163,230,53,.25)',
    },
    REJECTED: {
      color: C.red,
      background: 'rgba(248,113,113,.10)',
      border: 'rgba(248,113,113,.25)',
    },
    CANCELLED: {
      color: C.muted,
      background: 'rgba(148,163,184,.10)',
      border: 'rgba(148,163,184,.2)',
    },
  }

  const style = colors[normalized]

  return (
   

<span
  className={isSuperAdmin ? 'sh-super-status-badge' : undefined}
  style={{
    display: 'inline-flex',
    padding: '5px 9px',
    borderRadius: 7,
    border: `1px solid ${style.border}`,
    background: style.background,
    color: style.color,
    fontSize: 10,
    fontWeight: 850,
    letterSpacing: '.04em',
    whiteSpace: 'nowrap',
    ...(isSuperAdmin
      ? {
          boxShadow: '0 0 12px rgba(212,175,55,.10)',
          transition: 'box-shadow 200ms ease, transform 200ms ease',
        }
      : {}),
  }}
>
  {normalized}
</span>


  )
}


function ErrorNotice({ children }) {
  if (!children) return null

  return (
    <div
      role="alert"
      style={{
        padding: 13,
        marginBottom: 16,
        borderRadius: 9,
        border: '1px solid rgba(248,113,113,.3)',
        background: 'rgba(127,29,29,.15)',
        color: '#fca5a5',
        fontSize: 12,
        lineHeight: 1.7,
        overflowWrap: 'anywhere',
      }}
    >
      <CircleAlert
        size={15}
        style={{ verticalAlign: 'middle', marginRight: 7 }}
      />
      {children}
    </div>
  )
}

function InfoNotice({ children, type = 'success' }) {
  if (!children) return null

  const color = type === 'error' ? C.red : type === 'info' ? C.cyan : C.green

  return (
    <div
      role="status"
      style={{
        padding: 13,
        marginBottom: 16,
        borderRadius: 9,
        border: `1px solid ${color}40`,
        background: `${color}0d`,
        color,
        fontSize: 12,
        lineHeight: 1.7,
      }}
    >
      {children}
    </div>
  )
}

function SportsOrbit() {
  return (
    <div
      style={{
        position: 'relative',
        width: 120,
        height: 120,
        margin: '0 auto 24px',
      }}
    >
      {[120, 88, 56].map((size, index) => (
        <motion.div
          key={size}
          animate={{ rotate: index % 2 ? -360 : 360 }}
          transition={{
            duration: 14 + index * 5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            top: (120 - size) / 2,
            left: (120 - size) / 2,
            border: `1px ${
              index === 0 ? 'dashed' : 'solid'
            } ${index === 1 ? 'rgba(34,211,238,.35)' : 'rgba(163,230,53,.3)'}`,
            borderRadius: '50%',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: -4,
              left: '50%',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: index === 1 ? C.cyan : C.green,
            }}
          />
        </motion.div>
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 32,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#1e293b,#0b1425)',
          color: C.green,
        }}
      >
        <Trophy size={25} />
      </div>
    </div>
  )
}

function Intro({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 4000)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        ...pageStyle,
        boxSizing: 'border-box',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        textAlign: 'center',
        background:
          'radial-gradient(ellipse at 50% 40%,#14243a 0%,#070d19 48%,#03060d 100%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 700 }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <SportsOrbit />

          <p
            style={{
              color: C.green,
              fontSize: 10,
              fontWeight: 850,
              letterSpacing: 4,
            }}
          >
            YOUR GAME. YOUR SPACE. YOUR MOMENT.
          </p>

          <h1
            style={{
              fontSize: 'clamp(36px,7vw,68px)',
              lineHeight: 1.05,
              letterSpacing: '-2px',
              margin: '18px 0',
              fontWeight: 900,
            }}
          >
            SPORTS HALL
            <br />
            <span style={{ color: C.green }}>BOOKING SYSTEM</span>
          </h1>

          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.8 }}>
            Find your court. Reserve your time. Get in the game.
          </p>

          <button onClick={onFinish} style={{ ...primaryButton, marginTop: 24 }}>
            Enter system <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </motion.main>
  )
}

function Portal({ onOpenLogin, onReplay }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...pageStyle,
        boxSizing: 'border-box',
        padding: '30px 20px 45px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 900 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 35,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 12,
              color: C.green,
              background: 'rgba(163,230,53,.12)',
            }}
          >
            <Trophy size={22} />
          </div>

          <div>
            <div style={{ fontWeight: 900, letterSpacing: 1 }}>
              SPORTS HALL
            </div>
            <div
              style={{
                color: C.muted,
                fontSize: 10,
                letterSpacing: 2,
                marginTop: 3,
              }}
            >
              BOOKING MANAGEMENT
            </div>
          </div>

          <button
            onClick={onReplay}
            title="Replay intro"
            style={{ ...secondaryButton, marginLeft: 'auto', padding: 10 }}
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <p
            style={{
              color: C.green,
              fontSize: 10,
              letterSpacing: 4,
              fontWeight: 850,
            }}
          >
            YOUR NEXT GAME STARTS HERE
          </p>

          <h1
            style={{
              fontSize: 'clamp(30px,6vw,52px)',
              letterSpacing: '-1.5px',
              margin: '13px 0',
            }}
          >
            Choose your <span style={{ color: C.green }}>portal</span>
          </h1>

          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.8 }}>
            Sign in to manage sports hall bookings.
          </p>
        </div>

        <div
          className="portal-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))',
            gap: 18,
          }}
        >
          <section style={panelStyle}>
            <CalendarCheck size={32} color={C.green} />
            <p
              style={{
                color: C.green,
                fontSize: 10,
                letterSpacing: 3,
                fontWeight: 850,
              }}
            >
              PLAYER PORTAL
            </p>

            <h2 style={{ fontSize: 24, margin: '8px 0' }}>User login</h2>

            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.8 }}>
              Request a hall, check availability, and track your booking
              history.
            </p>

            <button
              onClick={() => onOpenLogin('user')}
              style={{ ...primaryButton, width: '100%', marginTop: 18 }}
            >
              Continue as user <ArrowRight size={16} />
            </button>
          </section>

          <section style={panelStyle}>
            <ShieldCheck size={32} color={C.cyan} />
            <p
              style={{
                color: C.cyan,
                fontSize: 10,
                letterSpacing: 3,
                fontWeight: 850,
              }}
            >
              MANAGEMENT PORTAL
            </p>

            <h2 style={{ fontSize: 24, margin: '8px 0' }}>Admin access</h2>

            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.8 }}>
              Review booking requests, approve or reject applications, and
              monitor hall reservations.
            </p>

            <button
              onClick={() => onOpenLogin('admin')}
              style={{
                ...secondaryButton,
                width: '100%',
                marginTop: 18,
                borderColor: 'rgba(34,211,238,.35)',
                color: C.cyan,
              }}
            >
              <LockKeyhole size={15} />
              Administrator login <ArrowRight size={16} />
            </button>
          </section>
        </div>

        <p
          style={{
            color: '#64748b',
            textAlign: 'center',
            fontSize: 11,
            marginTop: 30,
          }}
        >
          A better way to book your game.
        </p>
      </div>
    </motion.main>
  )
}

function LoginModal({ mode, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAdminLogin = mode === 'admin'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await loginUser(email.trim(), password)

    const roles = Array.isArray(result?.roles) ? result.roles : []

const normalizedRoles = roles.map((role) =>
  String(role).toUpperCase().replace(/^ROLE_/, '')
)

const isSuperAdmin = normalizedRoles.includes('SUPER_ADMIN')
const isNormalAdmin = normalizedRoles.includes('ADMIN')
const isAdmin = isSuperAdmin || isNormalAdmin
      if (isAdminLogin && !isAdmin) {
        setError(
          'This account does not have administrator permissions. Please use an administrator account.'
        )
        return
      }

      if (!isAdminLogin && isAdmin) {
        setError(
          'This is an administrator account. Please use the Administrator Login portal.'
        )
        return
      }

      onLoginSuccess({
  ...result,
  email: result?.email || email.trim(),
  fullName: result?.fullName || result?.name || '',
  roles,
  isAdmin,
  isSuperAdmin,
  isNormalAdmin,
})
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'grid',
        placeItems: 'center',
        padding: 18,
        background: 'rgba(2,6,15,.82)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <motion.section
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{
          width: '100%',
          maxWidth: 430,
          boxSizing: 'border-box',
          padding: 26,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          background: C.panel,
          boxShadow: '0 30px 100px rgba(0,0,0,.45)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div
            style={{
              width: 45,
              height: 45,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 12,
              background: isAdminLogin
                ? 'rgba(34,211,238,.12)'
                : 'rgba(163,230,53,.12)',
              color: isAdminLogin ? C.cyan : C.green,
            }}
          >
            {isAdminLogin ? <ShieldCheck size={23} /> : <Trophy size={23} />}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close login"
            style={{
              background: 'transparent',
              color: C.muted,
              border: 'none',
              cursor: 'pointer',
              padding: 7,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <h2 style={{ fontSize: 25, margin: '20px 0 7px' }}>
          {isAdminLogin ? 'Administrator login' : 'Welcome back'}
        </h2>

        <p
          style={{
            color: C.muted,
            fontSize: 13,
            margin: '0 0 22px',
            lineHeight: 1.7,
          }}
        >
          {isAdminLogin
            ? 'Sign in with your authorized administrator account to manage booking requests.'
            : 'Sign in to access your sports hall dashboard.'}
        </p>

        <form onSubmit={handleSubmit}>
          <label className="field-label">Email address</label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Mail
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: 13,
                color: '#64748b',
              }}
            />
            <input
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              style={{ ...inputStyle, paddingLeft: 38 }}
            />
          </div>

          <label className="field-label">Password</label>
          <div style={{ position: 'relative', marginBottom: 17 }}>
            <LockKeyhole
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: 13,
                color: '#64748b',
              }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              style={{
                ...inputStyle,
                paddingLeft: 38,
                paddingRight: 42,
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: 7,
                top: 5,
                width: 34,
                height: 34,
                display: 'grid',
                placeItems: 'center',
                border: 'none',
                background: 'transparent',
                color: C.muted,
                cursor: 'pointer',
              }}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <ErrorNotice>{error}</ErrorNotice>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...primaryButton,
              width: '100%',
              opacity: loading ? 0.65 : 1,
              cursor: loading ? 'wait' : 'pointer',
              background: isAdminLogin ? C.cyan : C.green,
            }}
          >
            {loading ? (
              <LoaderCircle size={16} />
            ) : (
              <ArrowRight size={16} />
            )}
            {loading ? 'Signing in...' : 'Sign in securely'}
          </button>
        </form>

        <p
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            color: '#64748b',
            fontSize: 11,
            margin: '18px 0 0',
          }}
        >
          <ShieldCheck size={14} />
          Role-based secure sign-in
        </p>
      </motion.section>
    </motion.div>
  )
}

function BookingForm({ onCreated, onCancel }) {
  const today = new Date()
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const [hallName, setHallName] = useState('Main Sports Hall')
  const [sport, setSport] = useState('Badminton')
  const [bookingDate, setBookingDate] = useState(localToday)
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('11:00')
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  function validateForm() {
    if (!hallName.trim() || !sport.trim()) {
      setMessage('Please enter a hall name and select a sport.')
      setMessageType('error')
      return false
    }

    if (!bookingDate || !startTime || !endTime) {
      setMessage('Please complete the date and time fields.')
      setMessageType('error')
      return false
    }

    if (endTime <= startTime) {
      setMessage('End time must be later than start time.')
      setMessageType('error')
      return false
    }

    if (bookingDate < localToday) {
      setMessage('Please choose today or a future date.')
      setMessageType('error')
      return false
    }

    return true
  }

  async function handleAvailability() {
    if (!validateForm()) return

    setChecking(true)
    setMessage('Checking availability...')
    setMessageType('info')

    try {
      const result = await checkBookingAvailability({
        hallName: hallName.trim(),
        bookingDate,
        startTime,
        endTime,
      })

      setMessage(
        result.available
          ? 'This time slot appears to be available. You can submit your request.'
          : 'This time slot is not available. Please choose another time.'
      )
      setMessageType(result.available ? 'success' : 'error')
    } catch (err) {
      setMessage(err.message || 'Could not check availability.')
      setMessageType('error')
    } finally {
      setChecking(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    setMessage('')
    setMessageType('info')

    try {
      const availability = await checkBookingAvailability({
        hallName: hallName.trim(),
        bookingDate,
        startTime,
        endTime,
      })

      if (!availability.available) {
        setMessage(
          'This slot is not available. Choose another time before submitting.'
        )
        setMessageType('error')
        return
      }

      await createBooking({
        hallName: hallName.trim(),
        sport,
        bookingDate,
        startTime,
        endTime,
      })

      setMessage(
        'Your booking request has been sent to the administrator.'
      )
      setMessageType('success')
      await onCreated()
    } catch (err) {
      setMessage(err.message || 'Booking could not be submitted.')
      setMessageType('error')
    } finally {
      setSubmitting(false)
    }
  }

  const messageColor =
    messageType === 'error'
      ? C.red
      : messageType === 'success'
        ? C.green
        : C.cyan

  return (
    <section style={{ ...panelStyle, marginTop: 18 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, margin: 0 }}>Request a booking</h2>
          <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7 }}>
            Choose your hall, sport, date, and playing time.
          </p>
        </div>

        <button
          onClick={onCancel}
          type="button"
          aria-label="Close booking form"
          style={{ ...secondaryButton, padding: 8 }}
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="booking-form-grid">
          <div>
            <label className="field-label">Sports hall name</label>
            <input
              required
              maxLength={100}
              value={hallName}
              onChange={(event) => setHallName(event.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label className="field-label">Sport</label>
            <select
              required
              value={sport}
              onChange={(event) => setSport(event.target.value)}
              style={inputStyle}
            >
              <option>Badminton</option>
              <option>Basketball</option>
              <option>Volleyball</option>
              <option>Table Tennis</option>
              <option>Indoor Cricket</option>
              <option>Futsal</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="field-label">Booking date</label>
            <input
              type="date"
              required
              min={localToday}
              value={bookingDate}
              onChange={(event) => setBookingDate(event.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label className="field-label">Start time</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label className="field-label">End time</label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {message && (
          <div
            role="status"
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 9,
              border: `1px solid ${messageColor}40`,
              background: 'rgba(148,163,184,.05)',
              color: messageColor,
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 18,
          }}
        >
          <button
            type="button"
            onClick={handleAvailability}
            disabled={checking || submitting}
            style={secondaryButton}
          >
            {checking ? <LoaderCircle size={15} /> : <Search size={15} />}
            {checking ? 'Checking...' : 'Check availability'}
          </button>

          <button
            type="submit"
            disabled={submitting || checking}
            style={primaryButton}
          >
            {submitting ? <LoaderCircle size={15} /> : <Plus size={15} />}
            {submitting ? 'Submitting...' : 'Submit booking request'}
          </button>
        </div>
      </form>
    </section>
  )
}

function Dashboard({ user, onLogout }) {
  const isAdmin = user?.isAdmin === true
  const isSuperAdmin = user?.isSuperAdmin === true
const isNormalAdmin = isAdmin && !isSuperAdmin
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const [searchText, setSearchText] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [bookingsError, setBookingsError] = useState('')
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState('success')
  const [processingId, setProcessingId] = useState(null)
    const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteMessageType, setInviteMessageType] = useState('success')

  const email = user?.email || 'Player'
  const displayName =
    user?.fullName ||
    (email.includes('@')
      ? email.split('@')[0].replace(/[._-]/g, ' ')
      : email)

  const initial = displayName.trim().charAt(0).toUpperCase() || 'P'

  const loadBookings = useCallback(async () => {
    setLoadingBookings(true)
    setBookingsError('')

    try {
      let result

      if (isAdmin) {
        result =
          activeMenu === 'Pending requests'
            ? await getPendingAdminBookings()
            : await getAllAdminBookings()
      } else {
        result = await getMyBookings()
      }

      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result?.bookings)
          ? result.bookings
          : []

      setBookings(rows)
    } catch (err) {
      setBookingsError(
        err.message ||
          'Could not load bookings. Confirm the backend is running and your session is valid.'
      )
      setBookings([])
    } finally {
      setLoadingBookings(false)
    }
  }, [isAdmin, activeMenu])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const filteredBookings = bookings.filter((booking) => {
    const searchable = [
      booking.id,
      booking.userName,
      booking.userEmail,
      booking.hallName,
      booking.sport,
      booking.bookingDate,
      booking.status,
    ]
      .join(' ')
      .toLowerCase()

    return searchable.includes(searchText.toLowerCase())
  })

  const pendingCount = bookings.filter(
    (booking) => normalizeStatus(booking.status) === 'PENDING'
  ).length

  const approvedCount = bookings.filter(
    (booking) => normalizeStatus(booking.status) === 'APPROVED'
  ).length

  const rejectedCount = bookings.filter(
    (booking) => normalizeStatus(booking.status) === 'REJECTED'
  ).length
  async function handleSendAdminInvitation(event) {
    event.preventDefault()

    if (!isSuperAdmin) {
      setInviteMessage('Only the Super Admin can invite administrators.')
      setInviteMessageType('error')
      return
    }

    const email = inviteEmail.trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteMessage('Please enter a valid email address.')
      setInviteMessageType('error')
      return
    }

    setInviteLoading(true)
    setInviteMessage('')

    try {
      const response = await fetch(
        'http://localhost:8080/api/admin/invitations',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.message || `Invitation failed (${response.status}).`
        )
      }

      setInviteMessage(
        data.message || 'Invitation email sent successfully.'
      )
      setInviteMessageType('success')
      setInviteEmail('')
    } catch (error) {
      setInviteMessage(
        error.message ||
          'Could not send invitation. Check that the backend is running and you are logged in.'
      )
      setInviteMessageType('error')
    } finally {
      setInviteLoading(false)
    }
  }
  function navigate(menu) {
    setActiveMenu(menu)
    setSearchText('')
    setNotice('')
    setBookingsError('')
    setShowBookingForm(false)
  }

  async function handleBookingCreated() {
    setShowBookingForm(false)
    setActiveMenu('My bookings')
    setNotice(
      'Your request has been submitted. It is waiting for administrator review.'
    )
    setNoticeType('success')
    await loadBookings()
  }

 
async function handleDecision(bookingId, decision, reasonType, customReason = '') {
  const actionLabel = decision === 'approve' ? 'approve' : 'reject'

  if (decision === 'reject') {
    if (!reasonType) {
      setNotice('Please select a rejection reason.')
      setNoticeType('error')
      return
    }

    if (reasonType === 'OTHER' && !customReason.trim()) {
      setNotice('Please enter a custom rejection reason.')
      setNoticeType('error')
      return
    }
  }

  if (
    !window.confirm(
      `Are you sure you want to ${actionLabel} booking SH-${bookingId}?`
    )
  ) {
    return
  }

  setProcessingId(bookingId)
  setNotice('')
  setBookingsError('')

  try {
    if (decision === 'approve') {
      await approveBooking(bookingId)
      setNotice(`Booking SH-${bookingId} was approved successfully.`)
    } else {
      await rejectBooking(bookingId, reasonType, customReason.trim())
      setNotice(`Booking SH-${bookingId} was rejected successfully.`)
    }

    setNoticeType('success')
    await loadBookings()
  } catch (err) {
    setNotice(
      err.message ||
        `Could not ${actionLabel} this booking. Please refresh and try again.`
    )
    setNoticeType('error')
  } finally {
    setProcessingId(null)
  }
}


  const menus = isAdmin
    ? [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'All bookings', icon: ClipboardList },
        { name: 'Pending requests', icon: Clock3 },
      ]
    : [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'My bookings', icon: CalendarDays },
      ]

  const pageTitle = isAdmin
    ? activeMenu === 'Pending requests'
      ? 'Pending requests'
      : activeMenu === 'All bookings'
        ? 'All bookings'
        : 'Administrator dashboard'
    : activeMenu === 'My bookings'
      ? 'My bookings'
      : 'My dashboard'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ ...pageStyle, minHeight: '100vh' }}
    >
      <style>{`
        * { box-sizing: border-box; }
        .sh-layout { display:flex; min-height:100vh; width:100%; }
        .sh-sidebar {
          width:225px; flex-shrink:0; display:flex; flex-direction:column;
          padding:22px 14px; border-right:1px solid rgba(133,160,183,.13);
          background:#080f1a;
        }
        .sh-main { min-width:0; flex:1; }
        .sh-nav {
          display:flex; align-items:center; gap:12px; width:100%;
          padding:12px; margin:3px 0; border:1px solid transparent;
          border-radius:10px; text-align:left; cursor:pointer;
          background:transparent; color:#8396aa; font-size:12px;
          font-weight:650;
        }
        .sh-nav.active {
          color:#c5f36b; background:rgba(163,230,53,.09);
          border-color:rgba(163,230,53,.15);
        }
        .sh-nav:hover { color:#f4f8fb; }
        /* SUPER ADMIN — premium black and gold */
.sh-layout.sh-super-admin {
  --admin-accent: #d4af37;
  --admin-accent-soft: rgba(212,175,55,.12);
  --admin-accent-border: rgba(212,175,55,.3);
}

.sh-layout.sh-super-admin .sh-sidebar {
  background: linear-gradient(180deg, #100f0b 0%, #08090d 100%);
  border-right-color: rgba(212,175,55,.22);
}

.sh-layout.sh-super-admin .sh-nav.active {
  color: #f5d778;
  background: var(--admin-accent-soft);
  border-color: var(--admin-accent-border);
}

.sh-layout.sh-super-admin .sh-nav:hover {
  color: #f5d778;
}

.sh-layout.sh-super-admin .sh-topbar {
  background: rgba(12,11,8,.96);
  border-bottom-color: rgba(212,175,55,.2);
}

/* NORMAL ADMIN — navy and cyan */
.sh-layout.sh-normal-admin {
  --admin-accent: #22d3ee;
  --admin-accent-soft: rgba(34,211,238,.1);
  --admin-accent-border: rgba(34,211,238,.28);
}

.sh-layout.sh-normal-admin .sh-sidebar {
  background: linear-gradient(180deg, #091729 0%, #07101e 100%);
  border-right-color: rgba(34,211,238,.18);
}

.sh-layout.sh-normal-admin .sh-nav.active {
  color: #67e8f9;
  background: var(--admin-accent-soft);
  border-color: var(--admin-accent-border);
}

.sh-layout.sh-normal-admin .sh-nav:hover {
  color: #67e8f9;
}

.sh-layout.sh-normal-admin .sh-topbar {
  background: rgba(7,18,33,.96);
  border-bottom-color: rgba(34,211,238,.18);
}
        .sh-topbar {
          display:flex; align-items:center; gap:12px;
          padding:16px clamp(15px,2.4vw,30px);
          border-bottom:1px solid rgba(133,160,183,.13);
          background:rgba(7,13,22,.92); position:sticky; top:0;
          z-index:10; backdrop-filter:blur(15px);
        }
        .sh-content {
          max-width:1450px; margin:0 auto;
          padding:26px clamp(15px,2.4vw,30px) 38px;
        }
        .sh-search {
          display:flex; align-items:center; gap:9px;
          width:min(360px,38vw); padding:10px 12px;
          border:1px solid rgba(133,160,183,.16);
          border-radius:9px; background:#0a1421; color:#8194a9;
        }
        .sh-search input {
          width:100%; min-width:0; border:0; outline:0;
          background:transparent; color:#eef5fb; font:inherit; font-size:12px;
        }
        .sh-stat-grid {
          display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px;
        }
        
.sh-super-stat {
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    145deg,
    rgba(22, 29, 41, 0.98),
    rgba(11, 16, 25, 0.98)
  ) !important;
  border: 1px solid rgba(212, 175, 55, 0.20) !important;
  border-radius: 16px !important;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.035);
  transition:
    transform 240ms ease,
    border-color 240ms ease,
    box-shadow 240ms ease;
}

.sh-super-stat:hover {
  transform: translateY(-4px);
  border-color: rgba(230, 199, 115, 0.55) !important;
  box-shadow:
    0 14px 32px rgba(0, 0, 0, 0.30),
    0 4px 18px rgba(212, 175, 55, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

    

.sh-super-booking-header {
  letter-spacing: 0.6px;
  text-shadow: 0 0 8px rgba(245, 215, 120, 0.08);
  transition: color 200ms ease, text-shadow 200ms ease;
}

  .sh-super-status-badge:hover {
  box-shadow: 0 0 15px rgba(245, 215, 120, 0.28) !important;
  transform: translateY(-1px);
}
  


.sh-super-booking-record:hover {
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0.025),
    rgba(10, 17, 29, 0.15)
  ) !important;
  border-bottom-color: rgba(245, 215, 120, 0.25) !important;
  box-shadow: none !important;
}


  .sh-super-booking-record {
  transition:
    background 200ms ease,
    border-color 200ms ease,
    box-shadow 200ms ease;
}
    
.sh-super-booking-record > td:first-child {
  padding-left: 16px !important;
}



        .booking-form-grid {
          display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px;
        }
        .field-label {
          display:block; margin-bottom:7px; color:#cbd5e1;
          font-size:12px; font-weight:700;
        }
        .sh-booking-row {
          display:grid; grid-template-columns:1.2fr 1fr 1.1fr 1fr .8fr;
          gap:12px; align-items:center; padding:14px 0;
          border-bottom:1px solid rgba(133,160,183,.1); font-size:11px;
        }
        .sh-booking-row:last-child { border-bottom:0; }
        .sh-action-row { display:flex; flex-wrap:wrap; gap:7px; }
        .sh-action {
          display:inline-flex; align-items:center; justify-content:center; gap:5px;
          padding:8px 10px; border-radius:8px; font-size:10px; font-weight:800;
          cursor:pointer; border:1px solid transparent;
        }
        .sh-approve { color:#c5f36b; background:rgba(163,230,53,.09); border-color:rgba(163,230,53,.25); }
        .sh-reject { color:#fca5a5; background:rgba(248,113,113,.08); border-color:rgba(248,113,113,.25); }
        .sh-action:disabled { opacity:.5; cursor:wait; }
        @keyframes sh-spin { to { transform:rotate(360deg); } }
        .sh-spin { animation:sh-spin 1s linear infinite; }
        @media(max-width:950px) {
          .sh-sidebar { width:190px; }
          .sh-stat-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
        }
        @media(max-width:700px) {
          .sh-sidebar { width:65px; padding:16px 7px; }
          .sh-brand-text,.sh-nav span,.sh-help-text,.sh-side-user { display:none; }
          .sh-nav { justify-content:center; padding:13px 0; }
          .sh-topbar { flex-wrap:wrap; }
          .sh-search { order:3; width:100%; flex-basis:100%; }
          .sh-profile-email { display:none; }
        }
        @media(max-width:480px) {
          .sh-sidebar { display:none; }
          .sh-stat-grid { grid-template-columns:1fr; }
          .booking-form-grid { grid-template-columns:1fr; }
          .sh-booking-row { grid-template-columns:1fr 1fr; gap:8px; }
          .sh-booking-row > :nth-child(3) { display:none; }
          .sh-content { padding-top:18px; }
        }
      `}</style>

      <div
  className={`sh-layout ${
    isSuperAdmin ? 'sh-super-admin' : isNormalAdmin ? 'sh-normal-admin' : 'sh-user'
  }`}
>
        <aside className="sh-sidebar">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 8px 28px',
            }}
          >
            <div
              style={{
                width: 39,
                height: 39,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 12,
                color: '#101827',
    background: isSuperAdmin
  ? 'linear-gradient(135deg, #fff1a8, #d4af37, #997515)'
  : 'linear-gradient(135deg,#c5f36b,#78d6ce)',
boxShadow: isSuperAdmin
  ? '0 0 22px rgba(212,175,55,.28)'
  : 'none',
              }}
            >
              {isSuperAdmin ? (
  <Crown size={22} strokeWidth={2.2} />
) : (
  <Trophy size={21} />
)}
            </div>

            <div className="sh-brand-text">
              <div style={{ fontSize: 12, fontWeight: 900 }}>
                SPORTS<span style={{ color: C.green }}>HALL</span>
              </div>
              <div
                style={{
                  color: '#73869a',
                  fontSize: 9,
                  letterSpacing: 1.5,
                  marginTop: 4,
                }}
              >
                BOOKING SYSTEM
              </div>
            </div>
          </div>

          <p
            className="sh-help-text"
            style={{
              color: '#8194a9',
              padding: '0 12px',
              fontSize: 9,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {isAdmin ? 'Administration' : 'Workspace'}
          </p>

          <nav aria-label="Dashboard navigation">
            {menus.map(({ name, icon: Icon }) => (
              <button
                key={name}
                className={`sh-nav ${activeMenu === name ? 'active' : ''}`}
                onClick={() => navigate(name)}
                title={name}
              >
                <Icon size={17} />
                <span>{name}</span>
              </button>
            ))}
          </nav>

          <div
            className="sh-help-text"
            style={{
              marginTop: 25,
              padding: 14,
              borderRadius: 12,
              background: 'rgba(34,211,238,.05)',
              border: `1px solid ${C.border}`,
            }}
          >
            <ShieldCheck size={16} color={C.cyan} />
            <p
              style={{
                color: C.muted,
                fontSize: 10,
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              {isAdmin
                ? 'Review pending requests and manage booking decisions.'
                : 'Your booking requests are stored in the connected database.'}
            </p>
          </div>

          <div
            className="sh-side-user"
            style={{
              marginTop: 'auto',
              padding: '18px 7px 0',
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 9,
                  background: isSuperAdmin
  ? 'rgba(212,175,55,.16)'
  : isAdmin
    ? 'rgba(34,211,238,.13)'
    : 'rgba(163,230,53,.13)',
color: isSuperAdmin
  ? '#f5d778'
  : isAdmin
    ? C.cyan
    : C.green,
border: isSuperAdmin
  ? '1px solid rgba(212,175,55,.4)'
  : '1px solid transparent',
boxShadow: isSuperAdmin
  ? '0 0 15px rgba(212,175,55,.12)'
  : 'none',
                  fontWeight: 850,
                }}
              >
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 750,
                    textTransform: 'capitalize',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {displayName}
                </div>
                <div style={{ fontSize: 9, color: '#71859a', marginTop: 3 }}>
                  {isSuperAdmin
  ? '♛ SUPER ADMIN'
  : isAdmin
    ? 'Administrator'
    : 'Signed-in user'}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="sh-main">
          <header className="sh-topbar">
            <div className="sh-search">
              <Search size={16} />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={
                  isAdmin ? 'Search bookings or users...' : 'Search your bookings...'
                }
                aria-label="Search bookings"
              />
            </div>

            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowNotifications((value) => !value)}
                  aria-label="Toggle notifications"
                  style={{
                    ...secondaryButton,
                    width: 37,
                    height: 37,
                    padding: 0,
                    position: 'relative',
                  }}
                >
                  <Bell size={16} />
                  {pendingCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: C.amber,
                      }}
                    />
                  )}
                </button>

                {showNotifications && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 45,
                      zIndex: 20,
                      width: 250,
                      padding: 15,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      background: '#101c2b',
                      boxShadow: '0 15px 45px #0008',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800 }}>
                      Booking summary
                    </div>
                    <p
                      style={{
                        color: C.muted,
                        fontSize: 11,
                        lineHeight: 1.7,
                        marginBottom: 0,
                      }}
                    >
                      {pendingCount} pending request(s) in the currently loaded
                      booking list.
                    </p>
                  </div>
                )}
              </div>

              <div
                style={{
                  width: 33,
                  height: 33,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 9,
                  color: '#10202a',
                 background: isSuperAdmin
  ? 'linear-gradient(135deg, #fff1a8, #d4af37, #997515)'
  : 'linear-gradient(135deg,#b9ee63,#48c6d8)',
boxShadow: isSuperAdmin
  ? '0 0 18px rgba(212,175,55,.25)'
  : 'none',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {initial}
              </div>

              <div className="sh-profile-email" style={{ maxWidth: 150 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 750,
                    textTransform: 'capitalize',
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: '#7e92a6',
                    marginTop: 3,
                  }}
                >
                 {isSuperAdmin
  ? 'Super Administrator'
  : isAdmin
    ? 'Administrator account'
    : 'User account'}
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Logout"
                style={{ ...secondaryButton, padding: 9 }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </header>

          <div className="sh-content">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
                marginBottom: 22,
              }}
            >
              <div>
                <div
                  style={{
                   color: isSuperAdmin
  ? '#f5d778'
  : isAdmin
    ? C.cyan
    : C.green,
                    fontSize: 10,
                    fontWeight: 850,
                    letterSpacing: 2,
                  }}
                >
                 {isSuperAdmin
  ? '♛ SUPER ADMIN COMMAND CENTER'
  : isAdmin
    ? 'ADMINISTRATION CENTER'
    : 'SPORTS HALL BOOKING'}
                </div>

                <h1
                  style={{
                    fontSize: 'clamp(24px,3vw,32px)',
                    letterSpacing: '-1px',
                    margin: '8px 0 6px',
                  }}
                >
                  {pageTitle}
                </h1>

                {isSuperAdmin ? (
  <div
    style={{
      marginTop: 16,
      padding: '20px 22px',
      borderRadius: 16,
      border: '1px solid rgba(212,175,55,.35)',
      background:
        'linear-gradient(115deg, rgba(212,175,55,.13), rgba(15,18,28,.96) 60%, rgba(115,85,20,.12))',
      boxShadow: '0 8px 30px rgba(212,175,55,.07)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        color: '#f5d778',
        fontSize: 10,
        fontWeight: 850,
        letterSpacing: 2,
        marginBottom: 8,
      }}
    >
      ♛ COMMAND ACCESS GRANTED
    </div>

    <div
      style={{
        color: '#fff4cf',
        fontSize: 18,
        fontWeight: 800,
        marginBottom: 7,
      }}
    >
      Welcome, {displayName}
    </div>

    <div style={{ color: '#aab6c7', fontSize: 12, lineHeight: 1.8 }}>
      Manage administrators, oversee sports hall bookings, and monitor
      booking activity from your central command dashboard.
    </div>
  </div>
) : (
  <p style={{ margin: 0, color: C.muted, fontSize: 12 }}>
    Welcome back,{' '}
    <span style={{ color: C.text, textTransform: 'capitalize' }}>
      {displayName}
    </span>
    .
  </p>
)}
              </div>

              <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                <button
                  onClick={loadBookings}
                  disabled={loadingBookings}
                  style={{ ...secondaryButton, padding: '10px 12px' }}
                >
                  <RefreshCw
                    size={14}
                    className={loadingBookings ? 'sh-spin' : ''}
                  />
                  Refresh
                </button>

                {!isAdmin && (
                  <button
                    onClick={() => {
                      setShowBookingForm(true)
                      setNotice('')
                    }}
                    style={{ ...primaryButton, padding: '10px 12px' }}
                  >
                    <Plus size={15} />
                    New booking
                  </button>
                )}
              </div>
            </div>

            <InfoNotice type={noticeType}>{notice}</InfoNotice>
            
            {isSuperAdmin && (
              <section
                style={{
                  ...panelStyle,
                  marginBottom: 20,
                  border: '1px solid rgba(212,175,55,.35)',
                  background:
                    'linear-gradient(135deg,rgba(212,175,55,.08),rgba(11,20,37,.98))',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 12,
                      color: '#f5d778',
                      background: 'rgba(212,175,55,.12)',
                      border: '1px solid rgba(212,175,55,.25)',
                    }}
                  >
                    <Users size={22} />
                  </div>

                  <div>
                    <div
                      style={{
                        color: '#f5d778',
                        fontSize: 10,
                        fontWeight: 850,
                        letterSpacing: 2,
                      }}
                    >
                      SUPER ADMIN CONTROL
                    </div>
                    <h2 style={{ fontSize: 18, margin: '5px 0' }}>
                      Invite a Normal Admin
                    </h2>
                    <p
                      style={{
                        color: C.muted,
                        fontSize: 12,
                        margin: 0,
                        lineHeight: 1.7,
                      }}
                    >
                      Send a secure, 24-hour invitation to an administrator.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendAdminInvitation}>
                  <label className="field-label" htmlFor="admin-invite-email">
                    Recipient email address
                  </label>

                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <input
                      id="admin-invite-email"
                      type="email"
                      required
                      maxLength={254}
                      value={inviteEmail}
                      onChange={(event) =>
                        setInviteEmail(event.target.value)
                      }
                      placeholder="newadmin@example.com"
                      style={{
                        ...inputStyle,
                        flex: '1 1 240px',
                        minWidth: 0,
                      }}
                      disabled={inviteLoading}
                    />

                    <button
                      type="submit"
                      disabled={inviteLoading}
                      style={{
                        ...primaryButton,
                        background: '#d4af37',
                        color: '#17130a',
                        opacity: inviteLoading ? 0.7 : 1,
                        cursor: inviteLoading ? 'wait' : 'pointer',
                      }}
                    >
                      {inviteLoading ? (
                        <LoaderCircle
                          size={15}
                          className="sh-spin"
                        />
                      ) : (
                        <Mail size={15} />
                      )}
                      {inviteLoading ? 'Sending...' : 'Send invitation'}
                    </button>
                  </div>
                </form>

                {inviteMessage && (
                  <div
                    role={inviteMessageType === 'error' ? 'alert' : 'status'}
                    style={{
                      marginTop: 14,
                      padding: 12,
                      borderRadius: 9,
                      border:
                        inviteMessageType === 'error'
                          ? '1px solid rgba(248,113,113,.3)'
                          : '1px solid rgba(212,175,55,.3)',
                      background:
                        inviteMessageType === 'error'
                          ? 'rgba(127,29,29,.15)'
                          : 'rgba(212,175,55,.07)',
                      color:
                        inviteMessageType === 'error'
                          ? '#fca5a5'
                          : '#f5d778',
                      fontSize: 12,
                      lineHeight: 1.7,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {inviteMessage}
                  </div>
                )}
              </section>
            )}

            <ErrorNotice>{bookingsError}</ErrorNotice>

            {showBookingForm && !isAdmin && (
              <BookingForm
                onCreated={handleBookingCreated}
                onCancel={() => setShowBookingForm(false)}
              />
            )}

            <div className="sh-stat-grid" style={{ marginBottom: 18 }}>
              {[
                {
                  label: isAdmin ? 'Bookings loaded' : 'My bookings',
                  value: bookings.length,
                  note: isAdmin
                    ? 'Records returned by the admin API'
                    : 'Total requests in your account',
                  icon: isAdmin ? ClipboardList : CalendarDays,
                 tone: isSuperAdmin ? '#f5d778' : C.cyan,
                },
                {
                  label: 'Pending requests',
                  value: pendingCount,
                  note: 'Waiting for administrator review',
                  icon: Clock3,
                  tone: C.amber,
                },
                {
                  label: 'Approved bookings',
                  value: approvedCount,
                  note: 'Approved by the administrator',
                  icon: CheckCircle2,
                  tone: C.green,
                },
              ].map(({ label, value, note, icon: Icon, tone }) => (
               <section
  key={label}
   className={isSuperAdmin ? 'sh-super-stat' : undefined}
  style={
    isSuperAdmin
      ? {
          ...panelStyle,
          background:
            'linear-gradient(145deg, rgba(212,175,55,.07), rgba(10,17,29,.98) 65%)',
          border: '1px solid rgba(212,175,55,.22)',
          boxShadow: '0 5px 22px rgba(212,175,55,.04)',
        }
      : panelStyle
  }
>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                   <span
  style={{
    color: isSuperAdmin ? '#d9c58a' : C.muted,
    fontSize: 11,
    fontWeight: isSuperAdmin ? 650 : 400,
    letterSpacing: isSuperAdmin ? 0.35 : 0,
    lineHeight: 1.5,
  }}
>
  {label}
</span>
                   <Icon
  size={19}
  color={isSuperAdmin ? '#e5c76b' : tone}
  strokeWidth={isSuperAdmin ? 1.8 : 2}
/>
                  </div>
                 <div
  style={{
    fontSize: 30,
    fontWeight: 850,
    marginTop: 12,
    lineHeight: 1.2,
    color: isSuperAdmin ? '#f4df9b' : 'inherit',
    letterSpacing: isSuperAdmin ? 0.4 : 0,
    textShadow: isSuperAdmin
      ? '0 0 16px rgba(212,175,55,0.12)'
      : 'none',
    fontVariantNumeric: 'tabular-nums',
    transition: 'color 220ms ease, text-shadow 220ms ease',
  }}
>
  {loadingBookings ? '—' : value}
</div>
                  <p
                    style={{
                      color: '#71859a',
                      fontSize: 10,
                      lineHeight: 1.6,
                      marginBottom: 0,
                    }}
                  >
                    {note}
                  </p>
                </section>
              ))}
            </div>

            {isAdmin && activeMenu === 'Dashboard' && (
              <section style={{ ...panelStyle, marginBottom: 18 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 12,
                      color: C.cyan,
                      background: 'rgba(34,211,238,.1)',
                    }}
                  >
                    <ShieldCheck size={21} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, margin: 0 }}>
                      Booking administration
                    </h2>
                    <p
                      style={{
                        color: C.muted,
                        fontSize: 11,
                        margin: '5px 0 0',
                      }}
                    >
                      Review requests and record approval decisions.
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    color: C.muted,
                    fontSize: 12,
                    lineHeight: 1.8,
                  }}
                >
                  Select Pending requests to review applications waiting for
                  your decision. Approved and rejected results are saved by
                  the backend.
                </p>

                <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate('Pending requests')}
                    style={primaryButton}
                  >
                    Review pending <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={() => navigate('All bookings')}
                    style={secondaryButton}
                  >
                    View all bookings
                  </button>
                </div>
              </section>
            )}

            {!isAdmin && activeMenu === 'Dashboard' && (
              <section style={{ ...panelStyle, marginBottom: 18 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 12,
                      color: C.green,
                      background: 'rgba(163,230,53,.1)',
                    }}
                  >
                    <CalendarCheck size={21} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, margin: 0 }}>
                      Your booking activity
                    </h2>
                    <p
                      style={{
                        color: C.muted,
                        fontSize: 11,
                        margin: '5px 0 0',
                      }}
                    >
                      Your requests are retrieved from your account.
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    color: C.muted,
                    fontSize: 12,
                    lineHeight: 1.8,
                    marginBottom: 16,
                  }}
                >
                  Request a booking, check availability, and monitor its status.
                  Every new request starts as pending until an administrator
                  reviews it.
                </p>

                <button
                  onClick={() => navigate('My bookings')}
                  style={secondaryButton}
                >
                  View my bookings <ArrowRight size={15} />
                </button>
              </section>
            )}

            <section style={panelStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <h2 style={{ fontSize: 16, margin: 0 }}>
                    {isAdmin
                      ? activeMenu === 'Pending requests'
                        ? 'Requests awaiting review'
                        : 'Booking records'
                      : activeMenu === 'Dashboard'
                        ? 'Recent bookings'
                        : 'Booking history'}
                  </h2>
                  <p
                    style={{
                      color: C.muted,
                      fontSize: 11,
                      margin: '6px 0 0',
                    }}
                  >
                    Live data from the booking API
                  </p>
                </div>

                {isAdmin && (
                  <span style={{ color: C.cyan, fontSize: 10 }}>
                    <Users
                      size={13}
                      style={{ verticalAlign: 'middle', marginRight: 5 }}
                    />
                    Administrator view
                  </span>
                )}
              </div>

              {loadingBookings ? (
                <div
                  style={{
                    padding: 35,
                    textAlign: 'center',
                    color: C.muted,
                    fontSize: 12,
                  }}
                >
                  <LoaderCircle
                    size={22}
                    className="sh-spin"
                    style={{ display: 'block', margin: '0 auto 10px' }}
                  />
                  Loading booking records...
                </div>
              ) : !bookingsError && filteredBookings.length === 0 ? (
                <div
                  style={{
                    padding: '34px 15px',
                    textAlign: 'center',
                    borderRadius: 10,
                    background: 'rgba(148,163,184,.025)',
                  }}
                >
                  {isAdmin ? (
                    <ClipboardList
                      size={28}
                      color={C.muted}
                      style={{ marginBottom: 8 }}
                    />
                  ) : (
                    <CalendarDays
                      size={28}
                      color={C.muted}
                      style={{ marginBottom: 8 }}
                    />
                  )}

                  <h3 style={{ fontSize: 14, margin: '0 0 7px' }}>
                    {searchText
                      ? 'No matching bookings'
                      : activeMenu === 'Pending requests'
                        ? 'No pending requests'
                        : 'No bookings found'}
                  </h3>

                  <p
                    style={{
                      color: C.muted,
                      fontSize: 11,
                      lineHeight: 1.7,
                      margin: '0 auto 15px',
                      maxWidth: 370,
                    }}
                  >
                    {searchText
                      ? 'Try another search term.'
                      : isAdmin
                        ? 'Booking records returned by the server will appear here.'
                        : 'Your actual booking requests will appear here after you submit one.'}
                  </p>

                  {!isAdmin && !searchText && (
                    <button
                      onClick={() => setShowBookingForm(true)}
                      style={primaryButton}
                    >
                      <Plus size={15} /> Create your first booking
                    </button>
                  )}
                </div>
              ) : (
                <div>
                 
<div
  className={`sh-booking-row ${isSuperAdmin ? 'sh-super-booking-header' : ''}`}
  style={{
    color: isSuperAdmin ? '#f5d778' : '#8194a8',
    fontSize: 10,
    fontWeight: 800,
    ...(isSuperAdmin
      ? {
          background: 'linear-gradient(90deg, rgba(212,175,55,0.08), rgba(10,17,29,0.4))',
          borderBottom: '1px solid rgba(245,215,120,0.3)',
        }
      : {}),
  }}
>

                    <span>BOOKING ID</span>
                    <span>HALL / SPORT</span>
                    <span>{isAdmin ? 'CUSTOMER' : 'DATE'}</span>
                    <span>{isAdmin ? 'DATE / TIME' : 'TIME'}</span>
                    <span>STATUS</span>
                  </div>

                  {filteredBookings
                    .slice(
                      0,
                      !isAdmin && activeMenu === 'Dashboard'
                        ? 5
                        : undefined
                    )
                    .map((booking, index) => {
                      const status = normalizeStatus(booking.status)
                      const isPending = status === 'PENDING'

                      
return (
  <div
    className={`sh-booking-row ${isSuperAdmin ? 'sh-super-booking-record' : ''}`}
    key={booking.id ?? index}
    style={
      isSuperAdmin
        ? {
            borderBottom: '1px solid rgba(245, 215, 120, 0.10)',
            transition:
              'background 220ms ease, border-color 220ms ease, box-shadow 220ms ease',
          }
        : undefined
    }
  >

                          <div>
                            <div
                              style={{
                                color: C.text,
                                fontWeight: 800,
                                fontSize: 11,
                              }}
                            >
                              {booking.id ? `SH-${booking.id}` : 'Booking'}
                            </div>
                            <div
                              style={{
                                color: '#71859a',
                                fontSize: 9,
                                marginTop: 5,
                              }}
                            >
                              Request #{booking.id ?? index + 1}
                            </div>
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                color: '#dce7f1',
                                fontWeight: 750,
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {booking.hallName || 'Sports hall'}
                            </div>
                            <div
                              style={{
                                color: C.muted,
                                fontSize: 10,
                                marginTop: 5,
                              }}
                            >
                              {booking.sport || 'Sport not specified'}
                            </div>
                          </div>

                          <div style={{ color: '#cbd5e1', overflowWrap: 'anywhere' }}>
                            {isAdmin ? (
                              <>
                                <div>{booking.userName || 'User'}</div>
                                <div
                                  style={{
                                    color: C.muted,
                                    fontSize: 9,
                                    marginTop: 4,
                                  }}
                                >
                                  {booking.userEmail || ''}
                                </div>
                              </>
                            ) : (
                              formatDate(booking.bookingDate)
                            )}
                          </div>

                          <div style={{ color: '#cbd5e1' }}>
                            {isAdmin && (
                              <div>{formatDate(booking.bookingDate)}</div>
                            )}
                            <div style={{ marginTop: isAdmin ? 4 : 0 }}>
                              {formatTime(booking.startTime)}
                            </div>
                            <div style={{ color: C.muted, marginTop: 4 }}>
                              {formatTime(booking.endTime)}
                            </div>
                          </div>

                          <div>
                            <StatusBadge
  status={booking.status}
  isSuperAdmin={isSuperAdmin}
/>

                            {isAdmin &&
                              activeMenu !== 'All bookings' &&
                              isPending && (
                                <div
                                  className="sh-action-row"
                                  style={{ marginTop: 9 }}
                                >
                                  <button
                                    className="sh-action sh-approve"
                                    disabled={processingId === booking.id}
                                    onClick={() =>
                                      handleDecision(booking.id, 'approve')
                                    }
                                  >
                                    {processingId === booking.id ? (
                                      <LoaderCircle
                                        size={12}
                                        className="sh-spin"
                                      />
                                    ) : (
                                      <Check size={12} />
                                    )}
                                    Approve
                                  </button>

                                  <button
  className="sh-action sh-reject"
  disabled={processingId === booking.id}
  onClick={() => {
    const reasonType = window.prompt(
      'Enter rejection reason:\n' +
        '1 - Requested time slot unavailable\n' +
        '2 - Sports hall under maintenance\n' +
        '3 - Booking policy violation\n' +
        '4 - Incomplete booking information\n' +
        '5 - Other (custom reason)'
    )

    if (reasonType === null) return

    const reasons = {
      '1': 'SLOT_UNAVAILABLE',
      '2': 'MAINTENANCE',
      '3': 'POLICY_VIOLATION',
      '4': 'INCOMPLETE_INFORMATION',
      '5': 'OTHER',
    }

    const selectedReason = reasons[reasonType.trim()]

    if (!selectedReason) {
      window.alert('Please enter a number from 1 to 5.')
      return
    }

    let customReason = ''

    if (selectedReason === 'OTHER') {
      customReason = window.prompt('Enter the custom rejection reason:') || ''

      if (!customReason.trim()) {
        window.alert('A custom rejection reason is required.')
        return
      }
    }

    handleDecision(
      booking.id,
      'reject',
      selectedReason,
      customReason
    )
  }}
>
  <Ban size={12} />
  Reject
</button>
                                </div>
                              )}

                            {isAdmin &&
                              activeMenu === 'All bookings' &&
                              isPending && (
                                <div
                                  className="sh-action-row"
                                  style={{ marginTop: 9 }}
                                >
                                  <button
                                    className="sh-action sh-approve"
                                    disabled={processingId === booking.id}
                                    onClick={() =>
                                      handleDecision(booking.id, 'approve')
                                    }
                                  >
                                    <Check size={12} /> Approve
                                  </button>
                                 <button
  className="sh-action sh-reject"
  disabled={processingId === booking.id}
  onClick={() => {
    const reasonType = window.prompt(
      'Enter rejection reason:\n' +
        '1 - Requested time slot unavailable\n' +
        '2 - Sports hall under maintenance\n' +
        '3 - Booking policy violation\n' +
        '4 - Incomplete booking information\n' +
        '5 - Other (custom reason)'
    )

    if (reasonType === null) return

    const reasons = {
      '1': 'SLOT_UNAVAILABLE',
      '2': 'MAINTENANCE',
      '3': 'POLICY_VIOLATION',
      '4': 'INCOMPLETE_INFORMATION',
      '5': 'OTHER',
    }

    const selectedReason = reasons[reasonType.trim()]

    if (!selectedReason) {
      window.alert('Please enter a number from 1 to 5.')
      return
    }

    let customReason = ''

    if (selectedReason === 'OTHER') {
      customReason = window.prompt('Enter the custom rejection reason:') || ''

      if (!customReason.trim()) {
        window.alert('A custom rejection reason is required.')
        return
      }
    }

    handleDecision(
      booking.id,
      'reject',
      selectedReason,
      customReason
    )
  }}
>
  <Ban size={12} />
  Reject
</button>
                                </div>
                              )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </section>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 22,
                paddingTop: 16,
                borderTop: `1px solid ${C.border}`,
                color: '#5f7388',
                fontSize: 9,
              }}
            >
              <span>SPORTS HALL BOOKING MANAGEMENT SYSTEM</span>
              <span>Spring Boot + MySQL</span>
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  )
}

export default function App() {
    
  const [showIntro, setShowIntro] = useState(true)
  const [loginMode, setLoginMode] = useState(null)
  const [signedInUser, setSignedInUser] = useState(null)
 const isInvitationPage =
    window.location.pathname === '/accept-admin-invitation'

  if (isInvitationPage) {
    return <AcceptAdminInvitation />
  }
  const finishIntro = useCallback(() => setShowIntro(false), [])

  function handleLoginSuccess(user) {
    setSignedInUser(user)
    setLoginMode(null)
  }

  function handleLogout() {
    setSignedInUser(null)
    setLoginMode(null)
    setShowIntro(false)
  }

  return (
    <div style={pageStyle}>
      <AnimatePresence mode="wait">
        {showIntro ? (
          <Intro key="intro" onFinish={finishIntro} />
        ) : signedInUser ? (
          <Dashboard
           key={`${signedInUser.email}-${signedInUser.isSuperAdmin ? 'super-admin' : signedInUser.isAdmin ? 'admin' : 'user'}`}
            user={signedInUser}
            onLogout={handleLogout}
          />
        ) : (
          <Portal
            key="portal"
            onOpenLogin={setLoginMode}
            onReplay={() => setShowIntro(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loginMode && !signedInUser && (
          <LoginModal
            key={`login-${loginMode}`}
            mode={loginMode}
            onClose={() => setLoginMode(null)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}


function AcceptAdminInvitation() {
  const invitationToken = new URLSearchParams(
    window.location.search
  ).get('token')

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (!invitationToken) {
      setMessage('Invitation token is missing. Please use the link from your invitation email.')
      return
    }

    if (fullName.trim().length === 0) {
      setMessage('Please enter your full name.')
      return
    }

    if (password.length < 12 || password.length > 72) {
      setMessage('Your password must contain 12 to 72 characters.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('The passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:8080/api/auth/admin-invitations/accept',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: invitationToken,
            fullName: fullName.trim(),
            password,
          }),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Could not accept the invitation.')
      }

      setSuccess(true)
      setMessage(data.message || 'Admin account created successfully.')
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setMessage(
        error.message || 'Could not connect to the backend. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: '#050b17',
        color: '#f1f5f9',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 440,
          boxSizing: 'border-box',
          padding: 28,
          border: '1px solid #243449',
          borderRadius: 18,
          background: '#0c1728',
        }}
      >
        <div style={{ color: '#22d3ee', fontSize: 12, fontWeight: 700 }}>
          SPORTS HALL BOOKING SYSTEM
        </div>

        <h1 style={{ fontSize: 26, marginBottom: 8 }}>
          Accept Admin Invitation
        </h1>

        <p style={{ color: '#a7b4c7', lineHeight: 1.6, fontSize: 14 }}>
          Create your administrator account using the invitation sent to your email.
        </p>

        {success ? (
          <>
            <p role="status" style={{ color: '#34d399', lineHeight: 1.6 }}>
              {message}
            </p>
            <button
              type="button"
              onClick={() => {
                window.history.replaceState({}, '', '/')
                window.location.reload()
              }}
              style={{
                width: '100%',
                padding: 13,
                border: 0,
                borderRadius: 9,
                background: '#22d3ee',
                color: '#06202a',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Continue to website login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="invite-full-name">Full name</label>
            <input
              id="invite-full-name"
              autoComplete="name"
              required
              maxLength={100}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              style={invitationInputStyle}
              placeholder="Enter your full name"
            />

            <label htmlFor="invite-password">Create password</label>
            
<div style={{ position: 'relative', margin: '8px 0 18px' }}>
  <input
    id="invite-password"
    type={showPassword ? 'text' : 'password'}
    autoComplete="new-password"
    required
    minLength={12}
    maxLength={72}
    value={password}
    onChange={e => setPassword(e.target.value)}
    style={{ ...invitationInputStyle, margin: 0, paddingRight: 48 }}
    placeholder="At least 12 characters"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? 'Hide password' : 'Show password'}
    style={{
      position: 'absolute', right: 10, top: '50%',
      transform: 'translateY(-50%)', background: 'transparent',
      border: 0, color: '#f1f5f9', cursor: 'pointer', fontSize: 18,
    }}
  >
    {showPassword ? '🙈' : '👁️'}
  </button>
</div>


            <label htmlFor="invite-confirm-password">Confirm password</label>
            
<div style={{ position: 'relative', margin: '8px 0 18px' }}>
  <input
    id="invite-confirm-password"
    type={showConfirmPassword ? 'text' : 'password'}
    autoComplete="new-password"
    required
    minLength={12}
    maxLength={72}
    value={confirmPassword}
    onChange={e => setConfirmPassword(e.target.value)}
    style={{ ...invitationInputStyle, margin: 0, paddingRight: 48 }}
    placeholder="Enter the same password again"
  />
  <button
    type="button"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
    style={{
      position: 'absolute', right: 10, top: '50%',
      transform: 'translateY(-50%)', background: 'transparent',
      border: 0, color: '#f1f5f9', cursor: 'pointer', fontSize: 18,
    }}
  >
    {showConfirmPassword ? '🙈' : '👁️'}
  </button>
</div>


            {message && (
              <p
                role="alert"
                style={{
                  color: success ? '#34d399' : '#fca5a5',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: 18,
                padding: 14,
                border: 0,
                borderRadius: 9,
                background: '#22d3ee',
                color: '#06202a',
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating account...' : 'Create Admin Account'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}

const invitationInputStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  margin: '8px 0 18px',
  padding: 12,
  border: '1px solid #334155',
  borderRadius: 8,
  background: '#07111f',
  color: '#f1f5f9',
  fontSize: 14,
}
