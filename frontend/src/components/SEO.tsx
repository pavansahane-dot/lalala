import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({
  title = 'ZeroTraceVPN - Free VPN Service | No Logs, No Ads',
  description = 'Free, open-source VPN service with WireGuard and OpenVPN support. Zero logs, no ads, unlimited bandwidth. Protect your privacy online.',
  keywords = 'free vpn, wireguard, openvpn, no logs vpn, privacy, security, anonymous browsing, vpn service',
  image = '/og-image.png',
  url = 'https://zerotracevpn.com',
  type = 'website'
}: SEOProps) => {
  const siteTitle = title.includes('ZeroTraceVPN') ? title : `${title} | ZeroTraceVPN`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="ZeroTraceVPN" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
