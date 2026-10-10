// Update invitation content here before publishing.
const invitation = {
  firstName: 'Ranelia Parigde',
  secondName: 'Mark Jan Villadar',
  date: '2026-12-01T15:00:00+08:00',
  // Used for the "Add to calendar" event end time.
  endDate: '2026-12-01T21:00:00+08:00',
  welcome: 'A new chapter begins on December 1, and it would mean so much to celebrate it with you. Thank you for being part of the story that brought us here.',
  ceremonyTime: '3:00 PM',
  // First line is the church name; the rest is its address.
  ceremony: 'New Heights Fundamental Baptist Church\nSan Rafael, Miagao, Iloilo',
  receptionTime: '5:00 PM',
  reception: 'Dinner & celebration to follow',
  place: 'San Rafael · Miagao · Iloilo',
  location: 'New Heights Fundamental Baptist Church\nSan Rafael, Miagao, Iloilo',
  map: 'https://www.google.com/maps/search/?api=1&query=New+Heights+Fundamental+Baptist+Church%2C+San+Rafael%2C+Miagao%2C+Iloilo%2C+Philippines',
  // First line is the dress code; the second is shown beneath it.
  dressCode: 'Semi-formal\nFloor-length dresses',
  message: [
    'With joyful hearts we invite you to celebrate our wedding on December 1, 2026.',
    'After years of love and prayer we cannot imagine this day without you.',
    'This intimate celebration is reserved for invited guests only.',
    'No plus-ones please. RSVP by November 10, 2026 to reserve your seat.',
  ],
};

const getElement = (id) => document.getElementById(id);
const letterAnimationTimers = [];

function clearLetterAnimationTimers() {
  letterAnimationTimers.forEach((timer) => window.clearTimeout(timer));
  letterAnimationTimers.length = 0;
}

function renderLetterMessage() {
  const message = getElement('message');
  const fullMessage = invitation.message.join('\n\n');
  message.setAttribute('role', 'text');
  message.setAttribute('aria-label', fullMessage);
  message.replaceChildren(...invitation.message.map((text) => {
    const paragraph = document.createElement('p');
    paragraph.setAttribute('aria-hidden', 'true');

    text.split(/(\s+)/u).forEach((part) => {
      if (!part) return;
      if (/^\s+$/u.test(part)) {
        paragraph.append(document.createTextNode(part));
        return;
      }

      const word = document.createElement('span');
      word.className = 'letter-word';
      word.setAttribute('aria-hidden', 'true');
      Array.from(part).forEach((character, index) => {
        const letter = document.createElement('span');
        letter.className = 'letter-glyph';
        letter.style.setProperty('--letter-delay', `${index * 14}ms`);
        letter.textContent = character;
        word.append(letter);
      });

      ['sparkle-one', 'sparkle-two', 'sparkle-three'].forEach((particleClass) => {
        const particle = document.createElement('span');
        particle.className = `word-sparkle ${particleClass}`;
        particle.setAttribute('aria-hidden', 'true');
        word.append(particle);
      });

      paragraph.append(word);
    });

    return paragraph;
  }));
}

function renderSignature() {
  const signature = getElement('signoff');
  const fullSignature = `${invitation.firstName} & ${invitation.secondName}`;
  signature.setAttribute('role', 'text');
  signature.setAttribute('aria-label', fullSignature);

  const firstName = document.createElement('span');
  firstName.className = 'signature-name signature-name-first';
  firstName.setAttribute('aria-hidden', 'true');
  firstName.textContent = invitation.firstName;

  const joiner = document.createElement('span');
  joiner.className = 'signature-joiner';
  joiner.setAttribute('aria-hidden', 'true');
  joiner.textContent = ' & ';

  const secondName = document.createElement('span');
  secondName.className = 'signature-name signature-name-second';
  secondName.setAttribute('aria-hidden', 'true');
  secondName.textContent = invitation.secondName;
  signature.replaceChildren(firstName, joiner, secondName);
}

function resetLetterReveal() {
  clearLetterAnimationTimers();
  const paper = getElement('letterPaper');
  paper.classList.remove('is-revealing', 'reveal-complete', 'reveal-skipped', 'reveal-reduced');
  delete paper.dataset.revealScheduled;
  paper.style.removeProperty('--signature-start');
  getElement('closeLetter').disabled = true;
  getElement('letterContinue').disabled = true;
}

function completeLetterReveal({ skipped = false, reduced = false } = {}) {
  clearLetterAnimationTimers();
  const paper = getElement('letterPaper');
  paper.classList.remove('is-revealing');
  if (skipped) paper.classList.add('reveal-skipped');
  if (reduced) paper.classList.add('reveal-reduced');
  paper.classList.add('reveal-complete');
  getElement('closeLetter').disabled = false;
  getElement('letterContinue').disabled = false;
}

