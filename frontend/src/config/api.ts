const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalhost) {
      const backendPort = port === '5173' || port === '3000' ? '8080' : port;
      return `${protocol}//${hostname}:${backendPort}/api`;
    }

    // En producción, si el frontend está en siscoca.yego.pro, usar apisiscoca.yego.pro para el backend
    if (hostname === 'siscoca.yego.pro' || hostname.includes('siscoca.yego.pro')) {
      return 'https://apisiscoca.yego.pro/api';
    }

    return `${protocol}//${hostname}${port ? `:${port}` : ''}/api`;
  }

  return 'https://apisiscoca.yego.pro/api';
};

export const API_BASE_URL = resolveBaseUrl();

