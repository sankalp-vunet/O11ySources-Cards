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
    const random = Math.random();
    let status;
    if (random < 0.4) {
        status = 'Enabled';
    } else if (random < 0.7) {
        status = 'Not Enabled';
    } else {
        status = 'Disabled';
    }
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

    // Create image element directly (no wrapper div)
    const img = document.createElement('img');
    img.className = 'image-container';
    img.src = getIconPath(data['O11ySource Name']);
    img.alt = data['O11ySource Name'];
    img.onerror = () => {
        console.warn(`Icon not found for ${data['O11ySource Name']}, using placeholder`);
        console.log(`Switching from ${img.src} to O11ySource icons/Placeholder.png`);
        // Use Placeholder.png for missing icons
        img.src = 'O11ySource icons/Placeholder.png';
        img.onerror = () => {
            console.error('Placeholder.png also failed to load!');
            img.onerror = null; // Prevent infinite loop
        };
    };

    // Create text content container
    const textContent = document.createElement('div');
    textContent.className = 'card-text-content';

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
    
    if (statusText === 'Disabled') {
        status.className = 'status error';
        status.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="status-icon" width="14" height="14" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 9v2m0 4v.01" />
                <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75" />
            </svg>
            <span>Error</span>
        `;
        card.classList.add('card-error');
        card.setAttribute('data-status', 'error');
    } else if (statusText === 'Enabled') {
        status.className = 'status enabled';
        status.textContent = `${statusText} (${statusNumber})`;
        card.classList.add('card-enabled');
        card.setAttribute('data-status', 'enabled');
    } else {
        status.className = 'status not-enabled';
        status.textContent = statusText;
        card.classList.add('card-not-enabled');
        card.setAttribute('data-status', 'not-enabled');
    }

    // Append text elements to text content container
    textContent.appendChild(name);
    textContent.appendChild(componentType);
    textContent.appendChild(status);

    // Append both columns to card
    card.appendChild(img);
    card.appendChild(textContent);

    // Add mouse event listeners
    card.addEventListener('mousedown', () => {
        card.classList.add('pressed');
    });

    card.addEventListener('mouseup', () => {
        card.classList.remove('pressed');
    });

    card.addEventListener('mouseleave', () => {
        card.classList.remove('pressed');
    });

    return card;
}

// Function to create filter tags
function createFilterTags(items, containerId, sourcesData) {
    const container = document.getElementById(containerId);
    
    if (containerId === 'typeFilterTags') {
        // Group types by category
        const groupedTypes = items.reduce((acc, type) => {
            const category = sourcesData.find(data => data['Component Type'] === type)['Component Category'];
            if (!acc[category]) {
                acc[category] = new Set();
            }
            acc[category].add(type);
            return acc;
        }, {});

        // Create category groups
        Object.entries(groupedTypes).forEach(([category, types]) => {
            // Create category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'type-category-header';
            categoryHeader.textContent = category;
            container.appendChild(categoryHeader);
            
            // Create type options under this category
            Array.from(types).sort().forEach(type => {
            const option = document.createElement('label');
            option.className = 'type-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
                checkbox.value = type;
                checkbox.setAttribute('data-category', category);
            
            const text = document.createElement('span');
                text.textContent = type;
                text.title = type;
            
            option.appendChild(checkbox);
            option.appendChild(text);
            container.appendChild(option);
            });
        });

        // Set up dropdown functionality
        const dropdown = document.querySelector('.type-dropdown');
        const trigger = dropdown.querySelector('.type-dropdown-trigger');
        const searchInput = dropdown.querySelector('.type-dropdown-search input');
        const cancelBtn = dropdown.querySelector('.btn-secondary');
        const applyBtn = dropdown.querySelector('.btn-primary');
        const allTypesCheckbox = dropdown.querySelector('.type-option-all input');
        
        // Store original state for cancel functionality
        let originalState = [];

        // Handle dropdown toggle
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
            
            if (dropdown.classList.contains('active')) {
                // Store current state when opening
                const checkboxes = container.querySelectorAll('input[type="checkbox"]');
                originalState = Array.from(checkboxes).map(checkbox => ({
                    value: checkbox.value,
                    checked: checkbox.checked
                }));
                searchInput.focus();
            }
        });

        // Handle search functionality
        searchInput.addEventListener('input', (e) => {
            const searchText = e.target.value.toLowerCase();
            const options = container.querySelectorAll('.type-option');
            const headers = container.querySelectorAll('.type-category-header');
            
            // Create a map to track if categories have any visible items
            const categoryVisibility = new Map();
            
            // Check each option
            options.forEach(option => {
                const text = option.querySelector('span').textContent.toLowerCase();
                const category = option.querySelector('input').getAttribute('data-category');
                const isVisible = text.includes(searchText);
                option.style.display = isVisible ? 'flex' : 'none';
                
                // Track if this category has any visible items
                if (isVisible) {
                    categoryVisibility.set(category, true);
                } else if (!categoryVisibility.has(category)) {
                    categoryVisibility.set(category, false);
                }
            });
            
            // Update header visibility based on their items
            headers.forEach(header => {
                const category = header.textContent;
                header.style.display = categoryVisibility.get(category) ? 'block' : 'none';
            });
        });

        // Handle "All Types" checkbox
        allTypesCheckbox.addEventListener('change', () => {
            const checkboxes = container.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = allTypesCheckbox.checked;
            });
        });

        // Handle individual checkbox changes
        container.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const checkboxes = container.querySelectorAll('input[type="checkbox"]');
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
                allTypesCheckbox.checked = allChecked;
                allTypesCheckbox.indeterminate = anyChecked && !allChecked;
            }
        });

        // Handle cancel button
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Reset to original state
            const checkboxes = container.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const originalItem = originalState.find(item => item.value === checkbox.value);
                if (originalItem) {
                    checkbox.checked = originalItem.checked;
                }
            });
            
            // Reset search
            searchInput.value = '';
            const options = container.querySelectorAll('.type-option');
            const headers = container.querySelectorAll('.type-category-header');
            options.forEach(option => option.style.display = 'flex');
            headers.forEach(header => header.style.display = 'block');
            
            dropdown.classList.remove('active');
        });

        // Handle apply button
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Update active filters
            const checkboxes = container.querySelectorAll('input[type="checkbox"]');
            window.activeTypeFilters = Array.from(checkboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
            
            // Apply filters to both views
            const searchInput = document.getElementById('sourceSearch');
            filterCards(searchInput.value, window.activeTypeFilters, null, window.activeStatusFilters);
            filterTableRows(searchInput.value, window.activeTypeFilters, null, window.activeStatusFilters);
            
            // Update original state
            originalState = Array.from(checkboxes).map(checkbox => ({
                value: checkbox.value,
                checked: checkbox.checked
            }));
            
            dropdown.classList.remove('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    } else if (containerId === 'statusFilterTags') {
        // Create status filter tags
        const uniqueItems = [...new Set(items)].sort();
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
function filterCards(searchText, activeTypeFilters, activeCategoryFilter, activeStatusFilters) {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const name = card.querySelector('.card-name').textContent.toLowerCase();
        const type = card.getAttribute('data-type');
        const category = card.getAttribute('data-category');
        const status = card.getAttribute('data-status');
        const componentType = card.querySelector('.component-type').textContent.toLowerCase();
        const statusText = card.querySelector('.status').textContent.toLowerCase();
        
        // Create searchable content string that includes all visible text
        const searchableContent = `${name} ${type.toLowerCase()} ${category.toLowerCase()} ${componentType} ${statusText}`.toLowerCase();
        
        const matchesSearch = !searchText || searchableContent.includes(searchText.toLowerCase());
        
        // Type filter: if no types selected, hide all; if types selected, must match one of them
        const matchesType = activeTypeFilters.length > 0 && activeTypeFilters.includes(type);
        
        const matchesCategory = !activeCategoryFilter || card.getAttribute('data-category') === activeCategoryFilter;
        
        // Status filter: if no status filters selected, hide all; if status filters selected, must match one of them
        const matchesStatus = activeStatusFilters.length > 0 && activeStatusFilters.includes(status);

        card.style.display = (matchesSearch && matchesType && matchesCategory && matchesStatus) ? 'flex' : 'none';
    });
}

// Function to generate random metrics
function generateRandomMetrics() {
    return {
        dashboards: Math.floor(Math.random() * 50) + 1,
        alerts: Math.floor(Math.random() * 100) + 1,
        criticalAlerts: Math.floor(Math.random() * 20) + 1
    };
}

// Function to generate description
function generateDescription(sourceName, type) {
    const descriptions = {
        'AWS ALB': 'Application Load Balancer that automatically distributes incoming application traffic across multiple targets, such as EC2 instances, containers, and IP addresses in multiple Availability Zones.',
        'AWS ELB': 'Classic Load Balancer that provides basic load balancing across multiple Amazon EC2 instances and operates at both the request level and connection level for high availability.',
        'AWS NLB': 'Network Load Balancer that handles millions of requests per second while maintaining ultra-low latencies and high throughput for mission-critical applications.',
        'AWS CloudFront': 'Content Delivery Network service that securely delivers data, videos, applications, and APIs to customers globally with low latency and high transfer speeds.',
        'AWS API Gateway': 'Fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs at any scale for backend services.',
        'AWS ElastiCache': 'Web service that makes it easy to deploy, operate, and scale an in-memory cache in the cloud to improve application performance.',
        'AWS S3': 'Object storage service that offers industry-leading scalability, data availability, security, and performance for backup, archiving, and analytics.',
        'Azure Event Hub': 'Big data streaming platform and event ingestion service that can receive and process millions of events per second from connected devices.',
        'JVM Monitor': 'Java Virtual Machine monitoring solution that provides real-time insights into application performance, memory usage, and garbage collection metrics.',
        'MySQL DB': 'Open-source relational database management system that provides reliable, scalable, and high-performance data storage for web applications.',
        'PostgreSQL DB': 'Advanced open-source relational database that supports both SQL and JSON querying, offering robust features for complex data workloads.',
        'Oracle DB': 'Enterprise-grade relational database management system that provides comprehensive data management, security, and performance optimization capabilities.',
        'Linux Server': 'Unix-like operating system monitoring that tracks system performance, resource utilization, and service availability across distributed infrastructure.',
        'Windows Server': 'Microsoft server operating system monitoring that provides insights into system health, performance metrics, and application dependencies.',
        'default': `${sourceName} is a comprehensive ${type.toLowerCase()} monitoring solution that provides real-time insights, performance metrics, and operational visibility for your infrastructure and applications.`
    };
    
    return descriptions[sourceName] || descriptions.default;
}

// Function to create a table row
function createTableRow(data) {
    const tr = document.createElement('tr');
    
    // Checkbox cell
    const checkboxCell = document.createElement('td');
    checkboxCell.className = 'checkbox-cell';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';
    checkboxCell.appendChild(checkbox);
    
    // Icon cell
    const iconCell = document.createElement('td');
    iconCell.className = 'icon-cell';
    const iconContainer = document.createElement('div');
    const img = document.createElement('img');
    img.src = getIconPath(data['O11ySource Name']);
    img.alt = data['O11ySource Name'];
    img.className = 'source-icon';
    img.onerror = () => {
        console.warn(`Icon not found for ${data['O11ySource Name']}, using placeholder`);
        console.log(`Switching from ${img.src} to O11ySource icons/Placeholder.png`);
        // Use Placeholder.png for missing icons
        img.src = 'O11ySource icons/Placeholder.png';
        img.onerror = () => {
            console.error('Placeholder.png also failed to load!');
            img.onerror = null; // Prevent infinite loop
        };
    };
    iconContainer.appendChild(img);
    iconCell.appendChild(iconContainer);
    
    // Name cell
    const nameCell = document.createElement('td');
    nameCell.className = 'name-cell';
    const nameDiv = document.createElement('div');
    nameDiv.className = 'truncate name-link';
    nameDiv.textContent = data['O11ySource Name'];
    nameDiv.title = data['O11ySource Name'];
    nameCell.appendChild(nameDiv);
    
    // Type cell
    const typeCell = document.createElement('td');
    typeCell.className = 'type-cell';
    const typeDiv = document.createElement('div');
    typeDiv.className = 'truncate';
    typeDiv.textContent = data['Component Type'];
    typeDiv.title = data['Component Type'];
    typeCell.appendChild(typeDiv);
    
    // Category cell removed
    
    // Status cell
    const [statusText, statusNumber] = generateRandomStatus();
    const statusCell = document.createElement('td');
    statusCell.className = 'status-cell-container';
    const statusDiv = document.createElement('div');
    
    if (statusText === 'Disabled') {
        statusDiv.className = 'status-cell error';
        statusDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 9v2m0 4v.01" />
                <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75" />
            </svg>
            <span>Error</span>
        `;
        tr.setAttribute('data-status', 'error');
    } else if (statusText === 'Enabled') {
        statusDiv.className = 'status-cell enabled';
        statusDiv.textContent = `${statusText} (${statusNumber})`;
        tr.setAttribute('data-status', 'enabled');
    } else {
        statusDiv.className = 'status-cell not-enabled';
        statusDiv.textContent = statusText;
        tr.setAttribute('data-status', 'not-enabled');
    }
    statusCell.appendChild(statusDiv);
    
    // Generate random metrics
    const metrics = generateRandomMetrics();
    
    // Dashboards cell
    const dashboardsCell = document.createElement('td');
    dashboardsCell.className = 'metric-cell';
    dashboardsCell.textContent = metrics.dashboards;
    
    // Alerts cell
    const alertsCell = document.createElement('td');
    alertsCell.className = 'metric-cell alerts-link';
    alertsCell.textContent = metrics.alerts;
    
    // Critical Alerts cell
    const criticalAlertsCell = document.createElement('td');
    criticalAlertsCell.className = 'metric-cell critical-alerts-link';
    criticalAlertsCell.textContent = metrics.criticalAlerts;
    
    // Description cell
    const descriptionCell = document.createElement('td');
    descriptionCell.className = 'description-cell';
    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'description';
    descriptionDiv.textContent = generateDescription(data['O11ySource Name'], data['Component Type']);
    descriptionCell.appendChild(descriptionDiv);
    
    // Actions cell
    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions-cell';
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'actions-container';
    
    // View action removed
    
    // Edit action - Tabler outline icon
    const editButton = document.createElement('button');
    editButton.className = 'action-button';
    editButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    `;
    editButton.title = 'Edit';
    
    // Delete action - Tabler outline icon
    const deleteButton = document.createElement('button');
    deleteButton.className = 'action-button';
    deleteButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
    `;
    deleteButton.title = 'Delete';
    
    actionsContainer.appendChild(editButton);
    actionsContainer.appendChild(deleteButton);
    actionsCell.appendChild(actionsContainer);
    
    // Set data attributes for filtering
    tr.setAttribute('data-type', data['Component Type']);
    tr.setAttribute('data-category', data['Component Category']);
    
    // Append all cells
    tr.appendChild(checkboxCell);
    tr.appendChild(iconCell);
    tr.appendChild(nameCell);
    tr.appendChild(typeCell);
    tr.appendChild(statusCell);
    tr.appendChild(dashboardsCell);
    tr.appendChild(alertsCell);
    tr.appendChild(criticalAlertsCell);
    tr.appendChild(descriptionCell);
    tr.appendChild(actionsCell);
    
    return tr;
}

