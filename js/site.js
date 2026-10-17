document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  function closeMenu() { toggle?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('open'); }
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) { closeMenu(); toggle.focus(); }
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  matchMedia('(min-width: 1051px)').addEventListener('change', closeMenu);

  const form = document.querySelector('#enquiry-form');
  if (!form) return;
  const params = new URLSearchParams(location.search);
  const capability = params.get('capability') || params.get('division');
  if ([...form.elements.capability.options].some(option => option.value === capability)) form.elements.capability.value = capability;
  const purpose = params.get('purpose');
  if ([...form.elements.purpose.options].some(option => option.value === purpose)) form.elements.purpose.value = purpose;
  const panel = document.querySelector('#draft-panel');
  form.addEventListener('input', () => { panel.hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const selected = name => form.elements[name].selectedOptions[0].textContent;
    const subject = `${selected('purpose')}: ${selected('capability')} — ${data.get('organisation') || data.get('name')}`;
    const body = `Dear Ankush Enterprises team,\n\n${data.get('requirement').trim()}\n\nEnquiry type: ${selected('purpose')}\nCapability: ${selected('capability')}\nTimeline: ${data.get('timeline')}\nLocation: ${data.get('location') || 'To be discussed'}\n\nName: ${data.get('name')}\nOrganisation: ${data.get('organisation') || 'Not specified'}\nEmail: ${data.get('email')}\nTelephone: ${data.get('phone') || 'Not specified'}\n\nPlease advise on the next steps.\n`;
    document.querySelector('#draft-subject').value = subject;
    document.querySelector('#draft-body').value = body;
    document.querySelector('#draft-open').href = `mailto:office@ankushenterprises.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.querySelector('#draft-status').textContent = '';
    panel.hidden = false;
    document.querySelector('#draft-title').focus();
    panel.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
  });
  document.querySelector('#copy-draft').addEventListener('click', async () => {
    const text = `To: office@ankushenterprises.in\nSubject: ${document.querySelector('#draft-subject').value}\n\n${document.querySelector('#draft-body').value}`;
    try { await navigator.clipboard.writeText(text); document.querySelector('#draft-status').textContent = 'Draft copied. Paste it into your email service and send when ready.'; }
    catch { document.querySelector('#draft-body').focus(); document.querySelector('#draft-body').select(); document.querySelector('#draft-status').textContent = 'Select and copy the draft above. Automatic clipboard access is unavailable.'; }
  });
});
