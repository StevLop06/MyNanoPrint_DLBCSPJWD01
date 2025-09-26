//>>>This File: handler_activitylog.js<<<

// Creates objects in relation to the impact score of activities & their variants
let activityBaseScore = { airCooling: 8, airHeating: 9, energyConsumption: 6, groceries: 2, delivery: 3, diningOut: 4, electronics: 4, furniture: 4, householdAppliance: 5, bicycle: 1, electricBicycle: 2, train: 3, bus: 4, motorcycle: 5, electricCar: 6, petrolCar: 7, airplane: 10 };
let multiplierSizes = { regular: 1, large: 2 };
let multiplierPeopleQuantity = { qty1: 1, qty3: 3, qty5: 5, qty7: 7, qty10: 10, qty15: 15, qty20: 20 };
let multiplierResidentialSize = { small: 1, average: 2, big: 3 };

//----GET ELEMENTS & HOLDS THEM IN VARIABLES----
const form = document.getElementById('sectionActivityForm');
const submitButton = document.getElementById('submitActivityButton');
const scoreElement = document.getElementById('activityForm_score');
const categoryDropdown = document.getElementById('mainDropdown_activityCategory');
const typeTitle = document.getElementById('activityForm_subTitle_Type');
const secondaryDropdowns = document.querySelectorAll('.secDropdown_activityType');
const tertiaryContainers = document.querySelectorAll('.tertiaryDropdownBox');
const residentialSizeDropdownBox = document.getElementById('tertiaryDropdownBox_ResidentialSizes');
const residentialSizeDropdown = document.getElementById('dropdown_ResidentialSizes');
const sizesDropdownBox = document.getElementById('tertiaryDropdownBox_Sizes');
const sizesDropdown = document.getElementById('dropdown_Sizes');
const quantityDropdownBox = document.getElementById('tertiaryDropdownBox_Quantity');
const quantityDropdown = document.getElementById('dropdown_Quantity');
const peopleQuantityDropdownBox = document.getElementById('tertiaryDropdownBox_PeopleQuantity');
const peopleQuantityDropdown = document.getElementById('dropdown_PeopleQuantity');
const daysDropdownBox = document.getElementById('tertiaryDropdownBox_Days');
const daysDropdown = document.getElementById('dropdown_DaysAmount');

//----HELPER FUNCTIONS TO HIDE DROPDOWNS----

// Hide Secondary (Type) & Tertiary Dropdowns
function hideSecondaryDropdowns() {
    typeTitle.classList.add('hidden');
    secondaryDropdowns.forEach(dropdown => dropdown.classList.add('hidden'));
}
function hideTertiaryDropdowns() {
    tertiaryContainers.forEach(container => container.classList.add('hidden'));
}
// Takes any dropdown, loops through each element & defaults to their first element
function resetDropdowns(dropdowns) {
    dropdowns.forEach(dropdown => { dropdown.selectedIndex = 0; });
}

//----CHECKS FORM VALIDITY & ENABLES OR DISABLES SUBMIT BUTTON----
function updateSubmitButtonState() {

    // Creates variable that assumes the form is valid
    let isFormValid = true;

    // Ensures the form is invalid if the user has not selected a category option (primary dropdown)
    if (categoryDropdown.value === 'null') { isFormValid = false; }

    // Checks the validity of the Secondary Dropdown (Type)
    const visibleSecDropdown = [...secondaryDropdowns].find(sdd => !sdd.classList.contains('hidden'));
    if (visibleSecDropdown) {
        if (visibleSecDropdown.value === 'null') isFormValid = false;
    } else {
        if (categoryDropdown.value !== 'null') isFormValid = false;
    }

    // Checks the validity of the Tertiary Dropdowns (quantities, sizes, etc.)
    const visibleTertiaryDropdowns = [...document.querySelectorAll('.tertiaryDropdownBox:not(.hidden) .thirdDropdown')];
    for (const dropdown of visibleTertiaryDropdowns) {
        if (dropdown.value === 'null') {
            isFormValid = false;
            break;
        }
    }

    // Enables or Disables button according to the result of previous checks
    submitButton.disabled = !isFormValid;
}

//----DISPLAYS SECONDARY DROPDOWNS----
// Listens for changes of options in the Primary Dropdown (Category) & displays corresponding Secondary Dropdown (Type)
categoryDropdown.addEventListener('change', () => {

    // Hides & resets other dropdowns to ensure cleanliness
    hideSecondaryDropdowns();
    hideTertiaryDropdowns();
    resetDropdowns(secondaryDropdowns);

    // Reads & saves value from the Primary Dropdown
    const selectedCategory = categoryDropdown.value;

    // If value from the primary dropdown is valid, then displays Secondary Dropdown
    if (selectedCategory !== 'null') {
        const targetDropdown = document.getElementById(`dropdown_${selectedCategory}Activity`);
        if (targetDropdown) {
            typeTitle.classList.remove('hidden');
            targetDropdown.classList.remove('hidden');
        }
    }

    // Checks if Submit Button should be active according to selections
    updateSubmitButtonState();

    // Update score on change
    updateScorePreview(); 
});

