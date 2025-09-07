import { z } from 'zod'

// User schemas
export const userSchema = z.object({
  username: z.string()
    .min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد')
    .max(50, 'نام کاربری نباید بیش از ۵۰ کاراکتر باشد')
    .regex(/^[a-zA-Z0-9_]+$/, 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و _ باشد'),
  password: z.string()
    .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد')
    .max(100, 'رمز عبور نباید بیش از ۱۰۰ کاراکتر باشد'),
  role: z.string().refine(
    (val) => ['ADMIN', 'VICE_PRINCIPAL', 'TEACHER', 'FINANCE'].includes(val),
    { message: 'نقش کاربری معتبر نیست' }
  ),
  firstName: z.string()
    .min(1, 'نام الزامی است')
    .max(50, 'نام نباید بیش از ۵۰ کاراکتر باشد')
    .optional(),
  lastName: z.string()
    .min(1, 'نام خانوادگی الزامی است')
    .max(50, 'نام خانوادگی نباید بیش از ۵۰ کاراکتر باشد')
    .optional(),
  email: z.string()
    .email('ایمیل معتبر وارد کنید')
    .optional()
    .or(z.literal(''))
})

export const updateUserSchema = userSchema.partial().omit({ password: true }).extend({
  password: z.string()
    .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد')
    .optional(),
  isActive: z.boolean().optional()
})

export const loginSchema = z.object({
  username: z.string().min(1, 'نام کاربری الزامی است'),
  password: z.string().min(1, 'رمز عبور الزامی است')
})

// Student schemas
export const studentSchema = z.object({
  firstName: z.string()
    .min(1, 'نام الزامی است')
    .max(50, 'نام نباید بیش از ۵۰ کاراکتر باشد'),
  lastName: z.string()
    .min(1, 'نام خانوادگی الزامی است')
    .max(50, 'نام خانوادگی نباید بیش از ۵۰ کاراکتر باشد'),
  fatherName: z.string()
    .min(1, 'نام پدر الزامی است')
    .max(50, 'نام پدر نباید بیش از ۵۰ کاراکتر باشد'),
  nationalId: z.string()
    .min(10, 'کد ملی باید ۱۰ رقم باشد')
    .max(10, 'کد ملی باید ۱۰ رقم باشد')
    .regex(/^\d{10}$/, 'کد ملی باید شامل ۱۰ رقم باشد'),
  birthDate: z.string()
    .min(1, 'تاریخ تولد الزامی است'),
  grade: z.number()
    .int('پایه باید عدد صحیح باشد')
    .min(1, 'پایه باید حداقل ۱ باشد')
    .max(12, 'پایه نباید بیش از ۱۲ باشد'),
  section: z.string()
    .min(1, 'بخش الزامی است')
    .max(10, 'بخش نباید بیش از ۱۰ کاراکتر باشد'),
  classId: z.number()
    .int('شناسه کلاس باید عدد صحیح باشد')
    .positive('شناسه کلاس باید مثبت باشد'),
  phone: z.string()
    .regex(/^(\+98|0)?9\d{9}$/, 'شماره تلفن معتبر نیست')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('ایمیل معتبر وارد کنید')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(200, 'آدرس نباید بیش از ۲۰۰ کاراکتر باشد')
    .optional()
    .or(z.literal(''))
})

export const updateStudentSchema = studentSchema.partial().extend({
  isActive: z.boolean().optional()
})

// Teacher schemas
export const teacherSchema = z.object({
  employeeId: z.string()
    .min(1, 'شماره پرسنلی الزامی است')
    .max(20, 'شماره پرسنلی نباید بیش از ۲۰ کاراکتر باشد'),
  firstName: z.string()
    .min(1, 'نام الزامی است')
    .max(50, 'نام نباید بیش از ۵۰ کاراکتر باشد'),
  lastName: z.string()
    .min(1, 'نام خانوادگی الزامی است')
    .max(50, 'نام خانوادگی نباید بیش از ۵۰ کاراکتر باشد'),
  nationalId: z.string()
    .min(10, 'کد ملی باید ۱۰ رقم باشد')
    .max(10, 'کد ملی باید ۱۰ رقم باشد')
    .regex(/^\d{10}$/, 'کد ملی باید شامل ۱۰ رقم باشد'),
  phone: z.string()
    .regex(/^(\+98|0)?9\d{9}$/, 'شماره تلفن معتبر نیست'),
  email: z.string()
    .email('ایمیل معتبر وارد کنید')
    .optional()
    .or(z.literal(''))
})

export const updateTeacherSchema = teacherSchema.partial().extend({
  isActive: z.boolean().optional()
})

// Class schemas
export const classSchema = z.object({
  grade: z.number()
    .int('پایه باید عدد صحیح باشد')
    .min(1, 'پایه باید حداقل ۱ باشد')
    .max(12, 'پایه نباید بیش از ۱۲ باشد'),
  section: z.string()
    .min(1, 'بخش الزامی است')
    .max(10, 'بخش نباید بیش از ۱۰ کاراکتر باشد'),
  teacherId: z.number()
    .int('شناسه معلم باید عدد صحیح باشد')
    .positive('شناسه معلم باید مثبت باشد'),
  capacity: z.number()
    .int('ظرفیت باید عدد صحیح باشد')
    .min(1, 'ظرفیت باید حداقل ۱ باشد')
    .max(50, 'ظرفیت نباید بیش از ۵۰ باشد')
    .default(30)
})

export const updateClassSchema = classSchema.partial().extend({
  isActive: z.boolean().optional()
})

// Payment schemas
export const paymentSchema = z.object({
  studentId: z.number()
    .int('شناسه دانش‌آموز باید عدد صحیح باشد')
    .positive('شناسه دانش‌آموز باید مثبت باشد'),
  amount: z.number()
    .positive('مبلغ باید مثبت باشد')
    .max(100000000, 'مبلغ بیش از حد مجاز است'),
  dueDate: z.string()
    .min(1, 'تاریخ سررسید الزامی است'),
  type: z.string().refine(
    (val) => ['TUITION', 'FEES', 'BOOKS', 'UNIFORM', 'TRANSPORT', 'MEALS', 'OTHER'].includes(val),
    { message: 'نوع پرداخت معتبر نیست' }
  ),
  description: z.string()
    .max(200, 'توضیحات نباید بیش از ۲۰۰ کاراکتر باشد')
    .optional()
    .or(z.literal(''))
})

export const updatePaymentSchema = paymentSchema.partial().extend({
  status: z.string().refine(
    (val) => ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'].includes(val),
    { message: 'وضعیت پرداخت معتبر نیست' }
  ).optional(),
  paidDate: z.string().optional()
})

// Attendance schemas
export const attendanceSchema = z.object({
  studentId: z.number()
    .int('شناسه دانش‌آموز باید عدد صحیح باشد')
    .positive('شناسه دانش‌آموز باید مثبت باشد'),
  classId: z.number()
    .int('شناسه کلاس باید عدد صحیح باشد')
    .positive('شناسه کلاس باید مثبت باشد'),
  date: z.string()
    .min(1, 'تاریخ الزامی است'),
  status: z.string().refine(
    (val) => ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(val),
    { message: 'وضعیت حضور معتبر نیست' }
  ),
  notes: z.string()
    .max(200, 'یادداشت نباید بیش از ۲۰۰ کاراکتر باشد')
    .optional()
    .or(z.literal(''))
})

export const bulkAttendanceSchema = z.object({
  classId: z.number()
    .int('شناسه کلاس باید عدد صحیح باشد')
    .positive('شناسه کلاس باید مثبت باشد'),
  date: z.string()
    .min(1, 'تاریخ الزامی است'),
  updates: z.array(z.object({
    studentId: z.number()
      .int('شناسه دانش‌آموز باید عدد صحیح باشد')
      .positive('شناسه دانش‌آموز باید مثبت باشد'),
    status: z.string().refine(
      (val) => ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(val),
      { message: 'وضعیت حضور معتبر نیست' }
    ),
    notes: z.string().optional()
  })).min(1, 'حداقل یک دانش‌آموز باید انتخاب شود')
})

// Audit log schema
export const auditLogSchema = z.object({
  action: z.string().min(1, 'عملیات الزامی است'),
  model: z.string().min(1, 'مدل الزامی است'),
  recordId: z.number().optional(),
  oldValues: z.string().optional(),
  newValues: z.string().optional(),
  userId: z.number().int().positive('شناسه کاربر باید مثبت باشد'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
})

// Food service schemas
export const mealServiceSchema = z.object({
  date: z.string().min(1, 'تاریخ الزامی است'),
  mealType: z.string().refine(
    (val) => ['BREAKFAST', 'LUNCH', 'SNACK'].includes(val),
    { message: 'نوع وعده غذایی معتبر نیست' }
  ),
  menuItems: z.string()
    .min(1, 'آیتم‌های منو الزامی است')
    .max(500, 'آیتم‌های منو نباید بیش از ۵۰۰ کاراکتر باشد'),
  price: z.number()
    .min(0, 'قیمت نمی‌تواند منفی باشد')
    .max(1000000, 'قیمت بیش از حد مجاز است'),
  maxOrders: z.number()
    .int('حداکثر سفارشات باید عدد صحیح باشد')
    .min(1, 'حداکثر سفارشات باید حداقل ۱ باشد')
    .max(500, 'حداکثر سفارشات نباید بیش از ۵۰۰ باشد')
    .default(100)
})

export const updateMealServiceSchema = mealServiceSchema.partial().extend({
  isActive: z.boolean().optional()
})

// Transportation service schemas
export const transportServiceSchema = z.object({
  routeName: z.string()
    .min(1, 'نام مسیر الزامی است')
    .max(100, 'نام مسیر نباید بیش از ۱۰۰ کاراکتر باشد'),
  driverName: z.string()
    .min(1, 'نام راننده الزامی است')
    .max(50, 'نام راننده نباید بیش از ۵۰ کاراکتر باشد'),
  vehicleNumber: z.string()
    .min(1, 'شماره خودرو الزامی است')
    .max(20, 'شماره خودرو نباید بیش از ۲۰ کاراکتر باشد'),
  capacity: z.number()
    .int('ظرفیت باید عدد صحیح باشد')
    .min(1, 'ظرفیت باید حداقل ۱ باشد')
    .max(50, 'ظرفیت نباید بیش از ۵۰ باشد')
    .default(20),
  pickupTime: z.string()
    .min(1, 'زمان جمع‌آوری الزامی است')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'فرمت زمان معتبر نیست (HH:MM)'),
  dropoffTime: z.string()
    .min(1, 'زمان رسیدن الزامی است')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'فرمت زمان معتبر نیست (HH:MM)'),
  pickupPoints: z.string()
    .min(1, 'نقاط جمع‌آوری الزامی است')
    .max(1000, 'نقاط جمع‌آوری نباید بیش از ۱۰۰۰ کاراکتر باشد'),
  monthlyFee: z.number()
    .min(0, 'هزینه ماهانه نمی‌تواند منفی باشد')
    .max(10000000, 'هزینه ماهانه بیش از حد مجاز است')
})