// Function to switch views
function switchView(viewType, updateURL = true) {
    const gridContainer = document.getElementById('cardGrid');
    const tableContainer = document.getElementById('tableView');
    const toggleButton = document.querySelector('.view-toggle-button');
    const gridIcon = toggleButton.querySelector('.grid-icon');
    const tableIcon = toggleButton.querySelector('.table-icon');
    
    if (viewType === 'grid') {
        gridContainer.style.display = 'grid';
        tableContainer.style.display = 'none';
        
        // Update button to show table icon (since we're in grid view, clicking will switch to table)
        gridIcon.style.display = 'none';
        tableIcon.style.display = 'block';
        toggleButton.setAttribute('data-current-view', 'grid');
        toggleButton.setAttribute('title', 'Switch to table view');
        
        // Update URL hash
        if (updateURL) {
            window.history.pushState({ view: 'grid' }, '', '#grid');
        }
    } else {
        gridContainer.style.display = 'none';
        tableContainer.style.display = 'block';
        
        // Update button to show grid icon (since we're in table view, clicking will switch to grid)
        gridIcon.style.display = 'block';
        tableIcon.style.display = 'none';
        toggleButton.setAttribute('data-current-view', 'table');
        toggleButton.setAttribute('title', 'Switch to grid view');
        
        // Update URL hash
        if (updateURL) {
            window.history.pushState({ view: 'table' }, '', '#table');
        }
    }
}

