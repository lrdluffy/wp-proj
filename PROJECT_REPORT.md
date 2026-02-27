## گزارش پروژه – سیستم مدیریت پرونده‌های پلیس

این سند مطابق با الزامات بخش «گزارش پروژه» تهیه شده است و تمام بندهای درخواستی (مسئولیت‌ها، قراردادهای توسعه، نحوهٔ مدیریت پروژه، موجودیت‌های کلیدی، پکیج‌های NPM، نمونه کدهای تولیدشده توسط هوش مصنوعی، تحلیل قوت‌ها و ضعف‌ها و نیازسنجی ابتدایی/نهایی) را پوشش می‌دهد.  

بر اساس تاریخچهٔ Git **فهرست کامل commitها** در «پیوست A» آورده شده است.

---

## ۱. مسئولیت‌ها و کارهای انجام‌شده

### ۱‑۱. توسعه‌ بک‌اند

- **راه‌اندازی اولیه**
  - ایجاد پروژه Django و اپ اصلی `ProjBackend`
  - پیکربندی `settings.py` شامل `REST_FRAMEWORK`، CORS، احراز هویت توکنی و فیلترها
  - تعریف ساختار پوشه‌ها و تنظیمات پایه‌ی پایگاه داده

- **طراحی و پیاده‌سازی مدل‌ها**
  - اپ `accounts`: مدل `User` با نقش‌های مختلف سازمانی (کارآموز تا رئیس پلیس) و متدهای کمکی برای کنترل سطح دسترسی
  - اپ `core`: مدل‌های `Case` و `CrimeScene` برای مدیریت پرونده و صحنه جرم
  - اپ `complaints`: مدل `Complaint` برای ثبت شکایت‌های شهروندان و اتصال آن‌ها به پرونده
  - اپ `evidence`: مدل‌های چندریختی برای انواع مدرک (بیولوژیکی، پزشکی، وسیله نقلیه، هویتی) و ثبت chain of custody
  - اپ‌های `witnesses`، `suspects`، `trials` و `rewards` برای مدیریت اظهارات شاهد، مظنونین، جلسات دادگاه و پاداش‌ها

- **پیاده‌سازی لایهٔ API**
  - تعریف Serializer برای تمام مدل‌ها (نمایش داده و اعتبارسنجی ورودی)
  - پیاده‌سازی `ViewSet`ها با امکانات:
    - فیلتر کردن (`DjangoFilterBackend`)
    - جست‌وجو (`SearchFilter`)
    - مرتب‌سازی (`OrderingFilter`)
    - صفحه‌بندی استاندارد
  - تعریف permissionهای سفارشی بر اساس نقش کاربر و سطح حساسیت داده
  - تنظیم `urls.py` برای هر اپ و اتصال همه‌ی APIها زیر پیشوند `/api/`

- **مستندسازی و تست**
  - یکپارچه‌سازی `drf-spectacular`، افزودن توضیحات به viewها و تولید مستندات Swagger و ReDoc
  - نوشتن تعدادی تست واحد برای مدل‌ها و endpointهای کلیدی (کاربر، پرونده، شکایت)
  - تهیهٔ README برای بک‌اند شامل نحوهٔ اجرا، معماری و RBAC

### ۱‑۲. توسعه‌ فرانت‌اند

- **ایجاد زیرساخت**
  - راه‌اندازی پروژه با React + TypeScript + Vite + TailwindCSS
  - تنظیم ESLint، tsconfig و ساختار پوشه‌ها (`components`, `pages`, `services`, `contexts`, `types`, `utils`, `test`)

- **لایهٔ ارتباط با API و احراز هویت**
  - پیاده‌سازی سرویس `ApiService` با Axios و Interceptor برای افزودن توکن و مدیریت خطای ۴۰۱
  - تعریف typeها و اینترفیس‌های TypeScript بر اساس پاسخ API
  - پیاده‌سازی `AuthContext` برای مدیریت وضعیت احراز هویت در سطح کل برنامه
  - ساخت کامپوننت `ProtectedRoute` جهت محافظت از صفحات نیازمند ورود کاربر

