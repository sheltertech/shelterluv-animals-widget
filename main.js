import Handlebars from 'handlebars';
import SlimSelect from 'slim-select';
import 'slim-select/styles';
import './styles.css';
import listTemplateSource from './template.hbs?raw';
import { normalizePhotos, getUniqueId, buildAnimalBadgeHtml, scrollToWidgetTop } from './shared.js';

let animalData = [];
let allAnimals = [];
let ageOptions = [];
let sexOptions = [];
let attributeOptions = [];
let breedOptions = [];
let sizeOptions = [];
let currentPage = 0;
const MAX_ITEMS_PER_PAGE = 12;
let itemsPerPage = MAX_ITEMS_PER_PAGE;

// Shelterluv aliases → local #sort option values
const DEFAULT_SORT_ALIASES = {
    newest: 'shortest-stay',
    oldest: 'longest-stay',
    alphabetical: 'alphabetical-a-z',
    reverseAlphabetical: 'alphabetical-z-a',
    'shortest-stay': 'shortest-stay',
    'longest-stay': 'longest-stay',
    'alphabetical-a-z': 'alphabetical-a-z',
    'alphabetical-z-a': 'alphabetical-z-a',
};

const resolveDefaultSort = (value) => DEFAULT_SORT_ALIASES[value] || null;

const computeItemsPerPage = () => {
    const total = allAnimals.length;
    if (total === 0) return MAX_ITEMS_PER_PAGE;
    const numPages = Math.ceil(total / MAX_ITEMS_PER_PAGE);
    return Math.ceil(total / numPages);
};

const getAnimals = async () => {
    // Get the query string from the current URL
    const urlParams = new URLSearchParams(window.location.search);
    const animalType = urlParams.get('animalType');
    const GID = urlParams.get('GID');
    const defaultSort = resolveDefaultSort(urlParams.get('defaultSort'));

    try {
        const response = await fetch(`https://new.shelterluv.com/api/v3/available-animals/${GID}?animalType=${animalType}`);

        const data = await response.json();
        animalData = data.animals;
        allAnimals = data.animals;

        populateFilterOptions();

        const template = Handlebars.compile(listTemplateSource);
        const templateData = {
            allAnimals,
            ageOptions,
            sexOptions,
            attributeOptions,
            breedOptions,
            sizeOptions
        };
        const html = template(templateData);
        document.getElementById("output").innerHTML = html;

        new SlimSelect({
            select: '#sex'
        });
        new SlimSelect({
            select: '#age'
        });
        new SlimSelect({
            select: '#attributes',
            settings: {
                allowDeselect: true,
                closeOnSelect: false
            }
        });
        new SlimSelect({
            select: '#breed'
        });
        new SlimSelect({
            select: '#size'
        });

        if (defaultSort) {
            document.getElementById('sort').value = defaultSort;
        }

        new SlimSelect({
            select: '#sort'
        })

        if (defaultSort) {
            filterAnimals();
        } else {
            displayAnimals();
            updatePagination();
        }

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('output').innerHTML = '<p>Error loading animals</p>';
    }
}

const displayAnimals = () => {
    itemsPerPage = computeItemsPerPage();
    const container = document.getElementById('animals');
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    let pageAnimals = allAnimals.slice(start, end);

    container.innerHTML = pageAnimals.map(animal => {
        // Normalize photos to array
        const photosArray = normalizePhotos(animal.photos);

        // Find the cover photo
        const coverPhoto = photosArray.find(p => p.isCover) || photosArray[0];
        const imageUrl = coverPhoto ? coverPhoto.url : '';
        const badgeHtml = buildAnimalBadgeHtml(animal.attributes);

        return `
          <div class="animal-card" onclick="openAnimalDetail('${animal.public_url}', ${animal.nid})">
            ${imageUrl ? `
              <div class="animal-card__image">
                <img class="animal-card__photo" src="${imageUrl}" alt="${animal.name}">
                ${badgeHtml}
              </div>
            ` : ''}
            <h3>${animal.name}</h3>
          </div>
        `;
    }).join('');
}

const isCustomDetailEnabled = () => (
    new URLSearchParams(window.location.search).get('customDetail') === 'true'
);

