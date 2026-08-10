// Set after `npm run deploy:worker` (Workers dashboard → your worker → URL)
const CLOUDFLARE_DETAIL_API_BASE = 'https://shelterluv-animals-api.tallulah-kay.workers.dev/';

const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        GID: params.get('GID'),
        animalType: params.get('animalType'),
        nid: params.get('nid'),
        uniqueId: params.get('uniqueId'),
        customDetail: params.get('customDetail'),
        defaultSort: params.get('defaultSort'),
    };
};

const getBackUrl = ({ GID, animalType, customDetail, defaultSort }) => {
    const params = new URLSearchParams({ GID, animalType });
    if (customDetail === 'true') {
        params.set('customDetail', 'true');
    }
    if (defaultSort) {
        params.set('defaultSort', defaultSort);
    }
    return `./animals-widget.html?${params.toString()}`;
};

const getDetailApiBase = () => {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '';
    }

    return CLOUDFLARE_DETAIL_API_BASE.replace(/\/$/, '');
};

const fetchAnimalFromList = async ({ GID, animalType, nid }) => {
    const response = await fetch(
        `https://new.shelterluv.com/api/v3/available-animals/${GID}?animalType=${animalType}`
    );
    const data = await response.json();

    if (!data.animals) {
        throw new Error(data.message || 'Unable to load animal data');
    }

    const animal = data.animals.find((entry) => String(entry.nid) === String(nid));
    if (!animal) {
        throw new Error('Animal not found');
    }

    return animal;
};

const fetchAnimalDetails = async (nid) => {
    const { hostname } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const base = getDetailApiBase();

    if (!isLocal && !base) {
        throw new Error('Cloudflare detail API is not configured');
    }

    const response = await fetch(`${base}/api/v1/animals/${encodeURIComponent(nid)}`);
    if (!response.ok) {
        throw new Error('Unable to load animal details');
    }

    return response.json();
};

const normalizeAttribute = (attribute) => {
    if (typeof attribute === 'string') {
        return attribute;
    }

    return attribute?.AttributeName || attribute?.attribute_name || attribute?.attributeName || '';
};