- **پیاده‌سازی رابط کاربری**
  - صفحات عمومی: Home، Dashboard
  - صفحات احراز هویت: Login، Register
  - صفحات عملیاتی:
    - مدیریت پرونده‌ها: Cases، CaseDetail، CaseCreate/CaseEdit
    - مدیریت شکایات: Complaints، ComplaintForm
    - مدیریت مدارک: EvidenceList، EvidenceDetail، EvidenceCreate
    - صفحات تکمیلی: DetectiveBoard، Pursuit، Reports، Documents، Admin
  - استفاده از جدول‌ها و فرم‌های واکنش‌گرا همراه با جست‌وجو، فیلتر، مرتب‌سازی و pagination

- **بهبود کیفیت و تجربهٔ کاربری (UX)**
  - پیاده‌سازی `ErrorBoundary` و `ErrorMessage` برای مدیریت خطاها
  - افزودن `LoadingSpinner` و `Skeleton` برای نمایش وضعیت بارگذاری
  - طراحی واکنش‌گرا با Tailwind برای نمایش مناسب در موبایل و دسکتاپ
  - نوشتن تست‌های واحد با Vitest برای کامپوننت‌های کلیدی (صفحات ورود، محافظت مسیر، spinner و …)

- **آماده‌سازی برای استقرار**
  - پیکربندی `Dockerfile` فرانت‌اند
  - تنظیم `docker-compose.yml` برای اجرای همزمان بک‌اند و فرانت‌اند
  - تنظیم `nginx.conf` برای سرو statics و پروکسی کردن درخواست‌های API

### ۱‑۳. خلاصهٔ مسئولیت‌ها

- **بک‌اند**: طراحی مدل داده، پیاده‌سازی API امن و مستند، مجوزدهی و تست پایه.  
- **فرانت‌اند**: طراحی و پیاده‌سازی UI واکنش‌گرا، مدیریت احراز هویت سمت کاربر، تست و آماده‌سازی برای استقرار.

---

## ۲. قراردادهای توسعه

### ۲‑۱. قراردادهای نام‌گذاری

**بک‌اند (Python/Django):**

- نام مدل‌ها: `PascalCase` مانند `Case`, `Complaint`, `WitnessStatement`
- نام فیلدها: `snake_case` مانند `case_number`, `created_at`, `assigned_to`
- نام کلاس‌های View: `PascalCase` با پسوند `ViewSet` مثل `UserViewSet`
- ثابت‌ها و enum ها: `UPPER_SNAKE_CASE` مثل `PENDING`, `APPROVED`, `LEVEL_1`
- فایل‌ها: استفاده از نام‌های پیش‌فرض Django (`models.py`, `views.py`, `serializers.py` و …)

**فرانت‌اند (TypeScript/React):**

- نام کامپوننت‌ها و صفحات: `PascalCase` مثل `Login`, `Dashboard`, `ProtectedRoute`
- متغیرها و توابع: `camelCase` مثل `getCases`, `isAuthenticated`, `formatDate`
- نوع‌ها و اینترفیس‌ها: `PascalCase` مثل `User`, `Case`, `AuthContextType`
- فایل‌های کمکی: نام توصیفی مانند `api.ts`, `format.ts`

### ۲‑۲. قالب پیام‌های Git Commit

برای خوانایی و ردیابی بهتر، از الگوی زیر برای پیام‌های commit استفاده شده است (فهرست کامل commitها در «پیوست A» آمده است):

```text
[Component]: [Action] [Short Description]
```

نمونه‌ها:

- `Backend: Configure Django settings --> add DRF and CORS`
- `Backend: Implement accounts app --> custom user with role-based permissions`
- `Backend: Implement API viewsets and routing for all apps`
- `Frontend: Add authentication context and protected routes`
- `Frontend: Add cases and complaints pages with filtering and pagination`
- `Frontend: Add Docker and nginx configuration for production`