export const updateTransportServiceSchema = transportServiceSchema.partial().extend({
  isActive: z.boolean().optional()
})

// Student meal subscription schema
export const studentMealSubscriptionSchema = z.object({
  studentId: z.number()
    .int('شناسه دانش‌آموز باید عدد صحیح باشد')
    .positive('شناسه دانش‌آموز باید مثبت باشد'),
  mealType: z.string().refine(
    (val) => ['BREAKFAST', 'LUNCH', 'SNACK', 'ALL'].includes(val),
    { message: 'نوع وعده غذایی معتبر نیست' }
  ),
  startDate: z.string().min(1, 'تاریخ شروع الزامی است'),
  endDate: z.string().optional()
})

// Student transport assignment schema
export const studentTransportAssignmentSchema = z.object({
  studentId: z.number()
    .int('شناسه دانش‌آموز باید عدد صحیح باشد')
    .positive('شناسه دانش‌آموز باید مثبت باشد'),
  transportId: z.number()
    .int('شناسه سرویس باید عدد صحیح باشد')
    .positive('شناسه سرویس باید مثبت باشد'),
  startDate: z.string().min(1, 'تاریخ شروع الزامی است'),
  endDate: z.string().optional(),
  pickupPoint: z.string()
    .min(1, 'نقطه جمع‌آوری الزامی است')
    .max(200, 'نقطه جمع‌آوری نباید بیش از ۲۰۰ کاراکتر باشد')
})