const normalizePhotos = (photos, coverPhoto = '') => {
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

const normalizeAnimal = (animal, { GID, nid } = {}) => {
    if (!animal) {
        return animal;
    }

    if (animal.Name || animal.Description) {
        const animalId = animal.ID || animal.id;
        const uniqueId = GID && animalId ? `${GID}-A-${animalId}` : '';
        const coverPhoto = animal.CoverPhoto || animal.cover_photo || '';

        return {
            name: animal.Name || animal.name,
            nid: nid || animal.nid || animal['Internal-ID'] || animal.internal_id,
            uniqueId: animal.uniqueId || animal.unique_id || uniqueId,
            sex: animal.Sex || animal.sex,
            breed: animal.Breed || animal.breed,
            secondary_breed: animal.secondary_breed,
            weight: animal.CurrentWeightPounds ?? animal.weight ?? animal.current_weight,
            weight_units: animal.weight_units || 'lbs',
            weight_group: animal.Size || animal.weight_group || animal.size,
            birthday: animal.DOBUnixTime || animal.birthday || animal.dob,
            intake_date: animal.LastIntakeUnixTime || animal.intake_date || animal.last_intake_date,
            description: animal.Description || animal.description,
            kennel_description: animal.Description || animal.kennel_description || animal.description,
            photos: normalizePhotos(animal.Photos || animal.photos, coverPhoto),
            attributes: (animal.Attributes || animal.attributes || [])
                .map(normalizeAttribute)
                .filter(Boolean),
            public_url: animal.public_url,
        };
    }

    return {
        ...animal,
        photos: normalizePhotos(animal.photos, animal.photos?.find?.((photo) => photo.isCover)?.url),
        attributes: (animal.attributes || []).map(normalizeAttribute).filter(Boolean),
    };
};

const getDescription = (animal) => (
    animal.kennel_description
    || animal.description
    || animal.Description
    || animal.memo
    || animal.bio
    || animal.story
    || ''
);

const getAnimalFromSession = (nid) => {
    try {
        const stored = sessionStorage.getItem(`animal-${nid}`);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const getUniqueId = (animal) => {
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

const DONATE_URL = 'https://www.zeffy.com/en-US/donation-form/donate-to-save-lives-21';
const SPONSOR_URL = 'https://www.zeffy.com/en-US/ticketing/adoption-sponsorship-make-a-splash-this-summer-621-thru--921';

const getShareText = (animalName, shareUrl) => (
    `${animalName} is available for adoption: ${shareUrl}`
);

const showShareFeedback = (button, copiedLabel, defaultLabel) => {
    button.classList.add('animal-detail__social-button--copied');
    button.setAttribute('aria-label', copiedLabel);
    window.setTimeout(() => {
        button.classList.remove('animal-detail__social-button--copied');
        button.setAttribute('aria-label', defaultLabel);
    }, 2000);
};

const getAdoptionUrl = (animal, nid) => {
    const uniqueId = getUniqueId(animal);
    const adoptionNid = nid || animal.nid;
    if (!uniqueId || adoptionNid == null) {
        return '';
    }

    const params = new URLSearchParams({
        nid: String(adoptionNid),
        _csrfToken: '',
    });

    return `https://new.shelterluv.com/matchme/adopt/${encodeURIComponent(uniqueId)}?${params.toString()}`;
};

const formatDetailValue = (value) => {
    if (value == null || value === '') {
        return '';
    }
    return String(value);
};

const formatBreed = (animal) => {
    const breed = formatDetailValue(animal.breed);
    const secondaryBreed = formatDetailValue(animal.secondary_breed);

    if (breed && secondaryBreed) {
        return `${breed} / ${secondaryBreed}`;
    }

    return breed || secondaryBreed;
};

const formatWeight = (animal) => {
    const weight = animal.weight ?? animal.current_weight;
    if (weight == null || weight === '') {
        return '';
    }

    const units = animal.weight_units || 'lbs';
    return `${weight} ${units}`;
};

const formatAge = (animal) => {
    if (animal.age_display || animal.formatted_age) {
        return animal.age_display || animal.formatted_age;
    }

    const birthday = animal.birthday || animal.dob || animal.date_of_birth;
    if (!birthday) {
        return formatDetailValue(animal.age_group?.name || animal.age);
    }

    const birth = new Date(Number(birthday) * 1000);
    const now = new Date();

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
        months -= 1;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    const weeks = Math.floor(days / 7);
    return `${years}Y/${months}M/${weeks}W`;
};

const formatIntakeDate = (animal) => {
    const intakeDate = animal.intake_date || animal.last_intake_date;
    if (!intakeDate) {
        return '';
    }

    return new Date(Number(intakeDate) * 1000).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    });
};

const buildFactsHtml = (facts) => {
    const visibleFacts = facts.filter((fact) => fact.value);
    if (!visibleFacts.length) {
        return '';
    }

    return `
      <dl class="animal-detail__facts">
        ${visibleFacts.map((fact) => `
          <div class="animal-detail__fact">
            <dt>${fact.label}</dt>
            <dd>${fact.value}</dd>
          </div>
        `).join('')}
      </dl>
    `;
};

const buildAttributesHtml = (attributes = []) => {
    if (!attributes.length) {
        return '';
    }

    return `
      <div class="animal-detail__attributes">
        <h2 class="animal-detail__section-title">Attributes</h2>
        <ul class="animal-detail__attribute-list">
          ${attributes.map((attribute) => `<li>${attribute}</li>`).join('')}
        </ul>
      </div>
    `;
};

const buildGalleryHtml = (photos, animalName) => {
    if (!photos.length) {
        return `
          <div class="animal-detail__gallery animal-detail__gallery--empty">
            <div class="animal-detail__gallery-main">
              <div class="animal-detail__photo-slot">
                <div class="animal-detail__photo-placeholder">No photo available</div>
              </div>
            </div>
          </div>
        `;
    }

    const initialVisible = photos.slice(0, Math.min(3, photos.length));

    return `
      <div class="animal-detail__gallery">
        <div
          class="animal-detail__gallery-main"
          id="galleryMain"
          style="grid-template-columns: repeat(${initialVisible.length}, minmax(0, 1fr));"
        >
          ${initialVisible.map((photo, index) => `
            <div class="animal-detail__photo-slot" data-gallery-index="${index}">
              <img class="animal-detail__photo" src="${photo.url}" alt="${animalName} photo ${index + 1}">
            </div>
          `).join('')}
        </div>
        ${photos.length > 1 ? `
          <div class="animal-detail__thumbnails">
            ${photos.map((photo, index) => `
              <button
                type="button"
                class="animal-detail__thumbnail${index === 0 ? ' animal-detail__thumbnail--active' : ''}"
                data-photo-index="${index}"
                aria-label="Show photo ${index + 1}"
              >
                <img src="${photo.url}" alt="">
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
};

const SOCIAL_ICONS = {
    email: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#EA4335" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"/>
      </svg>
    `,
    facebook: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.01 10.13 11.91v-8.4H7.08v-3.5h3.05V8.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.5h-2.79v8.4C19.61 23.08 24 18.09 24 12.07z"/>
      </svg>
    `,
    instagram: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id="instagramGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#F58529"/>
            <stop offset="50%" stop-color="#DD2A7B"/>
            <stop offset="100%" stop-color="#8134AF"/>
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#instagramGradient)"/>
        <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="3.4" fill="none" stroke="#fff" stroke-width="1.6"/>
        <circle cx="12" cy="12" r="2.8" fill="none" stroke="#fff" stroke-width="1.6"/>
        <circle cx="16.7" cy="7.3" r="1.1" fill="#fff"/>
      </svg>
    `,
    link: `
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#757575" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l2.92-2.92a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-2.92 2.92a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    `,
    linkCopied: `
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#4a8ac4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    `,
};

const getFirstName = (name) => {
    if (!name) {
        return '';
    }

    return String(name).trim().split(/\s+/)[0];
};

const buildSocialHtml = (animalName, shareUrl) => {
    const shareText = getShareText(animalName, shareUrl);
    const emailSubject = encodeURIComponent(`${animalName} is available for adoption`);
    const emailBody = encodeURIComponent(shareText);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

    return `
      <div class="animal-detail__social">
        <a
          class="animal-detail__social-button animal-detail__social-button--email"
          href="mailto:?subject=${emailSubject}&body=${emailBody}"
          aria-label="Share by email"
        >
          ${SOCIAL_ICONS.email}
        </a>
        <a
          class="animal-detail__social-button animal-detail__social-button--facebook"
          href="${facebookUrl}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
        >
          ${SOCIAL_ICONS.facebook}
        </a>
        <button
          type="button"
          class="animal-detail__social-button animal-detail__social-button--instagram"
          data-share-url="${shareUrl}"
          data-animal-name="${animalName.replace(/"/g, '&quot;')}"
          aria-label="Share on Instagram"
        >
          ${SOCIAL_ICONS.instagram}
        </button>
        <button
          type="button"
          class="animal-detail__social-button animal-detail__social-button--copy"
          data-share-url="${shareUrl}"
          aria-label="Copy link"
        >
          <span class="animal-detail__social-icon">${SOCIAL_ICONS.link}</span>
        </button>
      </div>
    `;
};

const initSocialShare = () => {
    const copyButton = document.querySelector('.animal-detail__social-button--copy');
    copyButton?.addEventListener('click', async () => {
        const shareUrl = copyButton.dataset.shareUrl;
        const icon = copyButton.querySelector('.animal-detail__social-icon');
        try {
            await navigator.clipboard.writeText(shareUrl);
            if (icon) {
                icon.innerHTML = SOCIAL_ICONS.linkCopied;
            }
            showShareFeedback(copyButton, 'Link copied', 'Copy link');
            window.setTimeout(() => {
                if (icon) {
                    icon.innerHTML = SOCIAL_ICONS.link;
                }
            }, 2000);
        } catch {
            window.prompt('Copy this link:', shareUrl);
        }
    });

    const instagramButton = document.querySelector('.animal-detail__social-button--instagram');
    instagramButton?.addEventListener('click', async () => {
        const shareUrl = instagramButton.dataset.shareUrl;
        const animalName = instagramButton.dataset.animalName;
        const shareText = getShareText(animalName, shareUrl);

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${animalName} is available for adoption`,
                    text: shareText,
                    url: shareUrl,
                });
                return;
            } catch (error) {
                if (error?.name === 'AbortError') {
                    return;
                }
            }
        }

        try {
            await navigator.clipboard.writeText(shareText);
            showShareFeedback(instagramButton, 'Copied for Instagram', 'Share on Instagram');
        } catch {
            window.prompt('Copy this text to share on Instagram:', shareText);
        }
    });
};

const buildActionsHtml = (firstName, adoptionUrl, donateUrl, sponsorUrl, animalName, shareUrl) => {
    if (!adoptionUrl && !donateUrl && !sponsorUrl) {
        return '';
    }

    return `
      <div class="animal-detail__actions">
        ${adoptionUrl ? `
          <a class="animal-detail__cta animal-detail__cta--adopt" href="${adoptionUrl}" target="_blank" rel="noopener noreferrer">
            Apply for Adoption
          </a>
        ` : ''}
        ${sponsorUrl ? `
          <a class="animal-detail__cta animal-detail__cta--sponsor" href="${sponsorUrl}" target="_blank" rel="noopener noreferrer">
            Sponsor ${firstName}
          </a>
        ` : ''}
        ${donateUrl ? `
          <a class="animal-detail__cta animal-detail__cta--donate" href="${donateUrl}" target="_blank" rel="noopener noreferrer">
            Donate
          </a>
        ` : ''}
        ${buildSocialHtml(animalName, shareUrl)}
      </div>
    `;
};

const initGallery = (photos) => {
    if (photos.length <= 1) {
        return;
    }

    const galleryMain = document.getElementById('galleryMain');
    const thumbnails = document.querySelectorAll('.animal-detail__thumbnail');

    const updateGallery = (startIndex) => {
        const maxStart = Math.max(0, photos.length - 3);
        const offset = Math.min(startIndex, maxStart);
        const visiblePhotos = photos.slice(offset, offset + 3);

        galleryMain.style.gridTemplateColumns = `repeat(${visiblePhotos.length}, minmax(0, 1fr))`;
        galleryMain.innerHTML = visiblePhotos.map((photo, index) => `
          <div class="animal-detail__photo-slot" data-gallery-index="${offset + index}">
            <img class="animal-detail__photo" src="${photo.url}" alt="Photo ${offset + index + 1}">
          </div>
        `).join('');

        thumbnails.forEach((button) => {
            const photoIndex = Number(button.dataset.photoIndex);
            button.classList.toggle('animal-detail__thumbnail--active', photoIndex === offset);
        });
    };

    thumbnails.forEach((button) => {
        button.addEventListener('click', () => {
            updateGallery(Number(button.dataset.photoIndex));
        });
    });
};

const renderAnimalDetail = (animal, backUrl, nid) => {
    const photos = normalizePhotos(animal.photos);
    const description = getDescription(animal);
    const adoptionUrl = getAdoptionUrl(animal, nid);
    const facts = [
        { label: 'Animal ID', value: formatDetailValue(getUniqueId(animal)) },
        { label: 'Breed', value: formatBreed(animal) },
        { label: 'Sex', value: formatDetailValue(animal.sex) },
        { label: 'Weight', value: formatWeight(animal) },
        { label: 'Age', value: formatAge(animal) },
        { label: 'Intake Date', value: formatIntakeDate(animal) },
    ];

    document.title = `${animal.name} - Available for Adoption`;
    const shareUrl = window.location.href;

    document.getElementById('detail-output').innerHTML = `
      <div class="animal-detail">
        <a class="animal-detail__back" href="${backUrl}">&larr; Back to all animals</a>

        ${buildGalleryHtml(photos, animal.name)}

        <div class="animal-detail__header">
          <div class="animal-detail__info">
            <h1 class="animal-detail__name">${animal.name}</h1>
            ${buildFactsHtml(facts)}
          </div>
          ${buildActionsHtml(getFirstName(animal.name), adoptionUrl, DONATE_URL, SPONSOR_URL, animal.name, shareUrl)}
        </div>

        ${buildAttributesHtml(animal.attributes)}

        <div class="animal-detail__description">
          ${description
            ? `<div class="animal-detail__description-body">${description}</div>`
            : `<p class="animal-detail__description-empty">No description available.</p>`}
        </div>
      </div>
    `;

    initGallery(photos);
    initSocialShare();
};

const renderError = (message, backUrl) => {
    document.getElementById('detail-output').innerHTML = `
      <div class="animal-detail animal-detail--error">
        <a class="animal-detail__back" href="${backUrl}">&larr; Back to all animals</a>
        <p class="animal-detail__error">${message}</p>
      </div>
    `;
};

const loadAnimalDetail = async () => {
    const params = getUrlParams();
    const backUrl = getBackUrl(params);

    if (!params.GID || !params.animalType || !params.nid) {
        renderError('Missing required URL parameters.', backUrl);
        return;
    }

    try {
        let animal = null;
        const context = { GID: params.GID, nid: params.nid };

        try {
            const apiAnimal = await fetchAnimalDetails(params.nid);
            animal = normalizeAnimal(apiAnimal, context);
        } catch (error) {
            console.warn('Falling back to list/session animal data:', error);
        }

        if (!animal) {
            try {
                animal = normalizeAnimal(await fetchAnimalFromList(params), context);
            } catch {
                animal = normalizeAnimal(getAnimalFromSession(params.nid), context);
            }
        } else {
            const cachedAnimal = normalizeAnimal(getAnimalFromSession(params.nid), context);
            animal = {
                ...cachedAnimal,
                ...animal,
                nid: params.nid,
                uniqueId: animal.uniqueId || cachedAnimal?.uniqueId || params.uniqueId,
            };
        }

        if (!animal?.name) {
            throw new Error('Animal not found');
        }

        if (!animal.uniqueId && params.uniqueId) {
            animal.uniqueId = params.uniqueId;
        }

        renderAnimalDetail(animal, backUrl, params.nid);
    } catch (error) {
        console.error('Error loading animal detail:', error);
        renderError(error.message || 'Error loading animal details', backUrl);
    }
};

loadAnimalDetail();