**قوانین کلی:**

- شروع پیام با بخش اصلی (`Backend` یا `Frontend`)
- استفاده از افعال روشن (Add, Implement, Fix, Refactor, Update, Remove)
- در صورت نیاز استفاده از `-->` برای توضیحات تکمیلی
- خلاصه‌نویسی و پرهیز از پیام‌های مبهم

### ۲‑۳. ساختار پروژه

**بک‌اند:**

```text
Backend/
└── ProjBackend/
    ├── accounts/      # مدیریت کاربران و نقش‌ها
    ├── core/          # پرونده‌ها و صحنه‌های جرم
    ├── complaints/    # شکایات اولیهٔ شهروندان
    ├── evidence/      # مدارک و مستندات پرونده
    ├── witnesses/     # اظهارات شاهدان
    ├── suspects/      # مظنونین و وضعیت بازداشت
    ├── trials/        # جلسات دادگاه و احکام
    ├── rewards/       # پاداش‌ها و پرداخت‌ها
    └── ProjBackend/   # تنظیمات اصلی Django و URLهای ریشه
```

**فرانت‌اند:**

```text
Frontend/
└── src/
    ├── components/    # کامپوننت‌های قابل‌استفادهٔ مجدد
    ├── pages/         # صفحات سطح بالا
    ├── contexts/      # Contextهای سراسری (مانند AuthContext)
    ├── services/      # لایهٔ ارتباط با API (Axios)
    ├── types/         # تعریف typeها و اینترفیس‌های TypeScript
    ├── utils/         # توابع کمکی (مثلاً قالب‌بندی تاریخ)
    └── test/          # تست‌های واحد با Vitest
```

### ۲‑۴. سبک کدنویسی

- رعایت PEP8 تا حد امکان در بک‌اند و استفاده از docstring برای کلاس‌ها و توابع مهم
- استفاده از کامپوننت‌های تابعی و React Hooks در فرانت‌اند
- استفاده از TypeScript برای جلوگیری از خطاهای زمان اجرا و کمک به refactor
- استفاده از TailwindCSS برای جلوگیری از رشد بی‌رویهٔ فایل‌های CSS سفارشی

---

## ۳. نحوهٔ مدیریت پروژه (چگونگی تولید و تقسیم وظایف)

### ۳‑۱. رویکرد کلی

پروژه در دو فاز اصلی اجرا شد:

1. **فاز بک‌اند**: طراحی دامنه، مدل داده، پیاده‌سازی API و مستندسازی.  
2. **فاز فرانت‌اند**: طراحی رابط کاربری، اتصال به API، بهبود UX و آماده‌سازی برای استقرار.

### ۳‑۲. فاز بک‌اند

- تعریف مدل‌ها و روابط آن‌ها بر اساس نیازهای دامنه (کاربر، پرونده، شکایت، مدرک، شاهد، مظنون، دادگاه، پاداش، پرداخت و صحنهٔ جرم)
- پیاده‌سازی serializers و ViewSetهای CRUD برای هر مدل
- اضافه‌کردن فیلتر، جست‌وجو و مرتب‌سازی در endpointهای مهم
- پیاده‌سازی permissionهای مبتنی بر نقش برای محدود کردن دسترسی به داده‌های حساس

### ۳‑۳. فاز فرانت‌اند

- راه‌اندازی Vite + React + TypeScript + Tailwind به عنوان زیرساخت
- نوشتن لایهٔ سرویس API با Axios و مدیریت خطای ۴۰۱
- پیاده‌سازی صفحات اصلی (Login، Register، Dashboard، Cases، Complaints، Evidence، …)
- استفاده از AuthContext و ProtectedRoute برای محافظت از بخش‌های حساس
- افزودن ErrorBoundary، LoadingSpinner و Skeleton برای بهبود UX
- نوشتن تعدادی تست واحد برای اطمینان از رفتار صحیح کامپوننت‌های کلیدی

