export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const UPLOAD_URL = '/uploads';

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  emailVerified: boolean;
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
  instructorStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  emailVerified: boolean;
  avatarId: string | null;
};

export type University = {
  id: string;
  name: string;
  abbreviation: string;
  state: string;
  location: string;
  type: 'FEDERAL' | 'STATE' | 'PRIVATE' | 'MILITARY';
  founded: number;
};

export type EnrolledCourse = {
  id: string;
  title: string;
  description: string;
  priceKobo: number;
  status: string;
  thumbnailUrl: string;
  instructorName: string;
  enrolledAt: string;
  progress: {
    totalLessons: number;
    completedLessons: number;
    percent: number;
  };
};

export type CourseProgressResponse = {
  course: {
    id: string;
    title: string;
    thumbnailUrl: string;
    instructorName: string;
  };
  totalLessons: number;
  completedLessons: number;
  percent: number;
  sections: Section[];
};

export type Section = {
  id: string;
  title: string;
  order: number;
  description: string | null;
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  title: string;
  type: 'YOUTUBE' | 'PDF';
  order: number;
  durationText: string | null;
  completed: boolean;
  isFreePreview?: boolean; // Available in public view
};

export type PublicCourse = {
  id: string;
  title: string;
  courseCode?: string;
  description: string;
  priceKobo: number;
  language: string;
  status?: string;
  createdAt?: string;
  whatYouWillLearn: string[];
  thumbnailId: string | null;
  previewVideoId: string | null;
  instructor: {
    id?: string;
    fullName: string;
    avatarId: string | null;
    instructorProfile: {
      department: string;
      level?: string;
      bio?: string;
    };
  };
  _count: {
    enrollments: number;
    lessons?: number;
    sections?: number;
  };
  sections: Section[];
};

export type LessonContent = {
  id: string;
  title: string;
  type: 'YOUTUBE' | 'PDF';
  videoId?: string;
  pdfFileId?: string;
  pdfAccessUrl?: string; // Add this if needed
  order: number;
  courseTitle: string;
  sectionId: string;
  sectionTitle: string;
  totalLessons: number;
  completed: boolean;
  isFreePreview?: boolean;
};

export type InstructorApplication = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  university: string;
  department: string;
  level: string;
  courseTitle: string;
  courseCode: string;
  semester: string;
  grade: string;
  estimatedStudentCount: number;
  studentsStruggle: boolean;
  struggleExplanation: string | null;
  whyStudentsStruggle: string | null;
  rejectionReason: string | null;
  studentIdCardFile: { id: string; createdAt: string } | null;
  proofOfResultFile: { id: string; createdAt: string } | null;
};

export type InstructorApplicationPayload = {
  university: string;
  department: string;
  level: string;
  studentIdCardFileId: string;
  courseTitle: string;
  courseCode: string;
  semester: string;
  grade: string;
  proofOfResultFileId: string;
  estimatedStudentCount: number;
  studentsStruggle: boolean;
  struggleExplanation?: string;
  whyStudentsStruggle: string;
};

export type InstructorCreateCoursePayload = {
  title: string;
  description: string;
  priceKobo: number;
  courseCode: string;
  thumbnailId?: string;
  language: string;
  whatYouWillLearn: string[];
  previewVideoId?: string;
};

export type InstructorAddLessonPayload = {
  title: string;
  type: 'YOUTUBE' | 'PDF';
  videoId?: string;
  pdfFileId?: string;
  durationText?: string;
  isFreePreview?: boolean;
};

// ── Orders ───────────────────────────────────────────────────
export type OrderItem = {
  id: string;
  priceKobo: number;
  courseTitle: string; // The backend now provides a flat string instead of a full course block
  courseId?: string;
};

export type Order = {
  id: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED';
  totalKobo: number;
  currency: string;
  paymentReference: string;
  createdAt: string;
  items: OrderItem[];
};

export type CartItem = {
  id: string;
  courseId: string;
  title: string;
  priceKobo: number;
  instructorName: string;
  addedAt?: string;
  thumbnailUrl?: string; // Optional if not returned in this endpoint but needed in UI
};

export type Cart = {
  id?: string;
  totalKobo: number; // Changed from cartTotalKobo based on user JSON
  items: CartItem[];
};

// ── Profile ───────────────────────────────────────────────────
export type ProfileUpdatePayload = {
  fullName?: string;
  avatarId?: string;
  bio?: string;
  universityId?: string;
  department?: string;
  level?: string;
  avatar?: File;
};

