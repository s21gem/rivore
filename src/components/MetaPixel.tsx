import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function MetaPixel() {
  const [pixelId, setPixelId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.metaPixelId) {
            setPixelId(data.metaPixelId);
            initPixel(data.metaPixelId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch Meta Pixel ID:', error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (pixelId && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, [location, pixelId]);

  const initPixel = (id: string) => {
    if ((window as any).fbq) return;

    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    (window as any).fbq('init', id);
    (window as any).fbq('track', 'PageView');
  };

  return null;
}

export const trackViewContent = (contentName: string, category: string, value: number, currency: string = 'BDT') => {
  if ((window as any).fbq) {
    (window as any).fbq('track', 'ViewContent', {
      content_name: contentName,
      content_category: category,
      value: value,
      currency: currency,
    });
  }
};

export const trackAddToCart = (contentName: string, category: string, value: number, currency: string = 'BDT') => {
  if ((window as any).fbq) {
    (window as any).fbq('track', 'AddToCart', {
      content_name: contentName,
      content_category: category,
      value: value,
      currency: currency,
    });
  }
};

export const trackInitiateCheckout = (value: number, numItems: number, currency: string = 'BDT') => {
  if ((window as any).fbq) {
    (window as any).fbq('track', 'InitiateCheckout', {
      value: value,
      currency: currency,
      num_items: numItems,
    });
  }
};

export const trackPurchase = (value: number, currency: string = 'BDT', contents?: any[]) => {
  if ((window as any).fbq) {
    (window as any).fbq('track', 'Purchase', {
      value: value,
      currency: currency,
      contents: contents,
    });
  }
};
