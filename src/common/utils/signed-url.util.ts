import * as crypto from 'crypto';

interface SignedUrlParams {
  resourcePath: string;
  userId: string;
  ipAddress?: string;
  expiresInSeconds: number;
  secret: string;
}

export function generateSignedUrl({
  resourcePath,
  userId,
  ipAddress,
  expiresInSeconds,
  secret,
}: SignedUrlParams): string {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  
  let stringToSign = `path=${resourcePath}&userId=${userId}&expires=${expires}`;
  if (ipAddress) {
    stringToSign += `&ip=${ipAddress}`;
  }

  const signature = crypto
    .createHmac('sha256', secret)
    .update(stringToSign)
    .digest('hex');

  const urlParams = new URLSearchParams({
    userId,
    expires: expires.toString(),
    signature,
  });

  if (ipAddress) {
    urlParams.set('ip', ipAddress);
  }

  return `${resourcePath}?${urlParams.toString()}`;
}

export function verifySignedUrl(
  url: string,
  secret: string,
): { valid: boolean; expired: boolean; params: any } {
  try {
    const urlObj = new URL(url, 'http://localhost'); // dummy base for relative URLs
    const path = urlObj.pathname;
    const userId = urlObj.searchParams.get('userId');
    const expires = parseInt(urlObj.searchParams.get('expires') || '0', 10);
    const signature = urlObj.searchParams.get('signature');
    const ip = urlObj.searchParams.get('ip');

    if (!userId || !expires || !signature) {
      return { valid: false, expired: false, params: null };
    }

    const now = Math.floor(Date.now() / 1000);
    if (now > expires) {
      return { valid: false, expired: true, params: { userId, expires, ip } };
    }

    let stringToSign = `path=${path}&userId=${userId}&expires=${expires}`;
    if (ip) {
      stringToSign += `&ip=${ip}`;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(stringToSign)
      .digest('hex');

    const valid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

    return {
      valid,
      expired: false,
      params: { userId, expires, ip },
    };
  } catch (error) {
    return { valid: false, expired: false, params: null };
  }
}