// ── Bank & Payouts ────────────────────────────────────────────
export type Bank = {
  id: number;
  code: string;
  name: string;
  slug: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
};

export type ResolveAccountResponse = {
  verified: boolean;
  accountName?: string;
  message?: string;
};

export type PayoutProfile = {
  id: string;
  instructorId: string;
  bankName: string;
  accountName: string;
  accountNumberLast4: string;
  createdAt: string;
  updatedAt: string;
};

// ── Instructor Wallet & Analytics ───────────────────────────────
export type LedgerEntry = {
  id: string;
  instructorId?: string;
  amountKobo: number;
  entryType: 'CREDIT' | 'DEBIT';
  reason: string;
  referenceId: string;
  meta?: any;
  createdAt: string;
  description: string;
};

export type InstructorEarningsResponse = {
  grossSalesKobo: number;
  netShareKobo: number;
  withdrawnKobo: number;
  refundsKobo: number;
  currentBalanceKobo: number;
  recent: LedgerEntry[];
};

export type PayoutRequest = {
  id: string;
  instructorId?: string;
  amountKobo: number;
  status: 'REQUESTED' | 'PAID' | 'REJECTED';
  bankNameSnapshot: string;
  accountNameSnapshot: string;
  accountNumberLast4Snapshot: string;
  requestedAt: string;
  processedAt?: string | null;
  adminNote?: string | null;
  proofFileId?: string | null;
};

export type InstructorAnalyticsCourse = {
  id: string;
  title: string;
  status: string;
  lessonsCount: number;
  studentCount: number;
  revenueKobo: number;
  avgCompletion: number;
  thumbnailId?: string | null;
};

export type InstructorAnalyticsResponse = {
  summary: {
    totalStudents: number;
    totalCourses: number;
    grossSalesKobo: number;
    netProfitKobo: number;
  };
  courses: InstructorAnalyticsCourse[];
};

// ── Token helpers ──────────────────────────────────────────────
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

// ── Refresh mutex ──────────────────────────────────────────────
let isRefreshing = false;
let refreshPromise: Promise<AuthResponse> | null = null;

async function refreshTokens(): Promise<AuthResponse> {
  const rt = getRefreshToken();
  if (!rt) throw new Error('No refresh token');

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(extractErrorMessage(data));
  return data as AuthResponse;
}

// ── Parse backend errors ───────────────────────────────────────
function extractErrorMessage(data: any): string {
  // Backend format: { error: { message: string | string[] } } or { message: string | string[] }
  const raw = data?.error?.message ?? data?.message;
  if (Array.isArray(raw)) return raw.join('. ');
  if (typeof raw === 'string') return raw;
  return 'Something went wrong';
}

// ── Base request (no auth) ─────────────────────────────────────
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(extractErrorMessage(data));
  return data as T;
}

// ── Authenticated request (auto-refresh on 401) ───────────────
async function authenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  const makeRequest = (accessToken: string | null) => {
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };
    return fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  let res = await makeRequest(token);

  // If 401, try refreshing
  if (res.status === 401) {
    try {
      // Prevent multiple concurrent refreshes
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshTokens();
      }

      const refreshed = await refreshPromise!;
      setTokens(refreshed.accessToken, refreshed.refreshToken);
      isRefreshing = false;
      refreshPromise = null;

      // Retry with new token
      res = await makeRequest(refreshed.accessToken);
    } catch {
      isRefreshing = false;
      refreshPromise = null;
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(extractErrorMessage(data));
  return data as T;
}

