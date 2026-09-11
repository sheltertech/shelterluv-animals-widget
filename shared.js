const ADOPTION_FEE_REDUCED_BADGE = '/badges/adoption-fee-reduced.png';
const NEEDS_FOSTER_BADGE = '/badges/needs-foster.png';
const FOSPICE_BADGE = '/badges/fospice.png';

export const normalizePhotos = (photos, coverPhoto = '') => {
  if (!photos) {
    return [];
  }

  if (Array.isArray(photos)) {
    return photos.map((photo) => {
      if (typeof photo === 'string') {
        return {
          url: photo,
          isCover: photo === coverPhoto,
        };
      }

      return photo;
    });
  }

  if (typeof photos === 'object') {
    return Object.values(photos);
  }

  return [];
};

export const getUniqueId = (animal) => {
  if (!animal) {
    return '';
  }

  if (animal.uniqueId || animal.unique_id) {
    return animal.uniqueId || animal.unique_id;
  }

  if (animal.public_url) {
    try {
      const pathname = new URL(animal.public_url).pathname;
      return pathname.split('/').filter(Boolean).pop() || '';
    } catch {
      return '';
    }
  }

  return animal.animal_id || animal.display_id || animal.id || '';
};

export const getAnimalBadges = (attributes = []) => {
  const showFosterBadge = attributes.includes('Needs Foster');
  const showFospiceBadge = attributes.includes('Fospice');
  const showAdoptionFeeBadge = attributes.includes('Adoption Fee Reduced');

  return {
    showFosterBadge,
    showFospiceBadge,
    showAdoptionFeeBadge,
    hasBadges: showFosterBadge || showFospiceBadge || showAdoptionFeeBadge,
    fosterBadgeUrl: NEEDS_FOSTER_BADGE,
    fospiceBadgeUrl: FOSPICE_BADGE,
    adoptionFeeBadgeUrl: ADOPTION_FEE_REDUCED_BADGE,
  };
};

const EMBED_WIDTH_PX = 960;
// One embed height for every breakpoint: main.js drops the cards per page on
// narrow viewports so the content keeps fitting this box.
const EMBED_HEIGHT_PX = 1048;
const MOBILE_BREAKPOINT_PX = 768;

export const isEmbedded = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

const getConfiguredEmbedHeight = () => {
  const param = new URLSearchParams(window.location.search).get('embedHeight');
  if (param) {
    const parsed = Number.parseInt(param, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
};

const syncEmbedDimensions = () => {
  const standalone = document.documentElement.classList.contains('standalone');
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT_PX;
  const targetHeight = getConfiguredEmbedHeight() ?? EMBED_HEIGHT_PX;

  // Embedded, stay inside the iframe so the host page never clips us; standalone,
  // show the full box and let the surrounding page scroll.
  const height = standalone
    ? targetHeight
    : Math.min(window.innerHeight, targetHeight);

  const width = isMobile
    ? `${Math.max(280, window.innerWidth)}px`
    : `${EMBED_WIDTH_PX}px`;

  document.documentElement.style.setProperty('--embed-max-height', `${height}px`);
  document.documentElement.style.setProperty('--embed-max-width', width);
};

export const initEmbedMode = () => {
  const embedded = isEmbedded();

  const updateModeClasses = () => {
    document.documentElement.classList.toggle('in-iframe', embedded);
    document.documentElement.classList.toggle('standalone', !embedded);
    document.documentElement.classList.toggle(
      'is-mobile-embed',
      window.innerWidth <= MOBILE_BREAKPOINT_PX,
    );
  };

  const onViewportChange = () => {
    updateModeClasses();
    syncEmbedDimensions();
  };

  updateModeClasses();
  syncEmbedDimensions();
  window.addEventListener('resize', onViewportChange);
  window.visualViewport?.addEventListener('resize', onViewportChange);
};

const getEmbedMaxHeightPx = () => {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--embed-max-height')
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : EMBED_HEIGHT_PX;
};

export const setupSeeMore = ({ href, contentSelector = '#detail-output' } = {}) => {
  let link = document.querySelector('.embed-see-more');
  if (!link) {
    link = document.createElement('a');
    link.className = 'embed-see-more';
    link.textContent = 'See more';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
  }

  const update = () => {
    if (!href) {
      link.hidden = true;
      link.removeAttribute('href');
      document.body.classList.remove('has-embed-see-more');
      return;
    }

    link.href = href;
    const content = document.querySelector(contentSelector) || document.body;
    const measureTarget = content.firstElementChild || content;
    const overflows = measureTarget.scrollHeight > getEmbedMaxHeightPx();

    link.hidden = !overflows;
    document.body.classList.toggle('has-embed-see-more', overflows);
  };

  update();
  requestAnimationFrame(update);

  const onResize = () => update();
  window.addEventListener('resize', onResize);

  const content = document.querySelector(contentSelector);
  content?.querySelectorAll('img').forEach((img) => {
    if (!img.complete) {
      img.addEventListener('load', update, { once: true });
      img.addEventListener('error', update, { once: true });
    }
  });

  return update;
};

export const scrollToWidgetTop = ({ selector, behavior = 'smooth' } = {}) => {
  window.scrollTo({ top: 0, left: 0, behavior });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const top =
    (selector ? document.querySelector(selector) : null)
    || document.getElementById('detail-output')
    || document.getElementById('output')
    || document.querySelector('fieldset')
    || document.body;

  top?.scrollIntoView({ behavior, block: 'start' });
};

/** Instant + retries so parent iframe scroll lands at the top of the widget. */
export const scrollToWidgetTopReliable = (options = {}) => {
  const run = () => scrollToWidgetTop({ ...options, behavior: 'auto' });
  run();
  requestAnimationFrame(run);
  window.setTimeout(run, 100);
  window.setTimeout(run, 300);
};

export const buildAnimalBadgeHtml = (attributes = []) => {
  const {
    showFosterBadge,
    showFospiceBadge,
    showAdoptionFeeBadge,
    fosterBadgeUrl,
    fospiceBadgeUrl,
    adoptionFeeBadgeUrl,
  } = getAnimalBadges(attributes);

  return [
    showFosterBadge
      ? `<div class="animal-card__foster-ribbon"><img class="animal-card__overlay animal-card__overlay--foster" src="${fosterBadgeUrl}" alt="Needs foster"></div>`
      : '',
    showFospiceBadge
      ? `<img class="animal-card__overlay animal-card__overlay--fospice" src="${fospiceBadgeUrl}" alt="Available for fospice">`
      : '',
    showAdoptionFeeBadge
      ? `<img class="animal-card__overlay animal-card__overlay--adoption-fee" src="${adoptionFeeBadgeUrl}" alt="Adoption fee reduced">`
      : '',
  ].join('');
};
