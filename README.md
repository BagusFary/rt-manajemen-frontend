# Panduan Instalasi (Frontend): Sistem Informasi Manajemen RT (SIM RT)


### Requirement 
Sebelum memulai, pastikan perangkat Anda sudah terinstal:
*   **PHP** (v8.1 atau lebih baru)
*   **Composer**
*   **Node.js** (LTS version) & **NPM**
*   **Database Server** (MySQL)
---

### 2. Setup Frontend (React.js)

Langkah-langkah untuk menyiapkan user interface:

1.  **Masuk ke Direktori Frontend**
    (Buka terminal baru agar server backend tetap berjalan)
    ```bash
    cd rt-manajemen-frontend
    ```

2.  **Install Dependensi Node.js**
    ```bash
    npm install
    ```

3.  **Konfigurasi API URL**
    Pastikan file `.env` di folder frontend mengarah ke URL Backend Laravel:
    ```env
    VITE_API_BASE_URL=http://127.0.0.1:8000/api
    ```

4.  **Jalankan Development Server**
    ```bash
    npm run dev
    ```
    *Aplikasi Frontend siap diakses di: `http://localhost:5173`*

---
### Kredensial Login (Admin)
Setelah menjalankan perintah `php artisan db:seed`, gunakan akun berikut untuk masuk ke sistem:

*   **Email:** `rt.admin@jagoanhosting.com`
*   **Password:** `password123`
*   **Nama Akun:** Pak RT Rizal Faizal
---
---
*Dokumentasi ini disusun secara profesional untuk keperluan Skill Fit Test PT. Beon Intermedia .*