// Export all schemas for convenience
export const schemas = {
  user: userSchema,
  updateUser: updateUserSchema,
  login: loginSchema,
  student: studentSchema,
  updateStudent: updateStudentSchema,
  teacher: teacherSchema,
  updateTeacher: updateTeacherSchema,
  class: classSchema,
  updateClass: updateClassSchema,
  payment: paymentSchema,
  updatePayment: updatePaymentSchema,
  attendance: attendanceSchema,
  bulkAttendance: bulkAttendanceSchema,
  auditLog: auditLogSchema,
  mealService: mealServiceSchema,
  updateMealService: updateMealServiceSchema,
  transportService: transportServiceSchema,
  updateTransportService: updateTransportServiceSchema,
  studentMealSubscription: studentMealSubscriptionSchema,
  studentTransportAssignment: studentTransportAssignmentSchema
}

// Type exports for TypeScript
export type UserInput = z.infer<typeof userSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type StudentInput = z.infer<typeof studentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
export type TeacherInput = z.infer<typeof teacherSchema>
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>
export type ClassInput = z.infer<typeof classSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>
export type AttendanceInput = z.infer<typeof attendanceSchema>
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>
export type AuditLogInput = z.infer<typeof auditLogSchema>
export type MealServiceInput = z.infer<typeof mealServiceSchema>
export type UpdateMealServiceInput = z.infer<typeof updateMealServiceSchema>
export type TransportServiceInput = z.infer<typeof transportServiceSchema>
export type UpdateTransportServiceInput = z.infer<typeof updateTransportServiceSchema>
export type StudentMealSubscriptionInput = z.infer<typeof studentMealSubscriptionSchema>
export type StudentTransportAssignmentInput = z.infer<typeof studentTransportAssignmentSchema>
