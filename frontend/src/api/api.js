
const API_BASE_URL = 'http://localhost:8080/api'

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        data.detail ||
        `Request failed with status ${response.status}`
    )
  }

  return data
}

export function registerUser({ fullName, email, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  })
}

export function sendOtp(email) {
  return request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function verifyOtp(email, otp) {
  return request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  })
}

export function loginUser(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getCurrentUser() {
  return request('/test/me', {
    method: 'GET',
  })
}

export function checkBookingAvailability({
  hallName,
  bookingDate,
  startTime,
  endTime,
}) {
  const params = new URLSearchParams({
    hallName,
    bookingDate,
    startTime,
    endTime,
  })

  return request(`/bookings/availability?${params.toString()}`, {
    method: 'GET',
  })
}

export function createBooking({
  hallName,
  sport,
  bookingDate,
  startTime,
  endTime,
}) {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      hallName,
      sport,
      bookingDate,
      startTime,
      endTime,
    }),
  })
}

export function getMyBookings() {
  return request('/bookings/my', {
    method: 'GET',
  })
}

export function getAllAdminBookings() {
  return request('/admin/bookings', {
    method: 'GET',
  })
}

export function getPendingAdminBookings() {
  return request('/admin/bookings/pending', {
    method: 'GET',
  })
}

export function approveBooking(bookingId) {
  return request(`/admin/bookings/${bookingId}/approve`, {
    method: 'PATCH',
  })
}

export function rejectBooking(bookingId, reasonType, customReason = '') {
  return request(`/admin/bookings/${bookingId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({
      reasonType,
      customReason,
    }),
  })
}