function beginLetterReveal() {
  const paper = getElement('letterPaper');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    completeLetterReveal({ reduced: true });
    return;
  }

  const wordInterval = window.matchMedia('(max-width: 620px)').matches ? 40 : 160;
  let delay = 0;
  let longestWord = 0;

  paper.classList.add('is-revealing');
  paper.querySelectorAll('.letter-word').forEach((word) => {
    word.style.setProperty('--word-delay', `${delay}ms`);
    const letterCount = word.querySelectorAll('.letter-glyph').length;
    longestWord = Math.max(longestWord, letterCount);
    delay += wordInterval;

    const text = word.textContent.trim();
    if (/[,;:]$/u.test(text)) delay += 400;
    else if (/[.!?]$/u.test(text)) delay += 700;
  });

  const bodyDuration = delay + 600 + Math.max(0, longestWord - 1) * 14;
  paper.style.setProperty('--signature-start', `${bodyDuration}ms`);

  letterAnimationTimers.push(window.setTimeout(() => {
    paper.classList.add('reveal-complete');
    getElement('closeLetter').disabled = false;
    getElement('letterContinue').disabled = false;
  }, bodyDuration + 3000));
}

function scheduleLetterReveal() {
  const paper = getElement('letterPaper');
  if (paper.dataset.revealScheduled === 'true') return;
  paper.dataset.revealScheduled = 'true';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    beginLetterReveal();
    return;
  }

  letterAnimationTimers.push(window.setTimeout(beginLetterReveal, 1200));
}

function formatFullDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date to be announced';

  return new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function toCalendarStamp(value) {
  return new Date(value).toISOString().replace(/[-:]/gu, '').replace(/\.\d{3}/u, '');
}

function escapeIcsText(text) {
  return text.replace(/[\\;,]/gu, (match) => `\\${match}`).replace(/\n/gu, '\\n');
}

