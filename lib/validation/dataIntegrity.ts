// Data Integrity Validation Library
// Prevents duplicate entries and ensures data consistency

import { db } from '../db'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface StudentValidationData {
  firstName: string
  lastName: string
  nationalId: string
  studentId: string
  phone?: string
  classId: number
  excludeId?: number // For updates, exclude current record
}

export interface TeacherValidationData {
  firstName: string
  lastName: string
  nationalId: string
  employeeId: string
  phone: string
  email?: string
  excludeId?: number // For updates, exclude current record
}

// Normalize text for comparison (handle Persian/Arabic characters)
function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/ي/g, 'ی')  // Replace Arabic ي with Persian ی
    .replace(/ك/g, 'ک')  // Replace Arabic ك with Persian ک
    .replace(/\s+/g, ' ') // Normalize whitespace
}

// Normalize phone numbers
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '') // Remove all non-digits
}

export async function validateStudentData(data: StudentValidationData): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    // Check for duplicate national ID
    const existingByNationalId = await db.student.findFirst({
      where: {
        nationalId: data.nationalId,
        ...(data.excludeId && { id: { not: data.excludeId } })
      }
    })
    
    if (existingByNationalId) {
      errors.push(`کد ملی ${data.nationalId} قبلاً ثبت شده است`)
    }
    
    // Check for duplicate student ID
    const existingByStudentId = await db.student.findFirst({
      where: {
        studentId: data.studentId,
        ...(data.excludeId && { id: { not: data.excludeId } })
      }
    })
    
    if (existingByStudentId) {
      errors.push(`شماره دانش‌آموزی ${data.studentId} قبلاً استفاده شده است`)
    }
    
    // Check for duplicate phone number
    if (data.phone) {
      const normalizedPhone = normalizePhone(data.phone)
      const existingByPhone = await db.student.findFirst({
        where: {
          phone: {
            not: null,
            // Check normalized phone numbers
            in: [data.phone, normalizedPhone, `0${normalizedPhone}`, `+98${normalizedPhone.slice(1)}`]
          },
          ...(data.excludeId && { id: { not: data.excludeId } })
        }
      })
      
      if (existingByPhone) {
        errors.push(`شماره تلفن ${data.phone} قبلاً ثبت شده است`)
      }
    }
    
    // Check for similar names in same class (potential duplicate)
    const normalizedFirstName = normalizeText(data.firstName)
    const normalizedLastName = normalizeText(data.lastName)
    
    const similarStudents = await db.student.findMany({
      where: {
        classId: data.classId,
        ...(data.excludeId && { id: { not: data.excludeId } })
      }
    })
    
    for (const student of similarStudents) {
      const studentFirstName = normalizeText(student.firstName)
      const studentLastName = normalizeText(student.lastName)
      
      if (studentFirstName === normalizedFirstName && studentLastName === normalizedLastName) {
        errors.push(`دانش‌آموز با نام ${data.firstName} ${data.lastName} در این کلاس قبلاً وجود دارد`)
      } else if (studentFirstName === normalizedFirstName || studentLastName === normalizedLastName) {
        warnings.push(`دانش‌آموز با نام مشابه (${student.firstName} ${student.lastName}) در این کلاس وجود دارد`)
      }
    }
    
    // Validate class capacity
    const classInfo = await db.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } }
    })
    
    if (!classInfo) {
      errors.push(`کلاس با شناسه ${data.classId} یافت نشد`)
    } else if (classInfo.capacity && classInfo._count.students >= classInfo.capacity) {
      errors.push(`ظرفیت کلاس ${classInfo.grade}${classInfo.section} تکمیل است`)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
    
  } catch (error) {
    console.error('Error validating student data:', error)
    return {
      isValid: false,
      errors: ['خطا در اعتبارسنجی داده‌ها']
    }
  }
}