const openAnimalDetail = (publicUrl, nid) => {
    if (!isCustomDetailEnabled()) {
        window.open(publicUrl, '_blank');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const GID = urlParams.get('GID');
    const animalType = urlParams.get('animalType');
    const animal = allAnimals.find((entry) => entry.nid === nid);

    if (animal) {
        sessionStorage.setItem(`animal-${nid}`, JSON.stringify(animal));
    }

    const params = new URLSearchParams({ GID, animalType, nid, customDetail: 'true' });
    const uniqueId = animal ? getUniqueId(animal) : '';
    if (uniqueId) {
        params.set('uniqueId', uniqueId);
    }
    const defaultSort = urlParams.get('defaultSort');
    if (defaultSort) {
        params.set('defaultSort', defaultSort);
    }
    window.location.href = `./animal-detail.html?${params.toString()}`;
}

const updatePagination = () => {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');

    const totalPages = Math.ceil(allAnimals.length / itemsPerPage);
    const start = currentPage * itemsPerPage + 1;
    const end = Math.min((currentPage + 1) * itemsPerPage, allAnimals.length);

    // Disable previous button if on first page
    prevBtn.disabled = currentPage === 0;

    // Disable next button if on last page
    nextBtn.disabled = currentPage >= totalPages - 1;

    // Update page info
    pageInfo.textContent = `Showing ${start}-${end} of ${allAnimals.length} animals (Page ${currentPage + 1} of ${totalPages})`;
}

const nextPage = () => {
    const totalPages = Math.ceil(allAnimals.length / itemsPerPage);
    if (currentPage < totalPages - 1) {
        currentPage++;
        displayAnimals();
        updatePagination();
        scrollToWidgetTop();
    }
}

const prevPage = () => {
    if (currentPage > 0) {
        currentPage--;
        displayAnimals();
        updatePagination();
        scrollToWidgetTop();
    }
}

const populateFilterOptions = () => {
    for (const animal of allAnimals) {
        if (!ageOptions.includes(animal.age_group.name)) {
            ageOptions.push(animal.age_group.name);
        }
        if (!sexOptions.includes(animal.sex)) {
            sexOptions.push(animal.sex);
        }
        for (const attribute of animal.attributes) {
            if (!attributeOptions.includes(attribute)) {
                attributeOptions.push(attribute);
            }
        }
        if (!breedOptions.includes(animal.breed)) {
            breedOptions.push(animal.breed);
        }
        if (!sizeOptions.includes(animal.weight_group)) {
            sizeOptions.push(animal.weight_group);
        }
    }
}

// Load animals on initial load
getAnimals();

document.addEventListener('change', (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
    if (selectedOptions.length === 0) {
        resetAnimals();
    } else {
        filterAnimals();
    }
})

const filterAnimals = () => {
    const selectedAttributes = Array.from(document.getElementById('attributes').selectedOptions)
        .map(opt => opt.value);
    const selectedSex = Array.from(document.getElementById('sex').selectedOptions)
        .map(opt => opt.value);
    const selectedAge = Array.from(document.getElementById('age').selectedOptions)
        .map(opt => opt.value);
    const selectedBreed = Array.from(document.getElementById('breed').selectedOptions)
        .map(opt => opt.value);
    const selectedSize = Array.from(document.getElementById('size').selectedOptions)
        .map(opt => opt.value);
    const selectedSort = document.getElementById('sort').value;

    const currentFilters = {
        sex: selectedSex,
        age: selectedAge,
        breed: selectedBreed,
        size: selectedSize,
        attributes: selectedAttributes
    };

    allAnimals = animalData
        .filter((animal) => {
            if (currentFilters.sex.length > 0) {
                return currentFilters.sex.includes(animal.sex);
            } else return true
        })
        .filter((animal) => {
            if (currentFilters.age.length > 0) {
                return currentFilters.age.includes(animal.age_group.name)
            } else return true
        })
        .filter((animal) => {
            if (currentFilters.breed.length > 0) {
                return currentFilters.breed.includes(animal.breed)
            } else return true
        })
        .filter((animal) => {
            if (currentFilters.size.length > 0) {
                return currentFilters.size.includes(animal.weight_group)
            } else return true
        })
        .filter((animal) => {
            if (currentFilters.attributes.length > 0) {
                return currentFilters.attributes.every(selectedAttr =>
                    animal.attributes.includes(selectedAttr)
                );
            } else return true
        })

    if (selectedSort === "alphabetical-a-z") {
        allAnimals.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();

            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
    } else if (selectedSort === "shortest-stay") {
        allAnimals = allAnimals.sort((a, b) => b.intake_date - a.intake_date)
    } else if (selectedSort === "longest-stay") {
        allAnimals = allAnimals.sort((a, b) => a.intake_date - b.intake_date)
    } else if (selectedSort === "alphabetical-z-a") {
        allAnimals.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();

            if (nameA < nameB) {
                return 1;
            }
            if (nameA > nameB) {
                return -1;
            }
            return 0;
        });
    }

    currentPage = 0;
    displayAnimals()
    updatePagination();
}

const resetAnimals = () => {
    allAnimals = animalData;
    displayAnimals();
    currentPage = 0;
    updatePagination();
}

const searchByName = (e) => {
    allAnimals = []
    animalData.forEach((animal) => {
        if (animal.name.toUpperCase().includes(e.target.value.trim().toUpperCase())) {
            allAnimals.push(animal);
        }
    })

    displayAnimals();
    currentPage = 0;
    updatePagination();
}

// Inline handlers in template.hbs / card HTML need globals (ES modules are scoped).
Object.assign(window, {
    openAnimalDetail,
    prevPage,
    nextPage,
    searchByName,
});
