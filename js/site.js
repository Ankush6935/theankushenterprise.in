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
  if (capability && [...form.elements.capability.options].some(option => option.value === capability)) form.elements.capability.value = capability;
  const purpose = params.get('purpose');
  if (purpose && [...form.elements.purpose.options].some(option => option.value === purpose)) form.elements.purpose.value = purpose;

  const submitBtn = document.querySelector('#enquiry-submit-btn');
  const btnText = document.querySelector('#btn-text');
  const btnSpinner = document.querySelector('#btn-spinner');
  const receiptPanel = document.querySelector('#submission-receipt');
  const errorAlert = document.querySelector('#form-error-alert');
  const submitAnotherBtn = document.querySelector('#submit-another-btn');

  function setLoading(loading) {
    if (loading) {
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Transmitting to Procurement Desk...';
      if (btnSpinner) btnSpinner.hidden = false;
      if (errorAlert) errorAlert.style.display = 'none';
    } else {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Submit Enquiry ↗';
      if (btnSpinner) btnSpinner.hidden = true;
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    setLoading(true);

    const data = new FormData(form);
    const selected = name => form.elements[name]?.selectedOptions[0]?.textContent || '';
    const purposeLabel = selected('purpose');
    const capabilityLabel = selected('capability') || 'General / Multi-Discipline Requirement';
    const org = (data.get('organisation') || '').trim();
    const name = (data.get('name') || '').trim();
    const email = (data.get('email') || '').trim();
    const phone = (data.get('phone') || '').trim();
    const locationVal = (data.get('location') || '').trim();
    const timeline = data.get('timeline') || 'Planning / Budgetary';
    const requirement = (data.get('requirement') || '').trim();

    const subject = `[New Technical Enquiry] ${purposeLabel}: ${capabilityLabel} — ${org || name}`;

    const payload = {
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
      _replyto: email,
      'Enquirer Name': name,
      'Organisation / Formation': org || 'Not Specified',
      'Official Email Address': email,
      'Telephone / Extension': phone || 'Not Specified',
      'Enquiry Type': purposeLabel,
      'Operational Capability / Division': capabilityLabel,
      'Project Location': locationVal || 'To be discussed',
      'Target Timeline': timeline,
      'Requirement Specifications': requirement
    };

    try {
      const response = await fetch('https://formsubmit.co/ajax/office@theankushenterprises.in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      // Accept success or initial activation response from FormSubmit
      if (response.ok || result.success === "true" || result.success === true || (result.message && result.message.includes('Activation'))) {
        // Populate receipt summary
        document.querySelector('#receipt-name').textContent = name;
        document.querySelector('#receipt-org').textContent = org || 'Institutional / Private';
        document.querySelector('#receipt-email').textContent = email;
        document.querySelector('#receipt-phone').textContent = phone || 'Not specified';
        document.querySelector('#receipt-purpose').textContent = purposeLabel;
        document.querySelector('#receipt-capability').textContent = capabilityLabel;
        document.querySelector('#receipt-timeline').textContent = `${locationVal ? locationVal + ' · ' : ''}${timeline}`;
        document.querySelector('#receipt-requirement').textContent = requirement;

        const now = new Date();
        document.querySelector('#receipt-timestamp').textContent = now.toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata'
        }) + ' IST';

        // Hide form and show confirmation receipt
        form.hidden = true;
        receiptPanel.hidden = false;
        document.querySelector('#receipt-title').focus();
        receiptPanel.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      } else {
        throw new Error(result.message || 'Submission could not be completed.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setLoading(false);
      errorAlert.textContent = 'Transmission error: Unable to submit online at this moment. Please email our desk directly at office@theankushenterprises.in or call +91 98498 79465.';
      errorAlert.style.display = 'block';
    }
  });

  submitAnotherBtn?.addEventListener('click', () => {
    form.reset();
    setLoading(false);
    receiptPanel.hidden = true;
    form.hidden = false;
    form.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
  });
});
