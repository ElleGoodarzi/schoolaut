'use client'

import { useState, useEffect } from 'react'
import { useDataStore } from '@/lib/stores/dataStore'
import { useAuthStore } from '@/lib/stores/authStore'
import RoleAwareActions, { RoleGate } from './RoleAwareActions'
import DeleteConfirmationDialog from './modals/DeleteConfirmationDialog'
import EditStudentModal from './modals/EditStudentModal'
import EditTeacherModal from './modals/EditTeacherModal'
import CreateTeacherModal from './modals/CreateTeacherModal'
import CreateClassModal from './modals/CreateClassModal'
import MealServiceModal from './modals/MealServiceModal'
import TransportServiceModal from './modals/TransportServiceModal'
import { useToast } from '@/lib/toast/ToastProvider'
import {
  AcademicCapIcon,
  UserGroupIcon,
  TruckIcon,
  BuildingOfficeIcon,
  CakeIcon
} from '@heroicons/react/24/outline'

type TabType = 'students' | 'teachers' | 'classes' | 'meals' | 'transport'

export default function ComprehensiveCRUDDashboard() {
  const { user } = useAuthStore()
  const { 
    students, 
    teachers, 
    classes, 
    mealServices, 
    transportServices,
    fetchStudents,
    fetchTeachers,
    fetchClasses,
    fetchMealServices,
    fetchTransportServices,
    deleteStudent,
    deleteTeacher,
    deleteClass,
    deleteMealService,
    deleteTransportService
  } = useDataStore()
  
  const { success, error } = useToast()
  
  const [activeTab, setActiveTab] = useState<TabType>('students')
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [showEditStudent, setShowEditStudent] = useState(false)
  const [showEditTeacher, setShowEditTeacher] = useState(false)
  const [showCreateTeacher, setShowCreateTeacher] = useState(false)
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [showMealModal, setShowMealModal] = useState(false)
  const [showTransportModal, setShowTransportModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Selected items
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [selectedMeal, setSelectedMeal] = useState<any>(null)
  const [selectedTransport, setSelectedTransport] = useState<any>(null)
  const [deleteItem, setDeleteItem] = useState<{type: string, id: number, name: string} | null>(null)

  // Define available tabs based on user role
  const getAvailableTabs = () => {
    const allTabs = [
      { id: 'students' as TabType, name: 'دانش‌آموزان', icon: AcademicCapIcon, roles: ['ADMIN', 'VICE_PRINCIPAL', 'TEACHER'] },
      { id: 'teachers' as TabType, name: 'معلمان', icon: UserGroupIcon, roles: ['ADMIN', 'VICE_PRINCIPAL'] },
      { id: 'classes' as TabType, name: 'کلاس‌ها', icon: BuildingOfficeIcon, roles: ['ADMIN', 'VICE_PRINCIPAL'] },
      { id: 'meals' as TabType, name: 'سرویس غذا', icon: CakeIcon, roles: ['ADMIN', 'FINANCE'] },
      { id: 'transport' as TabType, name: 'سرویس حمل‌ونقل', icon: TruckIcon, roles: ['ADMIN', 'VICE_PRINCIPAL'] }
    ]
    
    return allTabs.filter(tab => tab.roles.includes(user?.role || ''))
  }

  const availableTabs = getAvailableTabs()

  // Set default tab based on user role
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(t => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id)
    }
  }, [user?.role])

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        switch (activeTab) {
          case 'students':
            await fetchStudents()
            break
          case 'teachers':
            await fetchTeachers()
            break
          case 'classes':
            await fetchClasses()
            break
          case 'meals':
            await fetchMealServices()
            break
          case 'transport':
            await fetchTransportServices()
            break
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeTab])

  // Delete handlers
  const handleDelete = (type: string, id: number, name: string) => {
    setDeleteItem({ type, id, name })
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!deleteItem) return

    try {
      const response = await fetch(`/api/${deleteItem.type}/${deleteItem.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        // Update local store
        switch (deleteItem.type) {
          case 'students':
            deleteStudent(deleteItem.id)
            break
          case 'teachers':
            deleteTeacher(deleteItem.id)
            break
          case 'classes':
            deleteClass(deleteItem.id)
            break
          case 'meals':
            deleteMealService(deleteItem.id)
            break
          case 'transport':
            deleteTransportService(deleteItem.id)
            break
        }
        
        success('حذف با موفقیت انجام شد', result.message)
      } else {
        error('خطا در حذف', result.error)
      }
    } catch (err) {
      console.error('Delete error:', err)
      error('خطا در حذف', 'خطای داخلی سرور')
    }
  }

  // Edit handlers
  const handleEditStudent = (student: any) => {
    setSelectedStudent(student)
    setShowEditStudent(true)
  }

  const handleEditTeacher = (teacher: any) => {
    setSelectedTeacher(teacher)
    setShowEditTeacher(true)
  }

  const handleEditMeal = (meal: any) => {
    setSelectedMeal(meal)
    setShowMealModal(true)
  }

  const handleEditTransport = (transport: any) => {
    setSelectedTransport(transport)
    setShowTransportModal(true)
  }

  // Render data based on active tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
        </div>
      )
    }

    switch (activeTab) {
      case 'students':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">فهرست دانش‌آموزان</h3>
              <RoleAwareActions
                resource="STUDENT"
                onAdd={() => {/* Open AddStudentModal */}}
                addText="افزودن دانش‌آموز"
              />
            </div>
            <div className="grid gap-4">
              {students.map(student => (
                <div key={student.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{student.firstName} {student.lastName}</h4>
                    <p className="text-sm text-gray-600">کلاس {student.grade}-{student.section}</p>
                    <p className="text-xs text-gray-500">کد دانش‌آموزی: {student.studentId}</p>
                  </div>
                  <RoleAwareActions
                    resource="STUDENT"
                    onEdit={() => handleEditStudent(student)}
                    onDelete={() => handleDelete('students', student.id, `${student.firstName} ${student.lastName}`)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )

      case 'teachers':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">فهرست معلمان</h3>
              <RoleAwareActions
                resource="TEACHER"
                onAdd={() => setShowCreateTeacher(true)}
                addText="افزودن معلم"
              />
            </div>
            <div className="grid gap-4">
              {teachers.map(teacher => (
                <div key={teacher.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{teacher.firstName} {teacher.lastName}</h4>
                    <p className="text-sm text-gray-600">کد پرسنلی: {teacher.employeeId}</p>
                    <p className="text-xs text-gray-500">{teacher.classes.length} کلاس فعال</p>
                  </div>
                  <RoleAwareActions
                    resource="TEACHER"
                    onEdit={() => handleEditTeacher(teacher)}
                    onDelete={() => handleDelete('teachers', teacher.id, `${teacher.firstName} ${teacher.lastName}`)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )

      case 'classes':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">فهرست کلاس‌ها</h3>
              <RoleAwareActions
                resource="CLASS"
                onAdd={() => setShowCreateClass(true)}
                addText="افزودن کلاس"
              />
            </div>
            <div className="grid gap-4">
              {classes.map(cls => (
                <div key={cls.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">کلاس {cls.grade}-{cls.section}</h4>
                    <p className="text-sm text-gray-600">معلم: {cls.teacher.firstName} {cls.teacher.lastName}</p>
                    <p className="text-xs text-gray-500">{cls._count.students} دانش‌آموز / ظرفیت {cls.capacity}</p>
                  </div>
                  <RoleAwareActions
                    resource="CLASS"
                    onEdit={() => {/* Handle edit class */}}
                    onDelete={() => handleDelete('classes', cls.id, `کلاس ${cls.grade}-${cls.section}`)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )

      case 'meals':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">سرویس‌های غذا</h3>
              <RoleAwareActions
                resource="MEAL"
                onAdd={() => {
                  setSelectedMeal(null)
                  setShowMealModal(true)
                }}
                addText="افزودن سرویس غذا"
              />
            </div>
            <div className="grid gap-4">
              {mealServices.map(meal => (
                <div key={meal.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{meal.mealType} - {new Date(meal.date).toLocaleDateString('fa-IR')}</h4>
                    <p className="text-sm text-gray-600">{meal.menuItems}</p>
                    <p className="text-xs text-gray-500">قیمت: {meal.price.toLocaleString()} تومان | {meal.totalOrders}/{meal.maxOrders} سفارش</p>
                  </div>
                  <RoleAwareActions
                    resource="MEAL"
                    onEdit={() => handleEditMeal(meal)}
                    onDelete={() => handleDelete('meals', meal.id, `${meal.mealType} ${new Date(meal.date).toLocaleDateString('fa-IR')}`)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )

      case 'transport':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">سرویس‌های حمل‌ونقل</h3>
              <RoleAwareActions
                resource="TRANSPORT"
                onAdd={() => {
                  setSelectedTransport(null)
                  setShowTransportModal(true)
                }}
                addText="افزودن سرویس حمل‌ونقل"
              />
            </div>
            <div className="grid gap-4">
              {transportServices.map(transport => (
                <div key={transport.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{transport.routeName}</h4>
                    <p className="text-sm text-gray-600">راننده: {transport.driverName} | خودرو: {transport.vehicleNumber}</p>
                    <p className="text-xs text-gray-500">
                      {transport.pickupTime} - {transport.dropoffTime} | 
                      هزینه ماهانه: {transport.monthlyFee.toLocaleString()} تومان |
                      ظرفیت: {transport.capacity}
                    </p>
                  </div>
                  <RoleAwareActions
                    resource="TRANSPORT"
                    onEdit={() => handleEditTransport(transport)}
                    onDelete={() => handleDelete('transport', transport.id, transport.routeName)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return <div>بخش انتخابی یافت نشد</div>
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">برای دسترسی به این بخش وارد شوید</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 space-x-reverse">
          {availableTabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 space-x-reverse py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        {renderTabContent()}
      </div>

      {/* Modals */}
      {selectedStudent && (
        <EditStudentModal
          isOpen={showEditStudent}
          onClose={() => {
            setShowEditStudent(false)
            setSelectedStudent(null)
          }}
          student={selectedStudent}
          onSuccess={() => {
            success('دانش‌آموز با موفقیت به‌روزرسانی شد')
            fetchStudents()
          }}
        />
      )}

      {selectedTeacher && (
        <EditTeacherModal
          isOpen={showEditTeacher}
          onClose={() => {
            setShowEditTeacher(false)
            setSelectedTeacher(null)
          }}
          teacher={selectedTeacher}
          onSuccess={() => {
            success('معلم با موفقیت به‌روزرسانی شد')
            fetchTeachers()
          }}
        />
      )}

      <CreateTeacherModal
        isOpen={showCreateTeacher}
        onClose={() => setShowCreateTeacher(false)}
        onSuccess={() => {
          success('معلم با موفقیت اضافه شد')
          fetchTeachers()
        }}
      />

      <CreateClassModal
        isOpen={showCreateClass}
        onClose={() => setShowCreateClass(false)}
        onSuccess={() => {
          success('کلاس با موفقیت اضافه شد')
          fetchClasses()
        }}
      />

      <MealServiceModal
        isOpen={showMealModal}
        onClose={() => {
          setShowMealModal(false)
          setSelectedMeal(null)
        }}
        mealService={selectedMeal}
        onSuccess={() => {
          success(selectedMeal ? 'سرویس غذا به‌روزرسانی شد' : 'سرویس غذا اضافه شد')
          fetchMealServices()
        }}
      />

      <TransportServiceModal
        isOpen={showTransportModal}
        onClose={() => {
          setShowTransportModal(false)
          setSelectedTransport(null)
        }}
        transportService={selectedTransport}
        onSuccess={() => {
          success(selectedTransport ? 'سرویس حمل‌ونقل به‌روزرسانی شد' : 'سرویس حمل‌ونقل اضافه شد')
          fetchTransportServices()
        }}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeleteItem(null)
        }}
        onConfirm={confirmDelete}
        title="تأیید حذف"
        message={`آیا از حذف "${deleteItem?.name}" اطمینان دارید؟ این عمل قابل برگشت نیست.`}
        confirmText="حذف"
        cancelText="لغو"
        type="danger"
      />
    </div>
  )
}