export async function validateTeacherData(data: TeacherValidationData): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    // Check for duplicate national ID
    const existingByNationalId = await db.teacher.findFirst({
      where: {
        nationalId: data.nationalId,
        ...(data.excludeId && { id: { not: data.excludeId } })
      }
    })
    
    if (existingByNationalId) {
      errors.push(`کد ملی ${data.nationalId} قبلاً ثبت شده است`)
    }
    
    // Check for duplicate employee ID
    const existingByEmployeeId = await db.teacher.findFirst({
      where: {
        employeeId: data.employeeId,
        ...(data.excludeId && { id: { not: data.excludeId } })
      }
    })
    
    if (existingByEmployeeId) {
      errors.push(`کد پرسنلی ${data.employeeId} قبلاً استفاده شده است`)
    }
    
    // Check for duplicate phone number
    const normalizedPhone = normalizePhone(data.phone)
    const existingByPhone = await db.teacher.findFirst({
      where: {
        phone: {
          in: [data.phone, normalizedPhone, `0${normalizedPhone}`, `+98${normalizedPhone.slice(1)}`]
        },
        ...(data.excludeId && { id: { not: data.excludeId } })
      }
    })
    
    if (existingByPhone) {
      errors.push(`شماره تلفن ${data.phone} قبلاً ثبت شده است`)
    }
    
    // Check for duplicate email
    if (data.email) {
      const normalizedEmail = data.email.toLowerCase().trim()
      const existingByEmail = await db.teacher.findFirst({
        where: {
          email: normalizedEmail,
          ...(data.excludeId && { id: { not: data.excludeId } })
        }
      })
      
      if (existingByEmail) {
        errors.push(`ایمیل ${data.email} قبلاً ثبت شده است`)
      }
    }
    
    // Check for similar names (potential duplicate)
    const normalizedFirstName = normalizeText(data.firstName)
    const normalizedLastName = normalizeText(data.lastName)
    
    const existingByName = await db.teacher.findFirst({
      where: {
        ...(data.excludeId && { id: { not: data.excludeId } })
      }
    })
    
    const allTeachers = await db.teacher.findMany({
      where: data.excludeId ? { id: { not: data.excludeId } } : undefined
    })
    
    for (const teacher of allTeachers) {
      const teacherFirstName = normalizeText(teacher.firstName)
      const teacherLastName = normalizeText(teacher.lastName)
      
      if (teacherFirstName === normalizedFirstName && teacherLastName === normalizedLastName) {
        errors.push(`دبیر با نام ${data.firstName} ${data.lastName} قبلاً ثبت شده است`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
    
  } catch (error) {
    console.error('Error validating teacher data:', error)
    return {
      isValid: false,
      errors: ['خطا در اعتبارسنجی داده‌ها']
    }
  }
}

// Validate before deletion (check for dependencies)
export async function validateStudentDeletion(studentId: number): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        _count: {
          select: {
            attendances: true,
            payments: true
          }
        }
      }
    })
    
    if (!student) {
      errors.push('دانش‌آموز یافت نشد')
      return { isValid: false, errors }
    }
    
    if (student._count.attendances > 0) {
      warnings.push(`${student._count.attendances} رکورد حضور و غیاب حذف خواهد شد`)
    }
    
    if (student._count.payments > 0) {
      warnings.push(`${student._count.payments} رکورد مالی حذف خواهد شد`)
    }
    
    return {
      isValid: true,
      errors,
      warnings
    }
    
  } catch (error) {
    console.error('Error validating student deletion:', error)
    return {
      isValid: false,
      errors: ['خطا در اعتبارسنجی حذف دانش‌آموز']
    }
  }
}

export async function validateTeacherDeletion(teacherId: number): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    const teacher = await db.teacher.findUnique({
      where: { id: teacherId },
      include: {
        _count: {
          select: {
            classes: true
          }
        }
      }
    })
    
    if (!teacher) {
      errors.push('دبیر یافت نشد')
      return { isValid: false, errors }
    }
    
    if (teacher._count.classes > 0) {
      errors.push(`دبیر دارای ${teacher._count.classes} کلاس فعال است و نمی‌تواند حذف شود`)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
    
  } catch (error) {
    console.error('Error validating teacher deletion:', error)
    return {
      isValid: false,
      errors: ['خطا در اعتبارسنجی حذف دبیر']
    }
  }
}
