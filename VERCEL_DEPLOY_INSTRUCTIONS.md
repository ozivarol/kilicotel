# Vercel Deployment Çözümleri

## Sorun

Vercel serverless ortamında dosya yazma (`fs.writeFileSync`) çalışmaz.

## Çözüm 1: Vercel Postgres (ÖNERİLEN - ÜCRETSİZ)

### Adımlar:

1. **Vercel Dashboard'a gidin**

   - Storage → Create Database → Postgres seçin
   - Database adı: kilicotel-db
   - Create

2. **Environment Variables otomatik eklenir**

   - Vercel otomatik olarak connection string'i ekler

3. **Kod değişiklikleri gerekir**
   - JSON yerine PostgreSQL kullanacağız
   - Migration dosyaları oluşturacağız

---

## Çözüm 2: Vercel KV (Redis)

1. **Vercel Dashboard**

   - Storage → Create Database → KV
   - Ücretsiz tier yeterli

2. **Hızlı key-value storage**
   - JSON verilerini KV'de saklayabiliriz

---

## Çözüm 3: MongoDB Atlas (ÜCRETSİZ)

1. **MongoDB Atlas hesabı açın**

   - https://www.mongodb.com/cloud/atlas
   - Free tier seçin

2. **Connection string alın**
   - Vercel'e environment variable olarak ekleyin

---

## Çözüm 4: Supabase (ÜCRETSİZ + KOLAY)

1. **Supabase hesabı açın**

   - https://supabase.com
   - New project oluşturun

2. **PostgreSQL database otomatik gelir**
   - API URL ve Key alın
   - Vercel'e ekleyin

---

## HANGİSİNİ SEÇMELİYİM?

**En Kolay:** Vercel KV (Redis) - 5 dakika
**En Güçlü:** Vercel Postgres - 10 dakika  
**En Esnek:** Supabase - 15 dakika

Hangisini isterseniz, size kod örneği verebilirim!
