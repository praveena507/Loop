/**
 * Central Configuration for External Portal URLs
 * 
 * Configured via environment variables:
 * - VITE_USER_PORTAL_URL
 * - VITE_ADMIN_ANALYST_PORTAL_URL
 */

export const PORTAL_CONFIG = {
  USER_PORTAL: {
    id: 'user-portal',
    name: 'User Portal',
    badge: 'Citizen / Client Workspace',
    description: 'Submit complaints, verify email, track live status, and provide resolution feedback.',
    url: (import.meta.env.VITE_USER_PORTAL_URL || 'https://user-portal-8vee-1.vercel.app').trim(),
    envKey: 'VITE_USER_PORTAL_URL',
    fallbackLocal: 'https://user-portal-8vee-1.vercel.app'
  },
  ADMIN_ANALYST_PORTAL: {
    id: 'admin-analyst-portal',
    name: 'Admin & Analyst Portal',
    badge: 'Operations & Management Workspace',
    description: 'Manage incoming cases, assign by workload, conduct investigations, coordinate with departments, and finalize resolutions.',
    url: (import.meta.env.VITE_ADMIN_ANALYST_PORTAL_URL || 'https://admin-analyst-portal-1.vercel.app').trim(),
    envKey: 'VITE_ADMIN_ANALYST_PORTAL_URL',
    fallbackLocal: 'https://admin-analyst-portal-1.vercel.app'
  }
};

/**
 * Checks if a portal URL is legitimately configured (not empty and not a placeholder).
 * @param {string} url 
 * @returns {boolean}
 */
export function isPortalConfigured(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.includes('YOUR-USER-PORTAL-URL') || trimmed.includes('YOUR-ADMIN-ANALYST-PORTAL-URL')) {
    return false;
  }
  return true;
}

/**
 * Validates and safely redirects to the requested external portal.
 * @param {'USER_PORTAL' | 'ADMIN_ANALYST_PORTAL'} portalType 
 * @param {Function} [onMissingConfig] - Callback if URL is missing or invalid
 */
export function navigateToPortal(portalType, onMissingConfig) {
  const config = PORTAL_CONFIG[portalType];
  
  if (!config) {
    console.error(`[LOOP Gateway] Unknown portal type: ${portalType}`);
    return;
  }

  const targetUrl = config.url;

  if (!isPortalConfigured(targetUrl)) {
    console.warn(`[LOOP Gateway] ${config.name} URL (${config.envKey}) is not properly configured.`);
    if (typeof onMissingConfig === 'function') {
      onMissingConfig({
        portalName: config.name,
        envKey: config.envKey,
        currentValue: targetUrl || '(empty)'
      });
    } else {
      alert(`Configuration Notice:\n${config.name} URL is not configured yet.\n\nPlease set ${config.envKey} in your environment variables or .env file.`);
    }
    return;
  }

  // Ensure absolute protocol prefix if missing
  let destination = targetUrl;
  if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
    destination = `https://${destination}`;
  }

  window.location.href = destination;
}
