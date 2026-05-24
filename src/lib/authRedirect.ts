const configuredAuthRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function getAuthRedirectUrl(hashPath = '/') {
  const baseUrl = configuredAuthRedirectUrl
    ? trimTrailingSlash(configuredAuthRedirectUrl)
    : trimTrailingSlash(`${window.location.origin}${window.location.pathname}`);

  const normalizedHashPath = hashPath.startsWith('/') ? hashPath : `/${hashPath}`;

  return `${baseUrl}#${normalizedHashPath}`;
}