//----DISPLAYS TERTIARY DROPDOWNS----
// Loops through all Secondary Dropdowns (Type) & displays corresponding Tertiary Dropdowns
secondaryDropdowns.forEach(typeDropdown => {

    // Listens for changes of options
    typeDropdown.addEventListener('change', () => {

        // Hides all Tertiary Dropdowns for cleanliness
        hideTertiaryDropdowns();

        // Reads & holds selected options of Secondary & Primary Dropdowns
        const selectedCategory = categoryDropdown.value;
        const selectedType = typeDropdown.value;
        
        // Displays Tertiary Dropdowns depending of Primary Dropdown selected option
        if (selectedCategory === 'residential') {
            residentialSizeDropdownBox.classList.remove('hidden');
            daysDropdownBox.classList.remove('hidden');
        } else if (selectedCategory === 'shopping') {
            sizesDropdownBox.classList.remove('hidden');
            quantityDropdownBox.classList.remove('hidden');
        } else if (selectedCategory === 'transport') {
            daysDropdownBox.classList.remove('hidden');
            if (['electricCar', 'petrolCar'].includes(selectedType)) {
                sizesDropdownBox.classList.remove('hidden');
            }
        } else if (selectedCategory === 'food') {
            peopleQuantityDropdownBox.classList.remove('hidden');
        }

        // Checks if Submit Button should be active according to selections
        updateSubmitButtonState();

        // Update score on change
        updateScorePreview(); 
    });
});

//----DETECTS CHANGES IN THIRD DROPDOWN & UPDATES BUTTON & SCORE STATES----
document.querySelectorAll('.thirdDropdown').forEach(dropdown => {
    dropdown.addEventListener('change', () => {
        updateSubmitButtonState();
        updateScorePreview();
    });
});

//----CALCULATES IMPACT SCORE----
function calculateImpactScore() {

    // Initializes the Impact Score value
    let finalScore = 0;

    // Converts the Sec. Dropdown NodeList into an array, then finds the one not hidden
    const visibleSecDropdown = [...secondaryDropdowns].find(d => !d.classList.contains('hidden'));

    // If there is not a visible or valid Sec. Dropdown, Score is set to 0
    if (!visibleSecDropdown || visibleSecDropdown.value === 'null') {
        return 0;
    }

    // If Sec. Dropdown value exists, then holds & then reads the base score in array
    const activityType = visibleSecDropdown.value;
    const baseScore = activityBaseScore[activityType] || 0;
    finalScore = baseScore;

    // Applies multipliers with the corresponding Tertiary Dropdowns values
    if (!residentialSizeDropdownBox.classList.contains('hidden') && residentialSizeDropdown.value) {
        finalScore *= (multiplierResidentialSize[residentialSizeDropdown.value] || 1);
    }
    if (!sizesDropdownBox.classList.contains('hidden') && sizesDropdown.value !== 'null') {
        finalScore *= (multiplierSizes[sizesDropdown.value] || 1);
    }
    if (!peopleQuantityDropdownBox.classList.contains('hidden') && peopleQuantityDropdown.value) {
        finalScore *= (multiplierPeopleQuantity[peopleQuantityDropdown.value] || 1);
    }
    if (!daysDropdownBox.classList.contains('hidden') && daysDropdown.value) {
        finalScore *= parseInt(daysDropdown.value, 10);
    }
    if (!quantityDropdownBox.classList.contains('hidden') && quantityDropdown.value) {
        finalScore *= parseInt(quantityDropdown.value, 10);
    }

    // Final score is returned with a final value
    return Math.round(finalScore);
}

//----UPDATES IMPACT SCORE BY USING THE CALCULATION FUNCTION----
function updateScorePreview() {
    scoreElement.textContent = `Impact Score: ${calculateImpactScore().toString().padStart(2, '0')}`;
}

//----HANDLES FORM SUBMISSION----
form.addEventListener('submit', async e => {

    // Prevents reload of Page & default form submission
    e.preventDefault();

    // If the Submit Button is disabled, stops execution
    if (submitButton.disabled) return;

    // Attempts the form submission & resets everything, or shows error 
    try {
        // Finds & holds current visible Secondary Dropdown
        const visibleTypeDropdown = [...secondaryDropdowns].find(d => !d.classList.contains('hidden'));

        // Holds current Date
        const now = new Date();

        // Creates an array that holds all the information of an activity
        const activity = {
            category: categoryDropdown.options[categoryDropdown.selectedIndex].text, 
            activity_name: visibleTypeDropdown.options[visibleTypeDropdown.selectedIndex].text,
            date: now.toISOString(), 
            residential_size: !residentialSizeDropdownBox.classList.contains('hidden') ? residentialSizeDropdown.options[residentialSizeDropdown.selectedIndex].text : null,
            item_size: !sizesDropdownBox.classList.contains('hidden') ? sizesDropdown.options[sizesDropdown.selectedIndex].text : null,
            general_qty: !quantityDropdownBox.classList.contains('hidden') ? quantityDropdown.value : null,
            people_qty: !peopleQuantityDropdownBox.classList.contains('hidden') ? peopleQuantityDropdown.options[peopleQuantityDropdown.selectedIndex].text : null,
            days: !daysDropdownBox.classList.contains('hidden') ? daysDropdown.value : null,
            impact_score: calculateImpactScore()
        };

        // Holds a default false value to start, for future reference
        let savedResult = { success: false };

        // Checks if saveActivityToSupabase function exists & if it is possible to save to Database
        if (window.saveActivityToSupabase) {
            savedResult = await window.saveActivityToSupabase(activity);
        } else {
            // Fallbacks for guest users  
            if(window.renderActivity) window.renderActivity(activity);
        }
        
    } catch (error) {
        console.error("Failed to submit activity:", error);
        alert("An error occurred while submitting the activity. Please check the console for details.");
    } finally {
        form.reset();
        hideSecondaryDropdowns();
        hideTertiaryDropdowns();
        scoreElement.textContent = 'Impact Score: 00';
        updateSubmitButtonState();
        populateIdeasSection();
    }
});

// Does the initial check of the Submit Button
updateSubmitButtonState();