### ۳‑۴. استفاده از Git

- استفاده از یک مخزن واحد برای کل پروژه
- commitهای کوچک و منظم با پیام‌های ساختاریافته
- تلاش برای آن‌که هر commit منعکس‌کننده‌ی یک تغییر منطقی واحد باشد (مثلاً افزودن یک صفحه یا یک مدل)

---

## ۴. موجودیت‌های کلیدی سامانه و دلیل وجود آن‌ها

در ادامه مهم‌ترین موجودیت‌های دامنه و دلیل وجود هرکدام آورده شده است:

1. **User (کاربر)**  
   - دلیل وجود: سیستم باید کاربران با نقش‌ها و سطوح دسترسی مختلف (از کارآموز تا رئیس پلیس و شهروند) را مدیریت کند.  
   - ویژگی‌ها: نام کاربری، ایمیل، نام و نام خانوادگی، نقش، شمارهٔ نشان (Badge Number)، شماره تماس و متدهایی برای تشخیص سطح دسترسی.

2. **Case (پرونده)**  
   - دلیل وجود: پرونده هستهٔ اصلی سیستم است؛ همه‌چیز حول آن شکل می‌گیرد (شکایات، مدارک، شاهدان، مظنونین و دادگاه‌ها).  
   - ویژگی‌ها: شمارهٔ پرونده، عنوان، توضیحات، سطح جرم، وضعیت، محل وقوع، زمان گزارش، کاربر ایجادکننده، کاربر مسئول، تأیید شده/نشده.

3. **Complaint (شکایت شهروند)**  
   - دلیل وجود: شهروند نقطهٔ شروع بسیاری از پرونده‌هاست؛ شکایت او می‌تواند پس از بررسی به Case تبدیل شود.  
   - ویژگی‌ها: اطلاعات شاکی، عنوان و متن شکایت، وضعیت پردازش، تعداد دفعات رد شدن، بازخورد کارآموز/افسر، ارتباط احتمالی با پرونده.

4. **Evidence (مدرک)**  
   - دلیل وجود: مدارک جمع‌آوری‌شده باید به شکل دقیق و قابل‌ردیابی ثبت شوند تا در دادگاه معتبر باشند.  
   - ویژگی‌ها: نوع مدرک، توضیحات، مکان کشف، زمان جمع‌آوری، وضعیت تحلیل، chain of custody، لیست اسناد و تصاویر.

5. **WitnessStatement (اظهار شاهد)**  
   - دلیل وجود: اظهارات شاهدان در بسیاری از پرونده‌ها نقش کلیدی دارد و باید همراه با اطلاعات تماس و ضمائم ذخیره شود.  

6. **Suspect (مظنون)**  
   - دلیل وجود: ثبت و ردیابی مظنونین، بازجویی‌ها، اتهامات، بازداشت و وثیقه.  

7. **Trial (دادگاه)**  
   - دلیل وجود: مدیریت جلسات دادگاه، حکم نهایی، جریمه‌ها و اتصال آن‌ها به پرونده و مظنون.  

8. **Reward (پاداش)**  
   - دلیل وجود: ثبت و پیگیری پاداش‌هایی که به افسران بابت عملکرد خوب در پرونده‌ها داده می‌شود.  

9. **Payment (پرداخت)**  
   - دلیل وجود: مدیریت پرداخت‌های مربوط به وثیقه، جریمه و پاداش به‌همراه جزئیات روش پرداخت و شناسه تراکنش.  

10. **CrimeScene (صحنهٔ جرم)**  
    - دلیل وجود: ثبت اطلاعات دقیق صحنهٔ جرم (مکان، زمان، شرایط محیطی، شاهدان حاضر و …) برای استفاده در تحقیقات و دادگاه.  

---

## ۵. حداکثر شش پکیج NPM استفاده‌شده در پروژه

### ۵‑۱. React