// ── Public API ─────────────────────────────────────────────────
export const authApi = {
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  signUp: (payload: { fullName: string; email: string; universityId: string; password: string }) =>
    request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),

  verifyEmail: (payload: { email: string; otp: string }) =>
    request<{ message: string }>('/auth/verify-email', { method: 'POST', body: JSON.stringify(payload) }),

  resendVerification: (payload: { email: string }) =>
    request<{ message: string }>('/auth/resend-verification', { method: 'POST', body: JSON.stringify(payload) }),

  forgotPassword: (payload: { email: string }) =>
    request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),

  resetPassword: (payload: { email: string; otp: string; newPassword: string }) =>
    request<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

  refresh: (payload: { refreshToken: string }) =>
    request<AuthResponse>('/auth/refresh', { method: 'POST', body: JSON.stringify(payload) }),

  getMe: (accessToken: string) =>
    request<User>('/users/me', { headers: { Authorization: `Bearer ${accessToken}` } }),

  getGoogleUrl: () =>
    request<{ url: string }>('/auth/google/url'),

  exchangeGoogleCode: (payload: { code: string; redirectUri?: string }) =>
    request<AuthResponse>('/auth/google/exchange', { method: 'POST', body: JSON.stringify(payload) }),

  getUniversities: (type?: string) =>
    request<University[]>(type ? `/universities?type=${type}` : '/universities'),

  // Authenticated endpoints (auto-refresh)
  getMeAuthenticated: () =>
    authenticatedRequest<User>('/users/me'),

  getMyCourses: () =>
    authenticatedRequest<EnrolledCourse[]>('/payments/me/courses'),

  getCourseLessons: (courseId: string) =>
    authenticatedRequest<CourseProgressResponse>(`/progress/courses/${courseId}/lessons`),

  getLessonContent: (courseId: string, lessonId: string, playbackToken?: string) => {
    const url = playbackToken
      ? `/courses/${courseId}/lessons/${lessonId}/content?playbackToken=${playbackToken}`
      : `/courses/${courseId}/lessons/${lessonId}/content`;
    return authenticatedRequest<LessonContent>(url);
  },

  getPlaybackToken: (courseId: string, lessonId: string) =>
    authenticatedRequest<{ playbackToken: string; expiresInSeconds: number }>(`/courses/${courseId}/lessons/${lessonId}/playback-token`, { method: 'POST' }),

  markLessonComplete: (lessonId: string) =>
    authenticatedRequest<{ message: string }>(`/progress/lessons/${lessonId}/complete`, { method: 'POST' }),

  getPublicCourses: () =>
    request<PublicCourse[]>('/courses/public'),

  getPublicCourse: (courseId: string) =>
    request<PublicCourse>(`/courses/public/${courseId}`),

  // Explore endpoints (authenticated)
  getExploreCourses: () =>
    authenticatedRequest<PublicCourse[]>('/courses/explore'),

  getExploreCourse: (courseId: string) =>
    authenticatedRequest<PublicCourse>(`/courses/explore/${courseId}`),

  // Cart & Checkout
  addToCart: (courseId: string) =>
    authenticatedRequest<Cart>('/carts', { method: 'POST', body: JSON.stringify({ courseId }) }),

  getCart: () =>
    authenticatedRequest<Cart>('/carts'),

  removeFromCart: (courseId: string) =>
    authenticatedRequest<Cart>(`/carts/${courseId}`, { method: 'DELETE' }),

  clearCart: () =>
    authenticatedRequest<{ message: string }>('/carts', { method: 'DELETE' }),

  // 5-Step Flow:
  // Step 3: Bundle cart into an Order
  checkoutCart: () =>
    authenticatedRequest<{ id: string; status: string; totalKobo: number }>('/payments/checkout-cart', { method: 'POST' }),

  // Step 4: Initialize the generated Order with Paystack
  initializePayment: (orderId: string) =>
    authenticatedRequest<{ authorizationUrl: string; reference: string }>(`/payments/orders/${orderId}/initialize`, { method: 'POST' }),

  // Instructor Application
  getInstructorApplication: () =>
    authenticatedRequest<InstructorApplication | null>('/instructor/application'),

  submitInstructorApplication: (payload: InstructorApplicationPayload, files?: { studentIdCard?: File; proofOfResult?: File }) => {
    const formData = new FormData();
    formData.append('university', payload.university);
    formData.append('department', payload.department);
    formData.append('level', payload.level);
    formData.append('courseTitle', payload.courseTitle);
    formData.append('courseCode', payload.courseCode);
    formData.append('semester', payload.semester);
    formData.append('grade', payload.grade);
    formData.append('estimatedStudentCount', String(payload.estimatedStudentCount));
    formData.append('studentsStruggle', String(payload.studentsStruggle));
    if (payload.struggleExplanation) formData.append('struggleExplanation', payload.struggleExplanation);
    formData.append('whyStudentsStruggle', payload.whyStudentsStruggle);
    // Inline files
    if (files?.studentIdCard) formData.append('studentIdCard', files.studentIdCard);
    if (files?.proofOfResult) formData.append('proofOfResult', files.proofOfResult);
    // Backward compat: if no inline files, use the IDs
    if (!files?.studentIdCard && payload.studentIdCardFileId) formData.append('studentIdCardFileId', payload.studentIdCardFileId);
    if (!files?.proofOfResult && payload.proofOfResultFileId) formData.append('proofOfResultFileId', payload.proofOfResultFileId);
    return authenticatedRequest<{ message: string }>('/instructor/apply', { method: 'POST', body: formData });
  },

  // Bank & Payout
  getBanks: () =>
    request<Bank[]>('/payments/banks'),

  resolveAccount: (accountNumber: string, bankCode: string) =>
    authenticatedRequest<ResolveAccountResponse>(`/payments/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`),

  savePayoutProfile: (payload: { bankName: string; accountName: string; accountNumber: string }) =>
    authenticatedRequest<PayoutProfile>('/instructor/payout-profile', { method: 'PUT', body: JSON.stringify(payload) }),

  getPayoutProfile: () =>
    authenticatedRequest<PayoutProfile | null>('/instructor/payout-profile'),

  // Profile Settings
  updateProfile: (payload: ProfileUpdatePayload) => {
    const formData = new FormData();
    if (payload.fullName) formData.append('fullName', payload.fullName);
    if (payload.bio) formData.append('bio', payload.bio);
    if (payload.universityId) formData.append('universityId', payload.universityId);
    if (payload.department) formData.append('department', payload.department);
    if (payload.level) formData.append('level', payload.level);
    if (payload.avatar) formData.append('avatar', payload.avatar);
    // Backward compat
    if (payload.avatarId) formData.append('avatarId', payload.avatarId);
    return authenticatedRequest<User>('/users/me/profile', { method: 'PATCH', body: formData });
  },

  // Order History
  getOrders: () =>
    authenticatedRequest<Order[]>('/payments/me/orders'),

  // Instructor Wallet & Analytics
  getInstructorEarnings: () =>
    authenticatedRequest<InstructorEarningsResponse>('/wallet/instructor/earnings'),

  requestWithdrawal: (amountKobo: number) =>
    authenticatedRequest<PayoutRequest>('/instructor/payouts/request', { method: 'POST', body: JSON.stringify({ amountKobo }) }),

  getPayoutRequests: () =>
    authenticatedRequest<PayoutRequest[]>('/instructor/payouts'),

  getInstructorAnalytics: () =>
    authenticatedRequest<InstructorAnalyticsResponse>('/instructor/analytics'),

  // Course Management (Instructor)
  getInstructorCourses: () =>
    authenticatedRequest<PublicCourse[]>('/courses/instructor/mine'),

  getInstructorCourse: (id: string) =>
    authenticatedRequest<PublicCourse>(`/courses/instructor/${id}`),

  createCourse: (payload: InstructorCreateCoursePayload, thumbnailFile?: File) => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('priceKobo', Math.floor(Number(payload.priceKobo) || 0).toString());
    formData.append('courseCode', payload.courseCode);
    formData.append('language', payload.language);
    if (payload.whatYouWillLearn) {
      payload.whatYouWillLearn.forEach(item => formData.append('whatYouWillLearn', item));
    }
    if (payload.previewVideoId) formData.append('previewVideoId', payload.previewVideoId);
    // Inline file upload
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
    // Backward compat
    if (!thumbnailFile && payload.thumbnailId) formData.append('thumbnailId', payload.thumbnailId);
    return authenticatedRequest<PublicCourse>('/courses/instructor', { method: 'POST', body: formData });
  },

  addSection: (courseId: string, title: string) =>
    authenticatedRequest<Section>(`/courses/instructor/${courseId}/sections`, { method: 'POST', body: JSON.stringify({ title }) }),

  addLesson: (courseId: string, sectionId: string, payload: InstructorAddLessonPayload) =>
    authenticatedRequest<Lesson>(`/courses/instructor/${courseId}/sections/${sectionId}/lessons`, { method: 'POST', body: JSON.stringify(payload) }),

  submitCourseForApproval: (courseId: string) =>
    authenticatedRequest<{ message: string }>(`/courses/instructor/${courseId}/submit`, { method: 'POST' }),

  // File Upload (uses FormData, not JSON)
  uploadFile: async (file: File, isPublic: boolean): Promise<{ id: string }> => {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPublic', String(isPublic));
    const res = await fetch(`${BASE_URL}/uploads`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Upload failed');
    return data as { id: string };
  },
};