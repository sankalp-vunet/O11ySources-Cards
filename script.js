// Function to read CSV file
async function readCSV(file) {
    try {
        const response = await fetch(file);
        const text = await response.text();
        const rows = text.split('\n').map(row => row.split(','));
        const headers = rows[0];
        return rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, i) => {
                obj[header.trim()] = row[i]?.trim();
            });
            return obj;
        });
    } catch (error) {
        console.error('Error reading CSV:', error);
        return [];
    }
}

// Function to generate random status
function generateRandomStatus() {
    const status = Math.random() < 0.5 ? 'Enabled' : 'Disabled';
    const number = Math.floor(Math.random() * 12) + 1;
    return [status, number];
}

// Function to get icon path with fallback options
function getIconPath(sourceName) {
    const iconMappings = {
        'AWS ALB': 'AWS ALB',
        'AWS ELB': 'AWS Classic ELB',
        'AWS NLB': 'AWS NLB',
        'AWS CloudFront': 'AWS CloudFront',
        'AWS API Gateway': 'AWS API Gateway',
        'AWS ElastiCache': 'AWS ElastiCache',
        'AWS Network Firewall': 'AWS Network Firewall',
        'AWS Route53': 'AWS Route53',
        'AWS S3': 'AWS S3',
        'AWS Transit Gateway': 'AWS Transit Gateway',
        'AWS VPC': 'AWS VPC',
        'AWS WAF': 'AWS WAF',
        'Azure Event Hub': 'Azure Eventhub',
        'Azure API Management': 'Azure API Management',
        'Azure App Gateway': 'Azure App Gateway',
        'Azure Firewall': 'Azure Firewall',
        'Azure Load Balancer': 'Azure Load Balancer',
        'JVM Monitor': 'JVM Monitoring',
        'HPUX Monitor': 'Dell HPUX Monitor',
        'URL Availability': 'URL availability',
        'SFTP Monitor': 'SFTP Monitoer',
        'F5 LTM': 'F5 Load Balancer',
        'HAProxy LB': 'HAProxy',
        'Kong Gateway': 'Kong API Gateway',
        'Microsoft DFS': 'MIcrosoft DFS',
        'SQL Server': 'MSSQL',
        'MySQL DB': 'MYSQL',
        'Oracle DB': 'Oracle',
        'PostgreSQL DB': 'PostgreSQL',
        'Palo Alto FW': 'Palo Alto Firewall',
        'Radware ADC': 'Radware Load Balancer',
        'Service Monitor': 'Service Monitor',
        'Windows Server': 'Windows Monitor',
        'Linux Server': 'Linux Monitor',
        'Solaris Server': 'Solaris Monitor',
        'SSL Certificate Monitor': 'SSL Certificate',
        'HTTP Monitor': 'HTTP Poller',
        'DNS Monitor': 'DNS Monitoring',
        'Device Monitor': 'Device Availability',
        'Log Monitor': 'Log Collector',
        'SQL Monitor': 'SQL Data Collector',
        'Kafka Monitor': 'Kafka Data Collector'
    };

    const mappedName = iconMappings[sourceName] || sourceName;
    return `O11ySource icons/${mappedName}.png`;
}

