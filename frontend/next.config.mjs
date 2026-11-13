/** @type {import('next').NextConfig} */
const designPages = [
  {
    "source": "/",
    "destination": "/pages/Main.html"
  },
  {
    "source": "/services",
    "destination": "/pages/Services.html"
  },
  {
    "source": "/services/detail",
    "destination": "/pages/ServiceDetail.html"
  },
  {
    "source": "/quote",
    "destination": "/pages/Quote.html"
  },
  {
    "source": "/prices",
    "destination": "/pages/Pricing.html"
  },
  {
    "source": "/price-list",
    "destination": "/pages/PriceList.html"
  },
  {
    "source": "/login",
    "destination": "/pages/Auth.html"
  },
  {
    "source": "/help",
    "destination": "/pages/KnowledgeBase.html"
  },
  {
    "source": "/finder",
    "destination": "/pages/Finder.html"
  },
  {
    "source": "/software",
    "destination": "/pages/SoftwareCatalog.html"
  },
  {
    "source": "/software-types",
    "destination": "/pages/SoftwareTypes.html"
  },
  {
    "source": "/company",
    "destination": "/pages/Company.html"
  },
  {
    "source": "/industries",
    "destination": "/pages/Industry.html"
  },
  {
    "source": "/portfolio",
    "destination": "/pages/Portfolio.html"
  },
  {
    "source": "/trust",
    "destination": "/pages/Trust.html"
  },
  {
    "source": "/research",
    "destination": "/pages/Research.html"
  },
  {
    "source": "/engagement",
    "destination": "/pages/Engagement.html"
  },
  {
    "source": "/it-services",
    "destination": "/pages/ITServices.html"
  },
  {
    "source": "/status",
    "destination": "/pages/Status.html"
  },
  {
    "source": "/brand-kit",
    "destination": "/pages/BrandKit.html"
  },
  {
    "source": "/brand",
    "destination": "/pages/Brand.html"
  },
  {
    "source": "/design/reports",
    "destination": "/pages/Reports.html"
  },
  {
    "source": "/design/billing",
    "destination": "/pages/Billing.html"
  },
  {
    "source": "/design/admin",
    "destination": "/pages/Admin.html"
  },
  {
    "source": "/design/admin-cms",
    "destination": "/pages/AdminCMS.html"
  },
  {
    "source": "/design/admin-integrations",
    "destination": "/pages/AdminIntegrations.html"
  },
  {
    "source": "/design/portal",
    "destination": "/pages/Portal.html"
  },
  {
    "source": "/design/mobile-home",
    "destination": "/pages/MobileHome.html"
  },
  {
    "source": "/design/mobile-admin",
    "destination": "/pages/MobileAdmin.html"
  }
];
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [{ source: '/register', destination: '/login#register', permanent: false }];
  },
  async rewrites() {
    return { beforeFiles: designPages.concat([
      { source: '/portal', destination: '/pages/Portal.html' },
      { source: '/admin', destination: '/pages/Admin.html' },
    ]) };
  },
};
export default nextConfig;
