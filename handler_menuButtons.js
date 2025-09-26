//>>>This File: handler_menuButtons.js<<<

//----SETS WHICH SECTION IS VISIBLE----
function setActiveSection(sectionID) {

    // Selects & hides all Sections except the one used as parameter on the setActiveSection() function
    const sections = document.querySelectorAll("section");
    sections.forEach(section => {
        section.classList.toggle("hidden", section.id !== sectionID);
    });

    // Saves active Section into the Web Browser local storage for later retrieval
    localStorage.setItem("activeSection", sectionID);
    console.log(`Active section set to: ${sectionID}`);

    // Refreshes the Ideas Section for both Guest & Logged in Users
    if (sectionID === "ideasSection" && typeof window.populateIdeasSection === "function") {
        window.populateIdeasSection();
    }

}

//----SELECTS BUTTONS & SETS THEIR BEHAVIOUR----

// Guest Button is declared here so this file can find it
const buttonGuestAccess = document.getElementById("button_guestAccess");

// Displays the News Section (used after user logs in)
function startApp() {

    // Displays all Menu Buttons
    document.getElementById('menuButtonsArea').classList.remove('hidden');

    // Displays the News Section
    setActiveSection("newsSection");

    // Load news articles
    if (typeof loadNews === "function") {
        loadNews();
    }
    console.log('Guest Access: App Started');
}

// Access Buttons ready to receive clicks
document.getElementById("button_pendingLogIn").addEventListener("click", () => setActiveSection("accessSection"));
document.getElementById("button_loggedIn").addEventListener("click", () => setActiveSection("profileSection"));

// Ready Guest Button to receive click
if (buttonGuestAccess) {
    buttonGuestAccess.addEventListener("click", startApp);
}

// Ready Menu Buttons to receive clicks & change sections
document.getElementById("buttonNews").addEventListener("click", () => setActiveSection("newsSection"));
document.getElementById("buttonActivityLog").addEventListener("click", () => setActiveSection("activitySection"));
document.getElementById("buttonChart").addEventListener("click", () => setActiveSection("statisticsSection"));
document.getElementById("buttonRecap").addEventListener("click", () => setActiveSection("monthlyRecapSection"));
document.getElementById("buttonIdeas").addEventListener("click", () => setActiveSection("ideasSection"));
