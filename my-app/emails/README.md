# 📧 Email Templates - Alin Coffee

Email templates dengan branding Alin Coffee untuk autentikasi Supabase.

## 📁 File Templates

1. **confirm-signup.html** - Email verifikasi saat user mendaftar
2. **reset-password.html** - Email untuk reset password
3. **magic-link.html** - Email untuk login tanpa password (opsional)

---

## 🚀 Cara Setup di Supabase Dashboard

### Step 1: Buka Supabase Dashboard

1. Login ke [Supabase](https://supabase.com/dashboard)
2. Pilih project Alin Coffee Anda
3. Buka **Authentication** → **Email Templates**

### Step 2: Copy Template ke Dashboard

#### **Untuk Confirm Signup:**

1. Klik tab **"Confirm signup"**
2. Buka file `confirm-signup.html` di editor
3. **Copy semua isi file** (Ctrl+A → Ctrl+C)
4. **Paste** ke editor di Supabase Dashboard
5. Klik **Save**

#### **Untuk Reset Password:**

1. Klik tab **"Reset password"**
2. Buka file `reset-password.html`
3. **Copy semua isi file**
4. **Paste** ke editor di Supabase Dashboard
5. Klik **Save**

#### **Untuk Magic Link (Opsional):**

1. Klik tab **"Magic Link"**
2. Buka file `magic-link.html`
3. **Copy semua isi file**
4. **Paste** ke editor di Supabase Dashboard
5. Klik **Save**

---

## ⚙️ Konfigurasi Email di Supabase

### Enable Email Confirmation (Production)

**Dashboard → Authentication → Email Auth:**

✅ **Enable email confirmations** - ON  
✅ **Secure email change** - ON  
✅ **Double confirm email changes** - ON (recommended)

### SMTP Settings (Untuk Production)

Jika ingin pakai custom email domain (tidak wajib untuk development):

**Dashboard → Project Settings → Authentication:**

1. **SMTP Host**: smtp.gmail.com (contoh untuk Gmail)
2. **SMTP Port**: 587
3. **SMTP User**: youremail@gmail.com
4. **SMTP Password**: App Password Anda
5. **SMTP Sender**: Alin Coffee <noreply@alincoffee.com>

> **Catatan:** Untuk Gmail, Anda harus menggunakan [App Password](https://support.google.com/accounts/answer/185833), bukan password akun biasa.

---

## 🧪 Testing Email Templates

### Development Mode (Tanpa Email Confirmation)

Untuk testing cepat, matikan email confirmation:

**Dashboard → Authentication → Email Auth:**

- **Disable** "Enable email confirmations"

User bisa langsung login tanpa verify email.

### Testing dengan Email Asli

1. **Enable** email confirmation
2. Pakai email asli saat signup (Gmail, Yahoo, dll)
3. Cek inbox → Klik link verifikasi
4. Pastikan design email sudah sesuai

---

## 🎨 Customization

Template sudah menggunakan:

- ✅ Warna **Amber (#f59e0b)** untuk branding
- ✅ Dark theme sesuai dengan aplikasi
- ✅ Responsive design
- ✅ Icon coffee emoji

### Cara Edit Template:

1. Buka file HTML yang ingin diedit
2. Cari bagian yang mau diubah (text, warna, dll)
3. Edit sesuai kebutuhan
4. Copy ulang ke Supabase Dashboard

**Contoh perubahan:**

```html
<!-- Ganti email support -->
<a href="mailto:support@alincoffee.com">Hubungi Kami</a>

<!-- Ganti nama brand -->
<h1 class="logo-text">ALIN<span style="color: #f59e0b;">COFFEE</span></h1>

<!-- Ganti warna theme (Amber → warna lain) -->
background: linear-gradient(135deg, #YOUR_COLOR, #YOUR_COLOR_DARK);
```

---

## ✅ Checklist Deployment

- [ ] Template `confirm-signup.html` di-copy ke Supabase
- [ ] Template `reset-password.html` di-copy ke Supabase
- [ ] Template `magic-link.html` di-copy ke Supabase (opsional)
- [ ] Email confirmation di-enable (untuk production)
- [ ] SMTP settings di-konfigurasi (jika pakai custom domain)
- [ ] Testing signup flow dengan email asli
- [ ] Testing reset password flow
- [ ] Email template sudah sesuai dengan branding

---

## 📝 Catatan Penting

1. **Variabel Supabase** yang sudah tersedia di template:
   - `{{ .ConfirmationURL }}` - Link untuk verifikasi/reset/login
   - `{{ .SiteURL }}` - URL aplikasi Anda
   - `{{ .TokenHash }}` - Token hash untuk keamanan

2. **Jangan edit variabel `{{ .ConfirmationURL }}`** - Ini otomatis di-replace oleh Supabase.

3. **Link expiry:**
   - Confirm signup: 24 jam
   - Reset password: 1 jam
   - Magic link: 1 jam

4. **Email akan dikirim otomatis** oleh Supabase saat:
   - User signup → kirim confirm-signup.html
   - User klik "Lupa Password" → kirim reset-password.html
   - User request magic link → kirim magic-link.html

---

## 🆘 Troubleshooting

**Email tidak terkirim?**

- Cek SMTP settings di Supabase
- Pastikan email confirmation enabled
- Cek spam folder di inbox user

**Template tidak muncul dengan benar?**

- Pastikan copy seluruh isi file HTML (termasuk `<!DOCTYPE html>`)
- Jangan edit variabel `{{ .ConfirmationURL }}`

**Ingin kembali ke template default?**

- Di Supabase Dashboard, klik tombol **"Revert to default template"**

---

**Dibuat untuk:** Alin Coffee  
**Tech Stack:** Supabase Auth + Custom HTML Email Templates  
**Maintainer:** Development Team