// Function to get current view from URL
function getCurrentViewFromURL() {
    const hash = window.location.hash.substring(1); // Remove the # symbol
    return hash === 'table' ? 'table' : 'grid'; // Default to grid if no hash or invalid hash
}

// Function to handle browser back/forward navigation
function handlePopState(event) {
    const viewType = getCurrentViewFromURL();
    switchView(viewType, false); // Don't update URL since we're responding to URL change
    
    // Setup scrollbar auto-hide when switching to table view via browser navigation
    if (viewType === 'table') {
        setTimeout(() => {
            setupScrollbarAutoHide();
        }, 100);
    }
}

// Function to filter table rows
function filterTableRows(searchText, activeTypeFilters, activeCategoryFilter, activeStatusFilters) {
    const rows = document.querySelectorAll('.table-view tbody tr');
    
    rows.forEach(row => {
        const name = row.querySelector('td:nth-child(3)').textContent.toLowerCase(); // Name column
        const type = row.getAttribute('data-type');
        const category = row.getAttribute('data-category');
        const status = row.getAttribute('data-status');
        
        // Get all searchable text content from the row
        const typeText = row.querySelector('td:nth-child(4)').textContent.toLowerCase(); // Type column
        const statusText = row.querySelector('td:nth-child(5)').textContent.toLowerCase(); // Status column
        const descriptionText = row.querySelector('.description').textContent.toLowerCase(); // Description column
        
        // Create searchable content string that includes all visible text
        const searchableContent = `${name} ${typeText} ${statusText} ${descriptionText}`.toLowerCase();
        
        const matchesSearch = !searchText || searchableContent.includes(searchText.toLowerCase());
        
        // Type filter: if no types selected, hide all; if types selected, must match one of them
        const matchesType = activeTypeFilters.length > 0 && activeTypeFilters.includes(type);
        
        // Status filter: if no status filters selected, hide all; if status filters selected, must match one of them
        const matchesStatus = activeStatusFilters.length > 0 && activeStatusFilters.includes(status);
        
        row.style.display = (matchesSearch && matchesType && matchesStatus) ? '' : 'none';
    });
}

