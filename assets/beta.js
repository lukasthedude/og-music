// The TestFlight button asks for a password first. The link is only here
// encrypted with it (PBKDF2 → AES-GCM), so the page's source doesn't give
// it away, and the password isn't in it either.
(() => {
  const sealed = { salt: 'Ib9HEFptDQQh4/r60VPtzQ==', iv: '8DlEQ1WPYHUPM6/C', data: 'sWBfyOCRU+5hz2AnDEQ0/4ObOuEiYRVXARhgsjDnXp859Mkrj240LU4XARw+Ff5R0sCoKN5VcnZCZw==' };
  const button = document.getElementById('beta');
  const form = document.getElementById('unlock');
  const input = form.querySelector('input');
  const bytes = (base64) => Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  async function unseal(password) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: bytes(sealed.salt), iterations: 250000, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const url = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(sealed.iv) }, key, bytes(sealed.data));
    return new TextDecoder().decode(url);
  }

  button.addEventListener('click', () => {
    button.hidden = true;
    form.hidden = false;
    input.focus();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      location.href = await unseal(input.value);
    } catch {
      input.value = '';
      input.placeholder = 'Wrong password';
      form.classList.remove('wrong');
      void form.offsetWidth; // (to shake again)
      form.classList.add('wrong');
      input.focus();
    }
  });
})();
