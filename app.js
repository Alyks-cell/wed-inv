// Update invitation content here before publishing.
const invitation = {
  firstName: 'Ranelia Parigde',
  secondName: 'Mark Jan Villadar',
  date: '2026-12-01T15:00:00+08:00',
  photo: '',
  welcome: 'We invite you to celebrate our wedding day with us.',
  ceremony: '3:00 PM\nNew Heights Fundamental Baptist Church\nSan Rafael, Miagao, Iloilo',
  reception: '5:00 PM\nReception to follow',
  location: 'New Heights Fundamental Baptist Church\nSan Rafael, Miagao, Iloilo',
  map: 'https://www.google.com/maps/search/?api=1&query=New+Heights+Fundamental+Baptist+Church%2C+San+Rafael%2C+Miagao%2C+Iloilo%2C+Philippines',
  dressCode: 'Floor-length dresses\nSemi-formal attire',
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
  const fullSignature = `With love, ${invitation.firstName} & ${invitation.secondName}`;
  signature.setAttribute('role', 'text');
  signature.setAttribute('aria-label', fullSignature);
  signature.dataset.signature = fullSignature;

  const prefix = document.createElement('span');
  prefix.className = 'signoff-prefix';
  prefix.textContent = 'With love, ';

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
  signature.replaceChildren(prefix, firstName, joiner, secondName);
}

function resetLetterReveal() {
  clearLetterAnimationTimers();
  const paper = getElement('letterPaper');
  paper.classList.remove('is-revealing', 'signature-revealed', 'reveal-complete', 'reveal-skipped', 'reveal-reduced');
  delete paper.dataset.revealScheduled;
  paper.style.removeProperty('--signature-start');
  paper.style.removeProperty('--signature-shimmer-delay');
  paper.querySelector('.signoff').classList.remove('is-shimmering');
  getElement('closeLetter').disabled = true;
  getElement('letterContinue').disabled = true;
}

function completeLetterReveal({ skipped = false, reduced = false } = {}) {
  clearLetterAnimationTimers();
  const paper = getElement('letterPaper');
  paper.classList.remove('is-revealing');
  if (skipped) paper.classList.add('reveal-skipped');
  if (reduced) paper.classList.add('reveal-reduced');
  paper.classList.add('signature-revealed', 'reveal-complete');
  paper.querySelector('.signoff').classList.add('is-shimmering');
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
  paper.style.setProperty('--signature-shimmer-delay', `${bodyDuration + 2100}ms`);

  letterAnimationTimers.push(window.setTimeout(() => {
    paper.classList.add('signature-revealed');
    paper.querySelector('.signoff').classList.add('is-shimmering');
  }, bodyDuration + 2100));
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

function renderInvitation() {
  const date = new Date(invitation.date);

  getElement('nameOne').textContent = invitation.firstName;
  getElement('nameTwo').textContent = invitation.secondName;
  getElement('openingNameOne').textContent = invitation.firstName;
  getElement('openingNameTwo').textContent = invitation.secondName;
  getElement('openingDate').textContent = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  getElement('heroDate').textContent = formatFullDate(invitation.date);
  getElement('inviteText').textContent = invitation.welcome;
  getElement('ceremony').textContent = invitation.ceremony;
  getElement('reception').textContent = invitation.reception;
  getElement('location').textContent = invitation.location;
  getElement('dress').textContent = invitation.dressCode;
  renderLetterMessage();
  renderSignature();

  const mapLink = getElement('mapLink');
  mapLink.href = invitation.map || 'https://maps.google.com';
  mapLink.style.display = invitation.map ? 'inline-block' : 'none';

  renderPhoto();
  updateCountdown();
}

function renderPhoto() {
  const frame = getElement('photoFrame');

  if (!invitation.photo) {
    frame.innerHTML = '<div class="photo-empty"><div><span>No photos, just love</span><small>A day made brighter by you</small></div></div>';
    return;
  }

  const image = document.createElement('img');
  image.src = invitation.photo;
  image.alt = `${invitation.firstName} and ${invitation.secondName}`;
  frame.replaceChildren(image);
}

function updateCountdown() {
  const target = new Date(invitation.date).getTime();
  const remaining = Math.max(0, target - Date.now());
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
}

function showToast(message) {
  const toast = getElement('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2300);
}

function openMainInvitation() {
  const screen = getElement('introScreen');
  screen.classList.add('is-leaving');

  window.setTimeout(() => {
    screen.hidden = true;
    document.body.classList.remove('intro-active');

    [getElement('topbar'), getElement('invitationMain'), document.querySelector('.footer')]
      .forEach((element) => {
        element.removeAttribute('inert');
        element.removeAttribute('aria-hidden');
      });

    getElement('invitationHeading').focus({ preventScroll: true });
  }, 540);
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

  fetch('/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: guestName, response, company: getElement('company').value }),
  }).catch(() => {}).finally(() => {
    status.textContent = 'Thank You!';
    form.reset();
    buttons.forEach((button) => { button.disabled = false; });
  });
}

function revealSections() {
  document.body.classList.add('motion-ready');
  const items = document.querySelectorAll('.reveal, .detail-card');

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
  }, { threshold: 0.12 });

  items.forEach((item) => {
    item.classList.add('reveal');
    observer.observe(item);
  });
}

getElement('shareBtn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast('Invitation link copied');
  } catch {
    showToast('Copy this page link from your browser address bar');
  }
});

getElement('printBtn').addEventListener('click', () => window.print());
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

renderInvitation();
window.setInterval(updateCountdown, 1000);
revealSections();