- **کارکرد**: کتابخانهٔ اصلی برای ساخت رابط کاربری بر پایهٔ کامپوننت‌ها.  
- **توجیه استفاده**:
  - استاندارد صنعتی برای ساخت SPA  
  - جامعهٔ کاربری و مستندات بسیار قوی  
  - سازگاری خوب با TypeScript و اکوسیستم تست  

### ۵‑۲. React Router DOM

- **کارکرد**: مدیریت مسیرها و ناوبری در برنامهٔ تک‌صفحه‌ای.  
- **توجیه استفاده**:
  - نیاز پروژه به صفحات متعدد (Login، Dashboard، Cases، Complaints و …)  
  - امکان تعریف ProtectedRoute برای مسیرهای نیازمند احراز هویت  

### ۵‑۳. Axios

- **کارکرد**: ارسال درخواست‌های HTTP به API بک‌اند.  
- **توجیه استفاده**:
  - API ساده‌تر و قدرتمندتر از `fetch`  
  - پشتیبانی از Interceptor برای افزودن توکن و مدیریت خطا  
  - یکپارچه‌سازی آسان با TypeScript  

### ۵‑۴. TypeScript

- **کارکرد**: افزودن سیستم نوع به JavaScript برای افزایش اطمینان از درستی کد.  
- **توجیه استفاده**:
  - کمک به جلوگیری از خطاهای زمان اجرا  
  - تسهیل refactor و تکمیل خودکار  
  - مستندسازی ضمنی از طریق typeها  

### ۵‑۵. TailwindCSS

- **کارکرد**: فریم‌ورک CSS مبتنی بر کلاس‌های utility برای ساخت سریع UI واکنش‌گرا.  
- **توجیه استفاده**:
  - توسعهٔ سریع بدون نیاز به نوشتن CSS سفارشی زیاد  
  - پشتیبانی قدرتمند از طراحی واکنش‌گرا  
  - کاهش حجم CSS نهایی از طریق tree-shaking کلاس‌های استفاده نشده  

### ۵‑۶. React Hook Form

- **کارکرد**: مدیریت فرم‌ها و اعتبارسنجی آن‌ها با حداقل رندر مجدد.  
- **توجیه استفاده**:
  - پیاده‌سازی سادهٔ فرم‌های Login و Register  
  - پشتیبانی قوی از validation و نمایش خطاها  
  - سازگاری خوب با TypeScript و کامپوننت‌های سفارشی  

---

## ۶. نمونه کدهای تولیدشده یا تکمیل‌شده توسط هوش مصنوعی

### ۶‑۱. لایهٔ سرویس API (Frontend/src/services/api.ts)

```typescript
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }
}
```

**نقش هوش مصنوعی:** پیشنهاد ساختار کلی کلاس، استفاده از Interceptorها و مدیریت خودکار خطای ۴۰۱.

### ۶‑۲. کامپوننت محافظ مسیر (Frontend/src/components/ProtectedRoute.tsx)

```typescript
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

**نقش هوش مصنوعی:** تولید نسخه‌ی اولیهٔ کامپوننت و سپس سفارشی‌سازی توسط توسعه‌دهنده (افزودن Spinner و استفاده از Context پروژه).

### ۶‑۳. مدل کاربر با نقش‌ها (Backend/ProjBackend/accounts/models.py)

```python
class User(AbstractUser):
    role = models.CharField(
        max_length=31,
        choices=Role.choices,
        default=Role.TRAINEE,
        help_text="User role/rank in the police department",
    )

    def can_handle_crime_level(self, level: int) -> bool:
        level_permissions = {
            1: [Role.POLICE_CHIEF, Role.CAPTAIN],
            2: [Role.CAPTAIN, Role.SERGEANT, Role.DETECTIVE],
            3: [Role.SERGEANT, Role.DETECTIVE, Role.POLICE_OFFICER, Role.PATROL_OFFICER],
        }
        return self.role in level_permissions.get(level, [])