// Function to handle scrollbar auto-hide
function setupScrollbarAutoHide() {
    const scrollContainer = document.querySelector('.table-scroll-container');
    if (!scrollContainer) return;
    
    let scrollTimeout;
    let isScrolling = false;
    
    // Show scrollbar on scroll start
    function showScrollbar() {
        scrollContainer.style.setProperty('--scrollbar-opacity', '1');
        scrollContainer.classList.add('scrolling');
        isScrolling = true;
    }
    
    // Hide scrollbar after delay
    function hideScrollbar() {
        scrollContainer.style.setProperty('--scrollbar-opacity', '0');
        scrollContainer.classList.remove('scrolling');
        isScrolling = false;
    }
    
    // Handle scroll events
    scrollContainer.addEventListener('scroll', () => {
        showScrollbar();
        
        // Clear existing timeout
        clearTimeout(scrollTimeout);
        
        // Set new timeout to hide scrollbar after 2 seconds
        scrollTimeout = setTimeout(() => {
            hideScrollbar();
        }, 2000);
    });
    
    // Show scrollbar on mouse enter
    scrollContainer.addEventListener('mouseenter', () => {
        showScrollbar();
        clearTimeout(scrollTimeout);
    });
    
    // Hide scrollbar on mouse leave (with delay)
    scrollContainer.addEventListener('mouseleave', () => {
        if (!isScrolling) {
            scrollTimeout = setTimeout(() => {
                hideScrollbar();
            }, 500);
        }
    });
    
    // Initially hide scrollbar
    hideScrollbar();
}

