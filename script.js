
const bloodGroups = [
    "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"
];

// Fictional sample data for the college demonstration
const sampleDonors = [
    {
        id: 1,
        name: "Aarav Patil",
        group: "O+",
        city: "Pune",
        phone: "9000000001",
        available: true
    },
    {
        id: 2,
        name: "Ananya Sharma",
        group: "A+",
        city: "Pune",
        phone: "9000000002",
        available: true
    },
    {
        id: 3,
        name: "Rohan Deshmukh",
        group: "B+",
        city: "Mumbai",
        phone: "9000000003",
        available: false
    },
    {
        id: 4,
        name: "Sneha Joshi",
        group: "AB+",
        city: "Pune",
        phone: "9000000004",
        available: true
    },
    {
        id: 5,
        name: "Ishaan Kulkarni",
        group: "O-",
        city: "Nashik",
        phone: "9000000005",
        available: true
    },
    {
        id: 6,
        name: "Meera Shah",
        group: "B-",
        city: "Mumbai",
        phone: "9000000006",
        available: true
    }
];

const STORAGE_KEY = "bloodBridgeDemoDonors";

// Load demo registrations saved in this browser
function loadRegisteredDonors() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const donors = JSON.parse(saved);

        if (!Array.isArray(donors)) {
            return [];
        }

        return donors.filter(donor =>
            donor &&
            Number.isInteger(donor.id) &&
            typeof donor.name === "string" &&
            bloodGroups.includes(donor.group) &&
            typeof donor.city === "string" &&
            typeof donor.phone === "string" &&
            typeof donor.available === "boolean"
        );
    } catch (error) {
        return [];
    }
}

let registeredDonors = loadRegisteredDonors();
let nextId = Date.now();

const donorList = document.getElementById("donorList");
const searchForm = document.getElementById("searchForm");
const searchGroup = document.getElementById("searchGroup");
const searchCity = document.getElementById("searchCity");
const searchMessage = document.getElementById("searchMessage");

const donorForm = document.getElementById("donorForm");
const registrationMessage =
    document.getElementById("registrationMessage");

// Combine the sample donors and new registrations
function getAllDonors() {
    return [...sampleDonors, ...registeredDonors];
}

// Create donor cards
function displayDonors(donors) {
    donorList.replaceChildren();

    if (donors.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent =
            "No matching demo donors found. Try another search.";
        donorList.appendChild(emptyMessage);
        return;
    }

    donors.forEach(donor => {
        const card = document.createElement("article");
        card.className = "donor-card";

        const name = document.createElement("h3");
        name.textContent = donor.name;

        const group = document.createElement("span");
        group.className = "blood-badge";
        group.textContent = donor.group;

        const city = document.createElement("p");
        city.textContent = "📍 " + donor.city;

        const status = document.createElement("span");
        status.className = donor.available
            ? "status"
            : "status unavailable";

        status.textContent = donor.available
            ? "● Available (Demo)"
            : "● Unavailable (Demo)";

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "availability-btn";
        toggle.textContent = donor.available
            ? "Mark Unavailable"
            : "Mark Available";

        toggle.setAttribute(
            "aria-label",
            "Change demo availability for " + donor.name
        );

        toggle.addEventListener("click", () => {
            toggleAvailability(donor.id);
        });

        card.append(name, group, city, status, toggle);
        donorList.appendChild(card);
    });
}

// Search donors by blood group and city
function searchDonors() {
    const group = searchGroup.value;
    const city = searchCity.value.trim().toLowerCase();

    const matches = getAllDonors().filter(donor => {
        const groupMatches =
            group === "" || donor.group === group;

        const cityMatches =
            city === "" ||
            donor.city.toLowerCase().includes(city);

        return groupMatches && cityMatches;
    });

    displayDonors(matches);

    searchMessage.textContent =
        matches.length + " demo donor(s) found.";
}

// Handle the search form
searchForm.addEventListener("submit", event => {
    event.preventDefault();
    searchDonors();
});

// Reset search filters
document.getElementById("resetSearch").addEventListener("click", () => {
    searchGroup.value = "";
    searchCity.value = "";
    searchMessage.textContent = "";
    displayDonors(getAllDonors());
});

// Update availability for a demo donor
function toggleAvailability(id) {
    let donor = registeredDonors.find(item => item.id === id);

    if (!donor) {
        donor = sampleDonors.find(item => item.id === id);
    }

    if (!donor) {
        return;
    }

    donor.available = !donor.available;

    // Save only registered donors to browser storage
    if (registeredDonors.some(item => item.id === id)) {
        saveRegisteredDonors();
    }

    searchDonors();
}

// Save demo registrations in this browser
function saveRegisteredDonors() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(registeredDonors)
        );
        return true;
    } catch (error) {
        return false;
    }
}

// Handle donor registration
donorForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!donorForm.checkValidity()) {
        donorForm.reportValidity();
        return;
    }

    const name = document.getElementById("donorName").value.trim();
    const group = document.getElementById("donorGroup").value;
    const city = document.getElementById("donorCity").value.trim();
    const phone = document.getElementById("donorPhone").value.trim();

    if (!name || !city || !bloodGroups.includes(group)) {
        registrationMessage.textContent =
            "Please fill in all fields correctly.";
        return;
    }

    const newDonor = {
        id: nextId++,
        name: name,
        group: group,
        city: city,
        phone: phone,
        available: true
    };

    registeredDonors.push(newDonor);

    if (!saveRegisteredDonors()) {
        registeredDonors.pop();

        registrationMessage.textContent =
            "Browser storage is unavailable. Please try again.";
        return;
    }

    registrationMessage.textContent =
        "Demo registration successful! Your donor card has been added.";

    donorForm.reset();

    searchGroup.value = "";
    searchCity.value = "";
    searchMessage.textContent = "Showing all demo donors.";

    displayDonors(getAllDonors());
});

// Display sample donors when the page first loads
displayDonors(getAllDonors());