```

**نقش هوش مصنوعی:** کمک در طراحی دیکشنری `level_permissions` و استفاده از type hint برای شفافیت بیشتر.

### ۶‑۴. ViewSet نمونه برای پرونده‌ها (Backend/ProjBackend/core/views.py)

```python
class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'crime_level', 'assigned_to', 'is_approved']
    search_fields = ['case_number', 'title', 'description']
    ordering_fields = ['created_at', 'reported_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == 'TRAINEE':
            return Case.objects.filter(is_approved=True)
        if getattr(user, 'role', None) == 'CITIZEN':
            return Case.objects.none()
        return Case.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
```

**نقش هوش مصنوعی:** پیشنهاد قالب کلی ViewSet و استفاده از فیلترها و search_fields.

---

## ۷. ضعف‌ها و قوت‌های هوش مصنوعی در توسعهٔ فرانت‌اند

### ۷‑۱. قوت‌ها

- تولید سریع اسکلت اولیهٔ کامپوننت‌ها و صفحات.  
- پیشنهاد الگوهای استاندارد (Context، hooks، ساختاردهی پوشه‌ها).  
- کمک در تعریف typeها و اینترفیس‌های TypeScript براساس پاسخ API.  
- ایجاد سریع توابع کمکی برای قالب‌بندی تاریخ، مدیریت خطا و … .  

### ۷‑۲. ضعف‌ها

- درک ناقص از context کامل رابط کاربری؛ برخی پیشنهادها از نظر UX مناسب نبودند.  
- تمایل به تولید کدهای با رندر اضافه (unnecessary re-renders) که نیاز به بهینه‌سازی دستی داشت.  
- پوشش ناقص مباحث دسترس‌پذیری (a11y) و نیاز به بازبینی دستی aria-attributes و کنتراست رنگ.  
- تولید تست‌های سطحی که تمام edge caseها را پوشش نمی‌دادند.  

---

## ۸. ضعف‌ها و قوت‌های هوش مصنوعی در توسعهٔ بک‌اند

### ۸‑۱. قوت‌ها

- تولید مدل‌های Django با فیلدها و روابط مناسب به صورت سریع و نسبتاً دقیق.  
- تولید Serializer و ViewSetهای CRUD استاندارد.  
- پیشنهاد الگوهای مناسب برای permissions و RBAC.  
- کمک در نوشتن کوئری‌ها و فیلترها در ViewSetها.  

### ۸‑۲. ضعف‌ها

- در منطق تجاری پیچیده نیاز به بازنویسی و ساده‌سازی دستی وجود داشت.  
- بهینه‌سازی عملکرد (استفاده از `select_related` و `prefetch_related` برای جلوگیری از N+1 query) معمولاً باید توسط توسعه‌دهنده اضافه می‌شد.  
- مدیریت خطا و پیام‌های کاربرپسند به شکل پیش‌فرض کامل نبود.  
- در مستندسازی OpenAPI، توضیحات تولیدی گاهی تکراری یا مبهم بود و نیاز به یک‌دست‌سازی داشت.  

---

## ۹. نیازسنجی‌های ابتدایی و نهایی پروژه

### ۹‑۱. نیازسنجی ابتدایی

**نیازهای اصلی شناسایی‌شده:**

1. سامانهٔ احراز هویت و مدیریت کاربران با نقش‌های مختلف.  
2. ثبت و ردیابی پرونده‌ها با سطح جرم و وضعیت رسیدگی.  
3. امکان ثبت شکایت توسط شهروند و تبدیل آن به پرونده در صورت تأیید.  
4. مدیریت مدارک و اسناد مرتبط با هر پرونده.  
5. مدیریت مظنونین، بازجویی‌ها و وثیقه.  
6. ثبت جلسات دادگاه و احکام نهایی.  
7. ثبت پاداش‌ها و پرداخت‌های مرتبط با عملکرد افسران.  

**تصمیمات اولیه و قوت‌ها:**

- انتخاب Django REST Framework برای بک‌اند و React + TypeScript برای فرانت‌اند.  
- طراحی دامنه بر اساس موجودیت‌های واقعی سیستم پلیس.  
- استفاده از RBAC برای هم‌خوانی با ساختار سازمانی.  

**نقاط ضعف تصمیمات اولیه:**

- استفاده از SQLite به‌جای PostgreSQL برای پایگاه داده در نسخهٔ اولیه.  
- عدم پیش‌بینی نیاز به Real-time features مانند اعلان زنده.  
- برنامه‌ریزی نکردن برای گزارش‌گیری تحلیلی و داشبوردهای مدیریتی پیچیده.  

### ۹‑۲. نیازسنجی نهایی (پس از توسعه)

در طی توسعه، نیازهای جدیدی آشکار شد:

- لزوم وجود مدیریت خطا و loading state در فرانت‌اند → اضافه شدن `ErrorBoundary`, `LoadingSpinner`, `Skeleton`.  
- اهمیت تست‌های واحد برای جلوگیری از regression → اضافه شدن تست‌های Vitest و pytest.  
- نیاز به استقرار ساده در محیط‌های مختلف → اضافه شدن Docker و nginx.  
- نیاز به مستندسازی کامل API → استفاده از drf-spectacular و مستندات Swagger/ReDoc.  

**تصمیمات تقویت‌کننده:**


- بهبود طراحی واکنش‌گرا برای کاربری بهتر در موبایل.  
- جداسازی توابع کمکی و کاهش کد تکراری.  

**موارد باقی‌مانده برای نسخه‌های بعدی:**

- مهاجرت از SQLite به PostgreSQL برای مقیاس‌پذیری و پایداری بیشتر.  
- پیاده‌سازی caching و audit log برای کارایی و امنیت.  
- تکمیل ماژول پرداخت و اتصال آن به درگاه واقعی.  
- افزودن گزارش‌گیری تحلیلی و جست‌وجوی پیشرفته.  

### ۹‑۳. جمع‌بندی نیازسنجی

نسخهٔ فعلی پروژه نیازهای اصلی شناسایی‌شده را برآورده کرده و زیرساخت مناسبی برای توسعهٔ قابلیت‌های پیشرفته‌تر فراهم ساخته است. تصمیمات معماری و انتخاب تکنولوژی‌ها در مجموع مناسب بوده‌اند، اما برای استفاده در محیط عملیاتی سازمانی، تقویت لایهٔ داده، پرداخت و گزارش‌گیری ضروری است.

---

## نتیجه‌گیری کلی

سیستم مدیریت پرونده‌های پلیس پیاده‌سازی‌شده در این پروژه، نمونه‌ای از معماری دو‌لایه‌ای مدرن (بک‌اند Django REST Framework و فرانت‌اند React + TypeScript) است. استفاده از هوش مصنوعی در بسیاری از مراحل (از تولید اسکلت کد تا پیشنهاد الگوهای معماری) سرعت توسعه را بالا برده، اما در تمام مراحل نیاز به بازبینی و تصمیم‌گیری نهایی انسانی وجود داشته است. این پروژه پایه‌ای مناسب برای توسعهٔ نسخه‌های حرفه‌ای‌تر و قابل‌استقرار در محیط سازمانی فراهم می‌کند.

---

## پیوست A: فهرست کامل Commitها

> این فهرست از خروجی `git log --oneline --reverse` استخراج شده و به ترتیب زمانی (جدیدتر → قدیمی‌تر) آورده شده است.

```text
52f8f1b Backend: Initial project setup
c3fb8ec Backend: Add requirements.txt and .gitignore
07226f1 Backend: Configure Django settings --> Add DRF, CORS, and app configurations
4614141 Backend: Implement accounts app --> Custom User model with role-based permissions (RBAC)
2397870 Backend: Implement core app --> Case and CrimeScene models with crime levels and status tracking
f052249 Backend: Implement complaints app --> Complaint model with case relationship and status tracking
47a0ac4 Backend: Implement evidence app --> Evidence models with multiple types (biological, medical, vehicle, identification)
0d8880e Backend: Implement witnesses app --> WitnessStatement model for recording witness testimonies
0339249 Backend: Implement suspects app --> Suspect model with interrogation, custody, and charge tracking
8529acf Backend: Implement trials app --> Trial model with verdict tracking and court information
d3a7556 Backend: Implement rewards app --> Reward and Payment models for officer rewards and bail/fine payments
f0475bc Backend: Implement serializers for all models
15fd366 Backend: Implement API viewsets, permissions, and URL routing for all apps
76d9433 Backend: Add unit tests for User, Case, and Complaint models and APIs
49705b7 Backend: Add README documentation
e00372e Frontend: Initial commit --> Set up TailwindCSS and project structure
0842f99 Frontend: Add TypeScript types and API service layer
a348ed6 Frontend: Add authentication context and layout components
186df3c Frontend: Add Home and Dashboard pages
85cb307 Frontend: Add Cases and Complaints pages with filtering and pagination
6754e44 Frontend: Add Pursuit and Reports pages
7dedb73 Frontend: Add Detective Board and Documents pages
4b8f371 Frontend: Add login and registration pages
91d0f42 Frontend: Add Admin panel and set up routing with React Router
f76fda9 Frontend: Add test setup and unit tests for components and pages
3b9d804 Frontend: Add utility functions and error handling components
520aaf9 Frontend: Add ErrorBoundary and improve responsive design for mobile devices
ecdb7b6 Frontend: update README documentation
8ab82a9 Frontend: Refactor date formatting to use utility functions across all pages
e2972c1 Frontend: Edited .gitignore
9241402 Frotnend: Add Docker, docker-compose configuration and nginx setup for production & Fix API interceptor redirect logic
d36f1c9 Backend: resolve DRF router errors and action decorator typo
a800f16 Fullstack: <fix> sync auth fields between React and Django to resolve 401 error
18b4cf7 Fullstack:  <feat> implement full case lifecycle management and fix access permissions
e44ea1d Backend:  <feat> implement complaint-to-case lifecycle and role-based permissions
d05ebf3 Backend: fix(auth) -> resolve error in user registration
397ebc9 Merge pull request #1 from lrdluffy/backend/fix/registration-error
1580f3d refactor/Improve code readability by renaming password2 to password_confirm
3740612 Fullstack: implement document upload
dcfe4c8 Merge branch 'master' into feature/implement-document-upload
b7dcd33 Backend: <feat> implement complex complaint-to-case lifecycle with 3-strike validation
343d91d Frontend: <feat> add smart complaint form and role-based workflow navigation
02a86ae Fullstack: implement document download and view
7daee4b Merge pull request #5 from lrdluffy/feature/implement-document-feature
d491f2c Fullstack: feat -> implement search and edit features for admin panel
f532e8b Merge pull request #6 from lrdluffy/feature/enhance-user-management
ecbf7cb Merge branch 'feat/complete-complaint-to-case-workflow'
1e5da80 Fullstack: <fix> fix errors in 2 files.
4b720a8 Frontend: <refactor> update police hierarchy access and fix case assignment
2c10d5d Backend: <refactor> add plaintiffs_info to Case model and update serializers
f2ac888 Frontend: <feat> implement plaintiff management and fix Role typos
892cb35 Backend: <feat> implement evidence system with polymorphic models and file upload fix
25b49ce Frontend: <feat> add evidence management forms and gallery view
7b9fa67 Frontend: <feat> add evidence management forms and gallery view
18ab1d3 Backend: fix -> correct minor bug in UserDetailsSerializer
7639050 Merge remote-tracking branch 'origin/master'
b5125e6 Frontend: fix -> correct minor bug related to Admin page
d8cd772 Backend: <feat> add suspect model, serializers and automated trial creation
f197211 Frontend: <feat> integrate suspect management UI and interrogation scoring system
2adea00 Merge remote-tracking branch 'origin/master'
9cec08f Backend: <fix> fix permission bug for police officer in case view
```


