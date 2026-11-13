# ModinaLink: Hostinger VPS (Docker + Traefik) ডিপ্লয়

সার্ভার: srv2094141.hstgr.cloud (187.53.139.216), ডোমেইন: modinalink.com
এই কোড এখনো কোনো সার্ভারে চালানো হয়নি। প্রথম চালুর সময় `docker compose logs` দেখুন।

## 1. DNS
modinalink.com ও www এর A রেকর্ড → 187.53.139.216। DNS ছড়ানোর পরে SSL আসবে।

## 2. ফাইল আপলোড
zip আনজিপ করে সার্ভারে `/opt/modinalink/` এ রাখুন (ভেতরে `backend/`, `frontend/`, `docker-compose.yml`)।

## 3. Traefik এর নাম দেখে নিন
```
docker network ls                      # Traefik যে নেটওয়ার্কে আছে
docker inspect $(docker ps -qf name=traefik) | grep -i -E "certresolver|entrypoints"
```
## 4. কনফিগ
```
cd /opt/modinalink
cp .env.docker.example .env && nano .env      # DB পাসওয়ার্ড + Traefik নাম
cp backend/.env.example backend/.env && nano backend/.env
```
`backend/.env` এ: `DB_PASSWORD` (উপরের একই), `DB_HOST=db`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, SMTP। `APP_KEY` ফাঁকা রেখে নিচের কমান্ডে বানান:
```
docker run --rm -v $PWD/backend:/app -w /app php:8.3-cli php -r 'echo "base64:".base64_encode(random_bytes(32)),PHP_EOL;'
```
আউটপুট `APP_KEY=` এর পরে বসান। `APP_ENV=production`, `APP_DEBUG=false` রাখুন।
## 5. চালু
```
docker compose up -d --build
docker compose logs -f api
```
প্রথমবার `api` নিজেই মাইগ্রেশন ও সিড চালায় (অ্যাডমিন তৈরি হয়)। পরে `ADMIN_PASSWORD` মুছে দিন, লগইনে পাসওয়ার্ড বদলান।
## 6. যাচাই
- https://modinalink.com খোলে, https://modinalink.com/api/services JSON দেয়।
- অ্যাডমিন লগইন → "SMS & Payment" এ SMS প্রোভাইডার → টেস্ট SMS।
- আগে শুধু `bank` এনেবল করুন। SSLCommerz sandbox এ পুরো ফ্লো টেস্টের পরে live।
- bKash/Nagad/Rocket/aamarPay ড্রাইভার এখনো নেই (মার্চেন্ট অনুমোদন ও API ডক লাগবে)।
- মূল্য তালিকা ফাঁকা থাকবে যতক্ষণ না অ্যাডমিন থেকে আসল দাম দেন।
