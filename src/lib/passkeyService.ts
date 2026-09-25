/**
 * Standard WebAuthn / Passkey / Windows Hello Client Helpers
 * 
 * Supports:
 * - Windows Hello Face, Fingerprint, PIN
 * - Apple Touch ID / Face ID
 * - Android Biometric / Screen Lock
 * - Hardware Security Keys (YubiKey)
 * 
 * Complies with strict security standards:
 * - Zero biometric data or images stored or transmitted
 * - Uses asymmetric public-key cryptography
 * - Hardware TPM/Secure Enclave attestation
 */

import { getAdminToken } from './api';

// Helper: Get Authorization header with Bearer token
function getAuthHeader(): Record<string, string> {
  const token = getAdminToken() || (typeof window !== 'undefined' ? (localStorage.getItem('alkhalil_admin_token') || sessionStorage.getItem('alkhalil_admin_token')) : null);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper: base64url encode an ArrayBuffer
export function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Helper: base64url string to Uint8Array
export function base64UrlToBuffer(base64url: string): Uint8Array {
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Checks if the current browser window is inside an iframe/embedded context
 */
export function isInIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Checks if the current browser and platform support WebAuthn / Passkeys
 */
export async function isPasskeySupported(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  try {
    if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return Boolean(available);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Register a new Passkey / Windows Hello authenticator for the Admin
 */
export async function registerPasskey(name = 'Windows Hello / Platform Authenticator'): Promise<{
  success: boolean;
  credential?: any;
  error?: string;
}> {
  if (typeof window === 'undefined' || !navigator.credentials) {
    throw new Error('WebAuthn is not supported in this browser.');
  }

  // 1. Fetch challenge from server
  const optRes = await fetch('/api/admin/passkey/register-options', {
    headers: { ...getAuthHeader() }
  });
  if (!optRes.ok) {
    const err = await optRes.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to initialize Passkey registration.');
  }
  const options = await optRes.json();

  // 2. Decode challenge and user.id from base64url to Buffer
  const challengeBuffer = base64UrlToBuffer(options.challenge);
  const userIdBuffer = base64UrlToBuffer(options.user.id);

  const excludeCredentials = (options.excludeCredentials || []).map((cred: any) => ({
    ...cred,
    id: base64UrlToBuffer(cred.id)
  }));

  const createOptions: PublicKeyCredentialCreationOptions = {
    challenge: challengeBuffer,
    rp: options.rp,
    user: {
      id: userIdBuffer,
      name: options.user.name,
      displayName: options.user.displayName
    },
    pubKeyCredParams: options.pubKeyCredParams,
    authenticatorSelection: options.authenticatorSelection,
    timeout: options.timeout || 60000,
    attestation: options.attestation || 'none',
    excludeCredentials
  };

  // 3. Prompt user with Windows Hello / platform authenticator
  let credential: PublicKeyCredential | null = null;
  try {
    credential = (await navigator.credentials.create({
      publicKey: createOptions
    })) as PublicKeyCredential;
  } catch (webauthnErr: any) {
    if (webauthnErr.name === 'NotAllowedError') {
      if (isInIframe()) {
        throw new Error('WebAuthn is blocked inside preview iframes by browser Permissions Policy. Please open the website directly in its own browser tab / window to enroll your Windows Hello passkey.');
      }
      throw new Error(webauthnErr.message || 'Passkey creation was cancelled or timed out.');
    } else if (webauthnErr.name === 'SecurityError') {
      throw new Error('WebAuthn Security Error: Browser blocked credential creation. Ensure the site is accessed via HTTPS and opened directly in its own top-level window.');
    }
    throw webauthnErr;
  }

  if (!credential) {
    throw new Error('Registration was cancelled or failed.');
  }

  const rawResponse = credential.response as AuthenticatorAttestationResponse;

  // 4. Send public key attestation back to server
  const registrationPayload = {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    name,
    response: {
      clientDataJSON: bufferToBase64Url(rawResponse.clientDataJSON),
      attestationObject: bufferToBase64Url(rawResponse.attestationObject)
    }
  };

  // Auth token required for registering new passkey
  const verifyRes = await fetch('/api/admin/passkey/register-verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(registrationPayload)
  });

  const verifyJson = await verifyRes.json();
  if (!verifyRes.ok) {
    throw new Error(verifyJson.error || 'Failed to verify and save Passkey.');
  }

  return { success: true, credential: verifyJson.data };
}

/**
 * Authenticate Admin using Passkey / Windows Hello
 */
export async function authenticateWithPasskey(): Promise<{
  token: string;
  message: string;
}> {
  if (typeof window === 'undefined' || !navigator.credentials) {
    throw new Error('WebAuthn is not supported in this browser.');
  }

  // 1. Fetch authentication options and challenge
  const optRes = await fetch('/api/admin/passkey/auth-options');
  if (!optRes.ok) {
    const err = await optRes.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get Passkey authentication options.');
  }
  const options = await optRes.json();

  if (!options.allowCredentials || options.allowCredentials.length === 0) {
    throw new Error('No Passkey registered yet on this device. Please log in with your Admin PIN first to enroll Windows Hello.');
  }

  const challengeBuffer = base64UrlToBuffer(options.challenge);
  const allowCredentials = options.allowCredentials.map((cred: any) => ({
    ...cred,
    id: base64UrlToBuffer(cred.id)
  }));

  const getOptions: PublicKeyCredentialRequestOptions = {
    challenge: challengeBuffer,
    rpId: options.rpId,
    allowCredentials,
    userVerification: options.userVerification || 'preferred',
    timeout: options.timeout || 60000
  };

  // 2. Invoke Windows Hello / Platform Authenticator prompt
  let assertion: PublicKeyCredential | null = null;
  try {
    assertion = (await navigator.credentials.get({
      publicKey: getOptions
    })) as PublicKeyCredential;
  } catch (webauthnErr: any) {
    if (webauthnErr.name === 'NotAllowedError') {
      if (isInIframe()) {
        throw new Error('WebAuthn is blocked inside preview iframes by browser Permissions Policy. Please open the website directly in its own browser tab / window to use Windows Hello.');
      }
      throw new Error(webauthnErr.message || 'Passkey verification was cancelled or timed out.');
    } else if (webauthnErr.name === 'SecurityError') {
      throw new Error('WebAuthn Security Error: Browser blocked authentication. Ensure the site is accessed via HTTPS and opened directly in its own top-level window.');
    }
    throw webauthnErr;
  }

  if (!assertion) {
    throw new Error('Passkey verification was cancelled.');
  }

  const assertionResponse = assertion.response as AuthenticatorAssertionResponse;

  // 3. Send signed assertion to server
  const authPayload = {
    id: assertion.id,
    rawId: bufferToBase64Url(assertion.rawId),
    type: assertion.type,
    response: {
      clientDataJSON: bufferToBase64Url(assertionResponse.clientDataJSON),
      authenticatorData: bufferToBase64Url(assertionResponse.authenticatorData),
      signature: bufferToBase64Url(assertionResponse.signature),
      userHandle: assertionResponse.userHandle ? bufferToBase64Url(assertionResponse.userHandle) : null
    }
  };

  const verifyRes = await fetch('/api/admin/passkey/auth-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authPayload)
  });

  const verifyJson = await verifyRes.json();
  if (!verifyRes.ok) {
    throw new Error(verifyJson.error || 'Passkey authentication failed.');
  }

  // Store token using standard setter
  if (verifyJson.token) {
    localStorage.setItem('alkhalil_admin_token', verifyJson.token);
  }

  return verifyJson;
}

/**
 * Fetch registered Passkeys list (Protected)
 */
export async function fetchRegisteredPasskeys(): Promise<{
  passkeys: Array<{ id: string; name: string; createdAt: string }>;
}> {
  const res = await fetch('/api/admin/passkeys', {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) {
    return { passkeys: [] };
  }
  const json = await res.json();
  return { passkeys: json.data || [] };
}

/**
 * Delete a registered Passkey (Protected)
 */
export async function deleteRegisteredPasskey(credentialId: string): Promise<boolean> {
  const res = await fetch(`/api/admin/passkey/${encodeURIComponent(credentialId)}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  return res.ok;
}
