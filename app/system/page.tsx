import MainLayout from '@/components/MainLayout'

export default function System() {
  return (
    <MainLayout>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">مدیریت سیستم</h1>
        <div className="bg-white rounded-xl card-shadow border border-gray-200 p-8 text-center">
          <p className="text-gray-600">این بخش در حال توسعه می‌باشد.</p>
        </div>
      </div>
    </MainLayout>
  )
}
