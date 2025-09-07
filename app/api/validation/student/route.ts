import { NextRequest, NextResponse } from 'next/server'
import { validateStudentData } from '@/lib/validation/dataIntegrity'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      firstName,
      lastName,
      nationalId,
      studentId,
      phone,
      classId,
      excludeId
    } = body

    // Perform validation
    const validation = await validateStudentData({
      firstName,
      lastName,
      nationalId,
      studentId,
      phone,
      classId,
      excludeId
    })

    return NextResponse.json(validation)

  } catch (error) {
    console.error('Error validating student data:', error)
    return NextResponse.json(
      { 
        isValid: false, 
        errors: ['خطا در اعتبارسنجی داده‌ها'] 
      },
      { status: 500 }
    )
  }
}
