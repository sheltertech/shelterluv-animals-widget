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

const getEmbedMaxHeightPx = () => {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--embed-max-height')
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 1700;
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
  const top =
    (selector ? document.querySelector(selector) : null)
    || document.querySelector('.animal-detail__back')
    || document.getElementById('detail-output')
    || document.getElementById('output')
    || document.querySelector('fieldset')
    || document.body;

  top?.scrollIntoView({ behavior, block: 'start' });
  window.scrollTo({ top: 0, behavior });
};

/** Instant + retries so parent iframe scroll lands high enough to show the back button. */
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
