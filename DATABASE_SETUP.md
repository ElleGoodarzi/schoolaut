# راه‌اندازی پایگاه داده

## گزینه 1: SQLite (پیش‌فرض - آسان)

SQLite برای توسعه محلی پیش‌فرض است و نیازی به نصب ندارد.

### تنظیمات
فایل `.env.local` از قبل تنظیم شده:
```bash
DATABASE_URL="file:./prisma/dev.db"
```

### راه‌اندازی
```bash
npm run db:generate  # تولید کلاینت Prisma
npm run db:push      # ایجاد جداول
npm run db:seed      # پر کردن با داده‌های نمونه
```

---

## گزینه 2: PostgreSQL (برای پروداکشن)

### macOS (با Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
1. دانلود PostgreSQL از [postgresql.org](https://www.postgresql.org/download/windows/)
2. نصب و راه‌اندازی سرویس

## ایجاد پایگاه داده

```bash
# ورود به PostgreSQL
sudo -u postgres psql

# ایجاد کاربر جدید
CREATE USER schoolaut_user WITH PASSWORD 'your_password';

# ایجاد پایگاه داده
CREATE DATABASE schoolaut_db OWNER schoolaut_user;

# اعطای دسترسی‌ها
GRANT ALL PRIVILEGES ON DATABASE schoolaut_db TO schoolaut_user;

# خروج
\q
```

## تنظیم متغیرهای محیطی

فایل `.env.local` را برای PostgreSQL تغییر دهید:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://schoolaut_user:your_password@localhost:5432/schoolaut_db?schema=public"

# Next.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## تغییر از SQLite به PostgreSQL

1. **تغییر provider در schema.prisma:**
```prisma
datasource db {
  provider = "postgresql"  // تغییر از "sqlite"
  url      = env("DATABASE_URL")
}
```

2. **نصب وابستگی PostgreSQL:**
```bash
npm install pg @types/pg
```

3. **تولید مجدد کلاینت:**
```bash
npm run db:generate
```

## راه‌اندازی Prisma

```bash
# نصب وابستگی‌ها
npm install

# تولید کلاینت Prisma
npm run db:generate

# ایجاد جداول در پایگاه داده
npm run db:push

# پر کردن پایگاه داده با داده‌های نمونه
npm run db:seed
```

## ساختار پایگاه داده

### جداول اصلی:

- **students**: اطلاعات دانش‌آموزان
- **teachers**: اطلاعات معلمان  
- **classes**: کلاس‌ها و پایه‌های تحصیلی
- **attendance**: حضور و غیاب
- **payments**: پرداخت‌ها و شهریه‌ها
- **announcements**: اطلاعیه‌ها
- **meal_services**: سرویس‌های غذا

### روابط:
- هر دانش‌آموز متعلق به یک کلاس
- هر کلاس دارای یک معلم مسئول
- رکوردهای حضور و غیاب مرتبط با دانش‌آموز و کلاس
- پرداخت‌ها مرتبط با دانش‌آموزان

## اجرای پروژه

```bash
npm run dev
```

پروژه در آدرس `http://localhost:3000` در دسترس خواهد بود.
