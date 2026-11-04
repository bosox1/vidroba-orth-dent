# Запис на відробку (Netlify)

Студенти: `https://<сайт>.netlify.app/`
Кафедра:  `https://<сайт>.netlify.app/admin.html`

## Деплой
1. Залий папку в GitHub-репозиторій і в Netlify обери "Import from Git".
   (Або локально: `npm i && npx netlify deploy --prod`.)
   Перетягування папки мишкою НЕ підходить — функції так не збираються.
2. Site configuration → Environment variables:
   - `ADMIN_PASSWORD` — пароль для кафедри (обовʼязково)
   - `PLACE`, `TIME`, `DEPARTMENT` — аудиторія, час, назва кафедри
   - `RESET_HOUR` — о котрій у понеділок обнулення (за замовч. 18)
   - `CAPACITY` — ліміт місць (0 = без ліміту)
3. Після зміни змінних натисни "Deploy site" ще раз.

## Як працює
- Кожен запис зберігається в Netlify Blobs з ключем `<дата понеділка>/<id>`.
- Після понеділка 18:00 (Київ) запис іде на наступний тиждень; старі записи видаляються автоматично при першому ж запиті. Cron не потрібен.
- Кольори — змінні на початку `public/style.css`.
- Свій домен (напр. vidrobka.ifnmu.edu.ua): Domain management → CNAME у Cloudflare.