// Function to create a card
function createCard(data) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Set data attributes for filtering
    const type = data['Component Type'];
    const category = data['Component Category'];
    card.setAttribute('data-type', type);
    card.setAttribute('data-category', category);

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';

    const img = document.createElement('img');
    img.src = getIconPath(data['O11ySource Name']);
    img.alt = data['O11ySource Name'];
    img.onerror = () => {
        console.warn(`Icon not found for ${data['O11ySource Name']}`);
        // Create placeholder container
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
            </svg>
        `;
        // Replace img with placeholder
        img.replaceWith(placeholder);
    };

    imageContainer.appendChild(img);

    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = data['O11ySource Name'];
    name.title = data['O11ySource Name'];

    const componentType = document.createElement('div');
    componentType.className = 'component-type';
    componentType.textContent = type;
    componentType.title = type;

    const [statusText, statusNumber] = generateRandomStatus();
    const status = document.createElement('div');
    status.className = `status ${statusText.toLowerCase()}`;
    status.textContent = `${statusText} (${statusNumber})`;

    card.appendChild(imageContainer);
    card.appendChild(name);
    card.appendChild(componentType);
    card.appendChild(status);

    return card;
}

// Function to create filter tags
function createFilterTags(items, containerId) {
    const container = document.getElementById(containerId);
    const uniqueItems = [...new Set(items)].sort();
    
    if (containerId === 'typeFilterTags') {
        uniqueItems.forEach(item => {
            const tag = document.createElement('label');
            tag.className = 'filter-tag';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'checkbox';
            checkbox.value = item;
            
            const text = document.createElement('span');
            text.textContent = item;
            text.title = item;
            
            tag.appendChild(checkbox);
            tag.appendChild(text);
            container.appendChild(tag);
        });
    } else {
        uniqueItems.forEach(item => {
            const tag = document.createElement('span');
            tag.className = 'filter-tag';
            tag.textContent = item;
            tag.title = item;
            container.appendChild(tag);
        });
    }
}

// Function to filter cards
function filterCards(searchText, activeTypeFilters, activeCategoryFilter) {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const name = card.querySelector('.card-name').textContent.toLowerCase();
        const type = card.getAttribute('data-type');
        const category = card.getAttribute('data-category');
        
        const matchesSearch = !searchText || name.includes(searchText.toLowerCase());
        const matchesType = activeTypeFilters.length === 0 || activeTypeFilters.includes(type);
        const matchesCategory = !activeCategoryFilter || category === activeCategoryFilter;

        card.style.display = (matchesSearch && matchesType && matchesCategory) ? 'flex' : 'none';
    });
}

function updateTypeFilterDisplay(activeTypeFilters) {
    const countBadge = document.querySelector('.selected-count');
    countBadge.style.display = activeTypeFilters.length === 0 ? 'none' : 'inline';
    countBadge.textContent = activeTypeFilters.length;
}

function setupDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const dropdownButton = dropdown.querySelector('.dropdown-button');

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    dropdownButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });
}

// Main function to initialize the grid
async function initializeGrid() {
    const gridContainer = document.getElementById('cardGrid');
    const sourcesData = await readCSV('O11ysource Names.csv');
    
    if (sourcesData.length === 0) {
        console.error('No data loaded from CSV');
        return;
    }

    // Create filter tags
    const types = sourcesData.map(data => data['Component Type']);
    const categories = sourcesData.map(data => data['Component Category']);
    createFilterTags(types, 'typeFilterTags');
    createFilterTags(categories, 'categoryFilterTags');

    // Setup dropdown functionality
    setupDropdown();

    // Create and append all cards
    sourcesData.forEach(data => {
        const card = createCard(data);
        gridContainer.appendChild(card);
    });

    // Initialize filter states
    let activeTypeFilters = [];
    let activeCategoryFilter = '';

    // Set up search functionality
    const searchInput = document.getElementById('sourceSearch');
    searchInput.addEventListener('input', (e) => {
        filterCards(e.target.value, activeTypeFilters, activeCategoryFilter);
    });

    // Set up type filter checkboxes
    const typeCheckboxes = document.querySelectorAll('#typeFilterTags input[type="checkbox"]');
    typeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                activeTypeFilters.push(checkbox.value);
            } else {
                activeTypeFilters = activeTypeFilters.filter(type => type !== checkbox.value);
            }
            
            updateTypeFilterDisplay(activeTypeFilters);
            filterCards(searchInput.value, activeTypeFilters, activeCategoryFilter);
        });
    });

    // Set up category filter tags
    const categoryFilterTags = document.querySelectorAll('#categoryFilterTags .filter-tag');
    categoryFilterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            if (activeCategoryFilter === tag.textContent) {
                activeCategoryFilter = '';
                tag.classList.remove('active');
            } else {
                categoryFilterTags.forEach(t => t.classList.remove('active'));
                activeCategoryFilter = tag.textContent;
                tag.classList.add('active');
            }
            filterCards(searchInput.value, activeTypeFilters, activeCategoryFilter);
        });
    });

    // Hide the count badge initially
    document.querySelector('.selected-count').style.display = 'none';
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeGrid); 