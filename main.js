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

const computeItemsPerPage = () => {
    const total = allAnimals.length;
    if (total === 0) return MAX_ITEMS_PER_PAGE;
    const numPages = Math.ceil(total / MAX_ITEMS_PER_PAGE);
    return Math.ceil(total / numPages);
};

// Helper function to normalize photos to array format
const normalizePhotos = (photos) => {
    if (Array.isArray(photos)) {
        return photos;
    } else if (photos && typeof photos === 'object') {
        // Convert object to array
        return Object.values(photos);
    }
    return [];
}

const getAnimals = async () => {
    // Get the query string from the current URL
    const urlParams = new URLSearchParams(window.location.search);
    const animalType = urlParams.get('animalType');
    const GID = urlParams.get('GID');

    try {
        const response = await fetch(`https://new.shelterluv.com/api/v3/available-animals/${GID}?animalType=${animalType}`);

        const data = await response.json();
        animalData = data.animals;
        allAnimals = data.animals;

        populateFilterOptions();

        const templateResponse = await fetch('template.hbs');
        const source = await templateResponse.text();

        const template = Handlebars.compile(source);
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
        new SlimSelect({
            select: '#sort'
        })

        displayAnimals();
        updatePagination();

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

        return `
          <div class="animal-card" onclick="openAnimalDetail('${animal.public_url}', ${animal.nid})">
            ${imageUrl ? `<img src="${imageUrl}" alt="${animal.name}">` : ''}
            <h3>${animal.name}</h3>
          </div>
        `;
    }).join('');

    // Set rows so they always fill the available container height
    const cols = window.getComputedStyle(container).gridTemplateColumns.split(' ').length;
    const rows = Math.ceil(pageAnimals.length / cols);
    container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    container.scrollTop = 0;
}

const openAnimalDetail = (publicUrl) => {
    // Open the embed page in a new tab
    window.open(publicUrl, '_blank');
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
    }
}

const prevPage = () => {
    if (currentPage > 0) {
        currentPage--;
        displayAnimals();
        updatePagination();
    }
}

const populateFilterOptions = () => {
    for (animal of allAnimals) {
        if (!ageOptions.includes(animal.age_group.name)) {
            ageOptions.push(animal.age_group.name);
        }
        if (!sexOptions.includes(animal.sex)) {
            sexOptions.push(animal.sex);
        }
        for (attribute of animal.attributes) {
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