// Main function to initialize the grid and table
async function initializeGrid() {
    const gridContainer = document.getElementById('cardGrid');
    const tableBody = document.querySelector('.table-view tbody');
    const sourcesData = await readCSV('O11ysource Names.csv');
    
    if (sourcesData.length === 0) {
        console.error('No data loaded from CSV');
        return;
    }

    // Create filter tags
    const types = sourcesData.map(data => data['Component Type']);
    createFilterTags(types, 'typeFilterTags', sourcesData);
    createFilterTags(['Enabled', 'Not Enabled', 'Error'], 'statusFilterTags', sourcesData);

    // Create and append all cards and table rows
    sourcesData.forEach(data => {
        const card = createCard(data);
        gridContainer.appendChild(card);
        
        const row = createTableRow(data);
        tableBody.appendChild(row);
    });

    // Initialize filter states - all type filters enabled by default, all status filters enabled by default
    const allTypes = [...new Set(sourcesData.map(data => data['Component Type']))];
    window.activeTypeFilters = [...allTypes]; // Enable all type filters by default
    window.activeStatusFilters = ['enabled', 'not-enabled', 'error']; // All status filters active by default
    
    // Set all type checkboxes as checked by default
    setTimeout(() => {
        const typeCheckboxes = document.querySelectorAll('#typeFilterTags input[type="checkbox"]');
        typeCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        // Update the "All Types" checkbox state
        const allTypesCheckbox = document.querySelector('.type-option-all input');
        if (allTypesCheckbox) {
            allTypesCheckbox.checked = true;
        }
    }, 100);

    // Set up search functionality
    const searchInput = document.getElementById('sourceSearch');
    searchInput.addEventListener('input', (e) => {
        filterCards(e.target.value, window.activeTypeFilters, null, window.activeStatusFilters);
        filterTableRows(e.target.value, window.activeTypeFilters, null, window.activeStatusFilters);
    });

    // Set up view switching with URL routing
    const toggleButton = document.querySelector('.view-toggle-button');
    toggleButton.addEventListener('click', () => {
        const currentView = toggleButton.getAttribute('data-current-view');
        const newView = currentView === 'grid' ? 'table' : 'grid';
        switchView(newView);
        
        // Setup scrollbar auto-hide when switching to table view
        if (newView === 'table') {
            setTimeout(() => {
                setupScrollbarAutoHide();
            }, 100);
        }
    });

    // Set up browser navigation handling
    window.addEventListener('popstate', handlePopState);
    
    // Initialize view based on current URL
    const initialView = getCurrentViewFromURL();
    switchView(initialView, false); // Don't update URL on initial load
    
    // If no hash in URL, set default hash
    if (!window.location.hash) {
        window.history.replaceState({ view: 'grid' }, '', '#grid');
    }

    // Set up "Select All" checkbox functionality
    const selectAllCheckbox = document.getElementById('selectAll');
    selectAllCheckbox.addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('.table-view tbody .checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
            // Update row highlighting
            const row = checkbox.closest('tr');
            if (checkbox.checked) {
                row.classList.add('highlighted');
            } else {
                row.classList.remove('highlighted');
            }
        });
    });

    // Set up individual checkbox functionality for row highlighting
    function setupRowCheckboxes() {
        const checkboxes = document.querySelectorAll('.table-view tbody .checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const row = checkbox.closest('tr');
                if (checkbox.checked) {
                    row.classList.add('highlighted');
                } else {
                    row.classList.remove('highlighted');
                }
                
                // Update "Select All" checkbox state
                const allCheckboxes = document.querySelectorAll('.table-view tbody .checkbox');
                const checkedCheckboxes = document.querySelectorAll('.table-view tbody .checkbox:checked');
                const selectAllCheckbox = document.getElementById('selectAll');
                
                if (checkedCheckboxes.length === 0) {
                    selectAllCheckbox.checked = false;
                    selectAllCheckbox.indeterminate = false;
                } else if (checkedCheckboxes.length === allCheckboxes.length) {
                    selectAllCheckbox.checked = true;
                    selectAllCheckbox.indeterminate = false;
                } else {
                    selectAllCheckbox.checked = false;
                    selectAllCheckbox.indeterminate = true;
                }
            });
        });
    }

    // Call setup function after table rows are created
    setupRowCheckboxes();

    // Set up status filter tags - multiple selection support
    const statusFilterTags = document.querySelectorAll('#statusFilterTags .filter-tag');
    statusFilterTags.forEach(tag => {
        // Set all tags as active by default
        tag.classList.add('active');
        
        tag.addEventListener('click', () => {
            const statusValue = tag.textContent.toLowerCase().replace(' ', '-');
            
            if (window.activeStatusFilters.includes(statusValue)) {
                // Remove from active filters
                window.activeStatusFilters = window.activeStatusFilters.filter(s => s !== statusValue);
                tag.classList.remove('active');
            } else {
                // Add to active filters
                window.activeStatusFilters.push(statusValue);
                tag.classList.add('active');
            }
            
            filterCards(searchInput.value, window.activeTypeFilters, null, window.activeStatusFilters);
            filterTableRows(searchInput.value, window.activeTypeFilters, null, window.activeStatusFilters);
        });
    });

    // Setup scrollbar auto-hide for initial load if table view is active
    if (initialView === 'table') {
        setTimeout(() => {
            setupScrollbarAutoHide();
        }, 100);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeGrid); 