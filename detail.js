import Handlebars from 'handlebars';
import Splide from '@splidejs/splide';
import '@splidejs/splide/css';
import 'social-share-kit/dist/css/social-share-kit.css';
import './styles.css';
import detailTemplateSource from './detail-template.hbs?raw';
import detailErrorTemplateSource from './detail-error-template.hbs?raw';
import SocialShareKit from './social-share-kit-client.js';
import { normalizePhotos, getUniqueId, setupSeeMore, scrollToWidgetTopReliable } from './shared.js';

const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        GID: params.get('GID'),
        animalType: params.get('animalType'),
        nid: params.get('nid'),
        uniqueId: params.get('uniqueId'),
        customDetail: params.get('customDetail'),
    };
};

const getBackUrl = ({ GID, animalType, customDetail }) => {
    const params = new URLSearchParams({ GID, animalType });
    if (customDetail === 'true') {
        params.set('customDetail', 'true');
    }
    return `./animals-widget.html?${params.toString()}`;
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
    // Same-origin Worker API (Vite locally + Cloudflare in production).
    const response = await fetch(`/api/v1/animals/${encodeURIComponent(nid)}`);
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

const normalizeAnimal = (animal, { nid } = {}) => {
    if (!animal) {
        return animal;
    }

    if (animal.Name || animal.Description) {
        const coverPhoto = animal.CoverPhoto || animal.cover_photo || '';

        return {
            name: animal.Name || animal.name,
            nid: nid || animal.nid || animal['Internal-ID'] || animal.internal_id,
            // Never invent `${GID}-A-${ID}` — GID is numeric and MatchMe needs the
            // shelter code (e.g. JELP-A-4239), which comes from list/session/URL.
            uniqueId: animal.uniqueId || animal.unique_id || '',
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
            public_url: animal.public_url || '',
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

const DONATE_URL = 'https://www.zeffy.com/en-US/donation-form/donate-to-save-lives-21';
const SPONSOR_URL = 'https://www.zeffy.com/en-US/ticketing/adoption-sponsorship-fall-in-love';

const getShareText = (animalName, shareUrl) => (
    `${animalName} is available for adoption: ${shareUrl}`
);

const showShareFeedback = (button, copiedLabel, defaultLabel) => {
    button.classList.add('animal-detail__share-copy--copied');
    button.setAttribute('aria-label', copiedLabel);
    window.setTimeout(() => {
        button.classList.remove('animal-detail__share-copy--copied');
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

const getFirstName = (name) => {
    if (!name) {
        return '';
    }

    return String(name).trim().split(/\s+/)[0];
};

let detailTemplate = null;
let detailErrorTemplate = null;

const loadTemplates = async () => {
    if (detailTemplate && detailErrorTemplate) {
        return;
    }

    detailTemplate = Handlebars.compile(detailTemplateSource);
    detailErrorTemplate = Handlebars.compile(detailErrorTemplateSource);
};

const initSocialShare = ({ shareUrl, shareText, shareTitle } = {}) => {
    if (SocialShareKit) {
        SocialShareKit.init({
            selector: '.animal-detail__social .ssk',
            url: shareUrl,
            text: shareText,
            title: shareTitle,
            reinitialize: true,
        });
    }

    const copyButton = document.querySelector('.animal-detail__share-copy');
    copyButton?.addEventListener('click', async (event) => {
        event.preventDefault();
        const url = copyButton.dataset.shareUrl || shareUrl;
        try {
            await navigator.clipboard.writeText(url);
            showShareFeedback(copyButton, 'Link copied', 'Copy link');
        } catch {
            window.prompt('Copy this link:', url);
        }
    });
};

const syncGalleryThumbnails = (thumbnails, index) => {
    thumbnails.forEach((button) => {
        const photoIndex = Number(button.dataset.photoIndex);
        const isActive = photoIndex === index;
        button.classList.toggle('animal-detail__thumbnail--active', isActive);
        button.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
};

const initGallery = (photos) => {
    const root = document.getElementById('galleryMain');
    if (!root || photos.length === 0) {
        return;
    }

    const hasMultiple = photos.length > 1;
    const thumbnails = document.querySelectorAll('.animal-detail__thumbnail');

    const splide = new Splide(root, {
        type: hasMultiple ? 'loop' : 'slide',
        perPage: Math.min(3, photos.length),
        perMove: 1,
        gap: '8px',
        pagination: false,
        arrows: hasMultiple,
        drag: hasMultiple,
        speed: 400,
        updateOnMove: true,
        breakpoints: {
            768: {
                perPage: 1,
            },
        },
        i18n: {
            prev: 'Previous photo',
            next: 'Next photo',
            first: 'Go to first photo',
            last: 'Go to last photo',
            slideX: 'Go to photo %s',
        },
    });

    const updateThumbnails = () => {
        syncGalleryThumbnails(thumbnails, splide.index);
    };

    splide.on('mounted move', updateThumbnails);

    thumbnails.forEach((button) => {
        button.addEventListener('click', () => {
            splide.go(Number(button.dataset.photoIndex));
        });
    });

    splide.mount();
};

const buildDetailTemplateData = (animal, backUrl, nid) => {
    const photos = normalizePhotos(animal.photos).map((photo, index) => ({
        ...photo,
        index,
        displayIndex: index + 1,
        isActive: index === 0,
    }));
    const description = getDescription(animal);
    const adoptionUrl = getAdoptionUrl(animal, nid);
    const shareUrl = animal.public_url || window.location.href;
    const shareTitle = `${animal.name} is available for adoption`;
    const shareText = getShareText(animal.name, shareUrl);
    const facts = [
        { label: 'Animal ID', value: formatDetailValue(getUniqueId(animal)) },
        { label: 'Breed', value: formatBreed(animal) },
        { label: 'Sex', value: formatDetailValue(animal.sex) },
        { label: 'Weight', value: formatWeight(animal) },
        { label: 'Age', value: formatAge(animal) },
        { label: 'Intake Date', value: formatIntakeDate(animal) },
    ].filter((fact) => fact.value);
    const attributes = animal.attributes || [];

    return {
        backUrl,
        name: animal.name,
        firstName: getFirstName(animal.name),
        photos,
        hasPhotos: photos.length > 0,
        hasMultiplePhotos: photos.length > 1,
        coverPhotoUrl: photos[0]?.url || '',
        facts,
        hasFacts: facts.length > 0,
        attributes,
        hasAttributes: attributes.length > 0,
        description,
        adoptionUrl,
        donateUrl: DONATE_URL,
        sponsorUrl: SPONSOR_URL,
        hasActions: Boolean(adoptionUrl || DONATE_URL || SPONSOR_URL),
        shareUrl,
        shareTitle,
        shareText,
    };
};

const renderAnimalDetail = (animal, backUrl, nid) => {
    const photos = normalizePhotos(animal.photos);
    const templateData = buildDetailTemplateData(animal, backUrl, nid);
    document.title = `${animal.name} - Available for Adoption`;
    document.getElementById('detail-output').innerHTML = detailTemplate(templateData);
    initGallery(photos);
    initSocialShare({
        shareUrl: templateData.shareUrl,
        shareText: templateData.shareText,
        shareTitle: templateData.shareTitle,
    });
    setupSeeMore({ href: animal.public_url || '' });
    scrollToWidgetTopReliable({ selector: '#detail-output' });
};

const renderError = (message, backUrl) => {
    document.getElementById('detail-output').innerHTML = detailErrorTemplate({ message, backUrl });
};

const loadAnimalDetail = async () => {
    const params = getUrlParams();
    const backUrl = getBackUrl(params);
    scrollToWidgetTopReliable();

    try {
        await loadTemplates();

        if (!params.GID || !params.animalType || !params.nid) {
            renderError('Missing required URL parameters.', backUrl);
            return;
        }

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
                uniqueId: params.uniqueId
                    || cachedAnimal?.uniqueId
                    || animal.uniqueId
                    || getUniqueId(cachedAnimal)
                    || getUniqueId(animal)
                    || '',
                public_url: cachedAnimal?.public_url || animal.public_url || '',
            };
        }

        if (!animal?.name) {
            throw new Error('Animal not found');
        }

        if (!animal.uniqueId && params.uniqueId) {
            animal.uniqueId = params.uniqueId;
        }

        if (!animal.uniqueId) {
            animal.uniqueId = getUniqueId(animal);
        }

        renderAnimalDetail(animal, backUrl, params.nid);
    } catch (error) {
        console.error('Error loading animal detail:', error);
        if (detailErrorTemplate) {
            renderError(error.message || 'Error loading animal details', backUrl);
        } else {
            document.getElementById('detail-output').innerHTML = `
              <div class="animal-detail animal-detail--error">
                <a class="animal-detail__back" href="${backUrl}">
                  <svg class="animal-detail__back-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                  <span>Back</span>
                </a>
                <p class="animal-detail__error">${error.message || 'Error loading animal details'}</p>
              </div>
            `;
        }
    }
};

loadAnimalDetail();