function renderCalendarLinks() {
  const start = new Date(invitation.date);
  const end = new Date(invitation.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

  const title = `${splitName(invitation.firstName).givenNames} & ${splitName(invitation.secondName).givenNames}'s Wedding`;
  const location = invitation.location.replace(/\n/gu, ', ');
  const details = `Ceremony, ${invitation.ceremonyTime}: ${invitation.ceremony.replace(/\n/gu, ', ')}\nReception, ${invitation.receptionTime}: ${invitation.reception.replace(/\n/gu, ', ')}\n${window.location.href}`;
  const dates = `${toCalendarStamp(start)}/${toCalendarStamp(end)}`;

  const googleParams = new URLSearchParams({ action: 'TEMPLATE', text: title, dates, location, details });
  getElement('googleCalendarLink').href = `https://calendar.google.com/calendar/render?${googleParams}`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//EN',
    'BEGIN:VEVENT',
    `UID:${toCalendarStamp(start)}-wedding@invitation`,
    `DTSTAMP:${toCalendarStamp(new Date())}`,
    `DTSTART:${toCalendarStamp(start)}`,
    `DTEND:${toCalendarStamp(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(details)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(title)} is tomorrow`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  getElement('icsCalendarLink').href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
}

function renderDateLockup(date) {
  if (Number.isNaN(date.getTime())) return;

  const part = (options) => new Intl.DateTimeFormat('en', { timeZone: 'Asia/Manila', ...options }).format(date);
  const time = part({ hour: 'numeric', minute: '2-digit' });
  getElement('heroWeekday').textContent = part({ weekday: 'long' });
  getElement('heroMonth').textContent = part({ month: 'long' });
  getElement('heroDay').textContent = part({ day: '2-digit' });
  getElement('heroYear').textContent = part({ year: 'numeric' });
  getElement('heroTime').textContent = time;
  document.querySelector('.date-lockup').setAttribute('aria-label', `${formatFullDate(invitation.date)} at ${time}`);
}

function splitName(name) {
  const parts = name.trim().split(/\s+/u);
  return {
    givenNames: parts.slice(0, -1).join(' '),
    surname: parts.at(-1) || '',
  };
}

function renderInvitation() {
  const date = new Date(invitation.date);
  const first = splitName(invitation.firstName);
  const second = splitName(invitation.secondName);

  getElement('nameOne').textContent = first.givenNames;
  getElement('nameTwo').textContent = second.givenNames;
  getElement('surnameOne').textContent = first.surname;
  getElement('surnameTwo').textContent = second.surname;
  getElement('openingNameOne').textContent = first.givenNames;
  getElement('openingNameTwo').textContent = second.givenNames;
  getElement('openingSurnameOne').textContent = first.surname;
  getElement('openingSurnameTwo').textContent = second.surname;
  getElement('invitationHeading').setAttribute('aria-label', `${invitation.firstName} and ${invitation.secondName}`);
  getElement('introNames').setAttribute('aria-label', `${invitation.firstName} and ${invitation.secondName}`);
  getElement('openingDate').textContent = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  renderDateLockup(date);
  getElement('heroPlace').textContent = invitation.place;
  getElement('ceremonyTime').textContent = invitation.ceremonyTime;
  getElement('receptionTime').textContent = invitation.receptionTime;
  getElement('inviteText').textContent = invitation.welcome;
  const [venue, ...address] = invitation.ceremony.split('\n');
  getElement('ceremonyVenue').textContent = venue;
  getElement('ceremonyAddress').textContent = address.join('\n');
  getElement('reception').textContent = invitation.reception;
  const [dress, ...dressNote] = invitation.dressCode.split('\n');
  getElement('dress').textContent = dress;
  getElement('dressNote').textContent = dressNote.join(' ');
  getElement('ceremonyDate').textContent = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
  renderLetterMessage();
  renderSignature();

  const mapLink = getElement('mapLink');
  mapLink.href = invitation.map || 'https://maps.google.com';
  mapLink.style.display = invitation.map ? 'inline-block' : 'none';

  renderCalendarLinks();
  updateCountdown();
}

function updateCountdown() {
  const target = new Date(invitation.date).getTime();
  if (!Number.isFinite(target)) return;

  const remaining = Math.max(0, target - Date.now());
  const countdown = document.querySelector('.countdown');
  if (remaining === 0) {
    window.clearInterval(countdownTimer);
    const celebration = document.createElement('p');
    celebration.className = 'countdown-done';
    celebration.textContent = Date.now() - target < 86_400_000 ? 'Today is the day!' : 'Thank you for celebrating with us.';
    countdown.replaceChildren(celebration);
    countdown.classList.add('is-ready');
    countdown.setAttribute('aria-busy', 'false');
    return;
  }

  const values = [
    Math.floor(remaining / 86_400_000),
    Math.floor((remaining % 86_400_000) / 3_600_000),
    Math.floor((remaining % 3_600_000) / 60_000),
    Math.floor((remaining % 60_000) / 1_000),
  ];
  const units = ['days', 'hours', 'minutes', 'seconds'];

  units.forEach((unit, index) => {
    getElement(unit).textContent = String(values[index]).padStart(2, '0');
  });

  countdown.classList.add('is-ready');
  countdown.setAttribute('aria-busy', 'false');
}

function showToast(message) {
  const toast = getElement('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2300);
}

function openMainInvitation() {
  const screen = getElement('introScreen');
  if (screen.classList.contains('is-opening')) return;

  const revealMainPage = () => {
    screen.hidden = true;
    document.body.classList.remove('intro-active');
    document.body.classList.add('is-revealed');

    [getElement('invitationMain'), document.querySelector('.footer')]
      .forEach((element) => {
        element.removeAttribute('inert');
        element.removeAttribute('aria-hidden');
      });

    getElement('invitationHeading').focus({ preventScroll: true });
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('is-revealed');
    screen.classList.add('is-leaving');
    window.setTimeout(revealMainPage, 20);
    return;
  }

  const openButton = getElement('openInvitation');
  const letterCard = screen.querySelector('.intro-letter-card');
  openButton.disabled = true;
  screen.classList.add('is-opening');

  window.setTimeout(() => {
    screen.classList.add('is-extracting');
  }, 700);

  window.setTimeout(() => {
    const bounds = letterCard.getBoundingClientRect();
    letterCard.style.transition = 'none';
    letterCard.style.position = 'fixed';
    letterCard.style.left = `${bounds.left}px`;
    letterCard.style.top = `${bounds.top}px`;
    letterCard.style.width = `${bounds.width}px`;
    letterCard.style.height = `${bounds.height}px`;
    letterCard.style.margin = '0';
    letterCard.style.transform = 'none';
    letterCard.style.zIndex = '30';
    void letterCard.offsetWidth;
    window.requestAnimationFrame(() => {
      screen.classList.add('is-zooming');
      letterCard.style.transition = '';
      letterCard.style.left = '0';
      letterCard.style.top = '0';
      letterCard.style.width = '100vw';
      letterCard.style.height = '100vh';
      letterCard.style.borderRadius = '0';
    });

    window.setTimeout(() => {
      screen.classList.add('is-leaving');
      document.body.classList.add('is-revealed');
    }, 1300);
  }, 1900);

  window.setTimeout(revealMainPage, 4000);
}

function toggleEnvelope() {
  const envelope = getElement('invitationEnvelope');
  const button = getElement('envelopeTrigger');
  const paper = getElement('letterPaper');
  const letterInner = paper.querySelector('.letter-inner');

  if (envelope.dataset.animating === 'true') return;

  const isOpening = !envelope.classList.contains('is-open');
  envelope.dataset.animating = 'true';
  let transitionTimer;

  if (isOpening) {
    resetLetterReveal();
    const finishOpening = () => {
      if (paper.dataset.revealScheduled === 'true') return;
      window.clearTimeout(transitionTimer);
      paper.removeEventListener('transitionend', onOpenEnd);
      paper.style.height = 'auto';
      delete envelope.dataset.animating;
      scheduleLetterReveal();
    };
    const onOpenEnd = (event) => {
      if (event.target === paper && event.propertyName === 'transform') finishOpening();
    };

    paper.addEventListener('transitionend', onOpenEnd);
    paper.style.height = `${paper.getBoundingClientRect().height}px`;
    envelope.classList.add('is-open');

    requestAnimationFrame(() => {
      const height = Math.max(400, Math.ceil(letterInner.getBoundingClientRect().height + 2));
      paper.style.height = `${height}px`;
    });

    paper.setAttribute('aria-hidden', 'false');
    paper.focus({ preventScroll: true });
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', 'Wedding invitation is open');
    button.tabIndex = -1;
    transitionTimer = window.setTimeout(finishOpening, 1600);
    return;
  }

  const closedHeight = getComputedStyle(envelope)
    .getPropertyValue('--closed-envelope-min-height').trim() || '445px';
  const finishClosing = () => {
    window.clearTimeout(transitionTimer);
    paper.removeEventListener('animationend', onSlideEnd);
    envelope.classList.remove('is-closing', 'is-open');
    resetLetterReveal();
    envelope.style.minHeight = closedHeight;
    paper.setAttribute('aria-hidden', 'true');
    button.setAttribute('aria-label', 'Open the wedding invitation');
    transitionTimer = window.setTimeout(() => {
      envelope.style.minHeight = '';
      delete envelope.dataset.animating;
    }, 1050);
  };
  const onSlideEnd = (event) => {
    if (event.target === paper && event.animationName === 'letter-slide-into-envelope') finishClosing();
  };

  envelope.style.minHeight = `${envelope.getBoundingClientRect().height}px`;
  paper.style.height = `${paper.getBoundingClientRect().height}px`;
  paper.addEventListener('animationend', onSlideEnd);
  envelope.classList.add('is-closing');
  button.focus({ preventScroll: true });
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Closing wedding invitation');
  button.tabIndex = 0;
  getElement('closeLetter').disabled = true;
  transitionTimer = window.setTimeout(finishClosing, 1100);
}

function handleRsvp(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const guestName = getElement('guestName').value.trim();
  const response = event.submitter?.value;
  if (!guestName || !response) return;

  const buttons = [...form.querySelectorAll('button[type="submit"]')];
  const status = getElement('rsvpStatus');
  buttons.forEach((button) => { button.disabled = true; });
  status.textContent = 'Sending your response...';

  status.classList.remove('is-error');

  fetch('/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: guestName, response, company: getElement('company').value }),
  }).then(async (result) => {
    if (!result.ok) {
      const body = await result.json().catch(() => ({}));
      throw new Error(result.status === 400 && body.error ? body.error : '');
    }

    const firstName = guestName.split(/\s+/u)[0];
    status.textContent = response === 'accept'
      ? `Thank you, ${firstName}! We can’t wait to celebrate with you.`
      : `Thank you for letting us know, ${firstName}. You’ll be missed!`;
    form.reset();
  }).catch((error) => {
    status.classList.add('is-error');
    status.textContent = error.message
      || 'We couldn’t save your response. Please check your connection and try again, or message us directly.';
  }).finally(() => {
    buttons.forEach((button) => { button.disabled = false; });
  });
}

function revealSections() {
  document.body.classList.add('motion-ready');
  const items = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  items.forEach((item) => observer.observe(item));
}

getElement('shareBtn').addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({ title: document.title, text: 'You’re invited to our wedding!', url: window.location.href });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast('Invitation link copied');
  } catch {
    showToast('Copy this page link from your browser address bar');
  }
});

getElement('openInvitation').addEventListener('click', openMainInvitation);
getElement('envelopeTrigger').addEventListener('click', toggleEnvelope);
getElement('closeLetter').addEventListener('click', () => getElement('envelopeTrigger').click());
getElement('skipLetterReveal').addEventListener('click', () => completeLetterReveal({ skipped: true }));
getElement('letterContinue').addEventListener('click', () => {
  getElement('letterContinue').disabled = true;
  getElement('envelopeTrigger').click();
  window.setTimeout(() => {
    getElement('rsvpForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
    getElement('guestName').focus({ preventScroll: true });
  }, 1150);
});
getElement('rsvpForm').addEventListener('submit', handleRsvp);

const countdownTimer = window.setInterval(updateCountdown, 1000);
renderInvitation();
revealSections();
