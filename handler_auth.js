//>>>This File: handler_auth.js<<<

//----GETS ELEMENTS & HOLDS THEM IN VARIABLES----
const logInForm = document.getElementById("logIn_form");
const signUpForm = document.getElementById("signUp_form");
const logInErrorMessage = document.getElementById("logIn_errorMessage");
const signUpErrorMessage = document.getElementById("signUp_errorMessage");
const menuButtonsArea = document.getElementById("menuButtonsArea");
const buttonPendingLogIn = document.getElementById("button_pendingLogIn");
const buttonLoggedIn = document.getElementById("button_loggedIn");
const buttonSignOut = document.getElementById("button_signOut");
const profileUserName = document.getElementById("profile_userName");
const profileUserEmail = document.getElementById("profile_userEmail");
const profileUserActivityCount = document.getElementById("profile_userActivityCount");

//----CHANGES UI ACCORDING TO THE USER LOG STATE----
function updateUIForAuthState(session) {

    // Reacts to an active Session or lack there of
    if (session) {
        // Menu Buttons get revealed & log button in the header changes to green
        menuButtonsArea.classList.remove("hidden");
        buttonPendingLogIn.classList.add("hidden");
        buttonLoggedIn.classList.remove("hidden");

        // Restores the last-viewed section or defaults to the News Section
        const savedSection = localStorage.getItem("activeSection");
        if (savedSection && savedSection !== "accessSection") {
            setActiveSection(savedSection);
        } else {
            setActiveSection("newsSection"); // 
        }

        // Generates the News in the News Section
        if (typeof loadNews === "function") { loadNews(); }

        // Invokes the function to add user info into the Profile Section
        loadUserProfile(session.user);

        console.log("UI updated: Logged in");

    } else {
        // Menu Buttons get hidden & log button in the header changes to red
        menuButtonsArea.classList.add("hidden");
        buttonPendingLogIn.classList.remove("hidden");
        buttonLoggedIn.classList.add("hidden");

        // Display Log-In Section
        setActiveSection("accessSection");
        
        // Fills user profile w Generic info for test purposes
        profileUserName.textContent = "Name Placeholder";
        profileUserEmail.textContent = "placeholder@yahoo.com";
        profileUserActivityCount.textContent = "00";

        console.log("UI updated: Logged out");
    }
}

//----LOADS USER PROFILE INFORMATION & ACTIVITY COUNT----
async function loadUserProfile(user) {

    // Atempts to retrieve & implement the users data
    try {
        // Replaces placeholder info with the user's by using the session data from updateUIForAuthState()
        profileUserName.textContent = user.user_metadata?.firstname || "No Name";
        profileUserEmail.textContent = user.email || "No Email";

        // Query the Database table & returns amount of rows
        const { count, error } = await supabase
            .from("MyNanoPrint_Table_activities") // Reaches the table
            .select("*", { count: "exact", head: true }) // Counts rows but do not fetch data 
            .eq("user_id", user.id); // Filters rows where data in user_id column matches user.id

        // Checks if an error ocurred by taking the "error" const 
        if (error) {
            console.error("Error fetching activity count:", error.message);
            profileUserActivityCount.textContent = "00";
        } else {
            profileUserActivityCount.textContent = count.toString().padStart(2, "0");
        }
    } catch (err) {
        console.error("Error loading profile:", err);
    }
}

//----HANDLES SIGN UP----
signUpForm.addEventListener("submit", async (event) => {

    // Prevents reload of Page & default form submission
    event.preventDefault();

    // Reads typed data in the input fields & holds in variables
    const firstname = document.getElementById("signUp_inputField_firstname").value;
    const email = document.getElementById("signUp_inputField_email").value;
    const password = document.getElementById("signUp_inputField_password").value;
    const repeatPassword = document.getElementById("signUp_inputField_repeatPassword").value;

    // Compares both password fields & shows error message if they don't match
    if (password !== repeatPassword) {
        signUpErrorMessage.textContent = "Passwords do not match!";
        signUpErrorMessage.classList.remove("hidden");
        return;
    }

    // Attempts to insert a new user in Database with the Auth Service
    const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { firstname } }
    });

    // Displays an error or success message depending of the insertion result
    if (error) {
        signUpErrorMessage.textContent = error.message;
        signUpErrorMessage.classList.remove("hidden");
    } else {
        signUpErrorMessage.textContent = "✅ Sign up successful! Please check your email to confirm before logging in.";
        signUpErrorMessage.classList.remove("hidden");
    }
});

//----HANDLES LOG IN----
logInForm.addEventListener("submit", async (event) => {

    // Prevents reload of Page & default form submission
    event.preventDefault();

    // Reads typed data in the input fields & holds in variables
    const email = document.getElementById("logIn_inputField_email").value;
    const password = document.getElementById("logIn_inputField_password").value;

    // Request log in to Database Authentication module
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    // Shows message & sets display Section depending on log in success
    if (error) {
        logInErrorMessage.textContent = error.message;
        logInErrorMessage.classList.remove("hidden");
    } else {
        logInErrorMessage.textContent = "✅ Login successful!";
        logInErrorMessage.classList.remove("hidden");
        updateUIForAuthState(data.session);
        localStorage.setItem("activeSection", "newsSection");
    }
});

//----HANDLES SIGN OUT----
buttonSignOut.addEventListener("click", async () => {

    // Invokes the Authentication module signOut method, destructures result & holds any error that is returned
    const { error } = await supabase.auth.signOut();

    // Shows a message if there is an error, if not, reloads site & defaults to Access Section
    if (error) {
        console.error("Error signing out:", error);
    } else {
        localStorage.setItem("activeSection", "accessSection");
        location.reload();
    }
});

//----AUTH STATE LISTENER----
// Listens for any change in a user's authentication state
supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth state changed:", event, session);

    // Changes UI depending of a session validity
    updateUIForAuthState(session);

    // If session exists, attempts to load & display activities, otherwise attempts to clear the Activity Section
    if (session) {
        if (typeof loadUserActivities === "function") {
            loadUserActivities();
        }
    } else {
        if (typeof clearRecentActivitiesSection === "function") {
            clearRecentActivitiesSection();
        }
    }
});

//----IIAFE FOR INITIAL SESSION CHECK----
// On page load, inmediately checks if a user's session exists to shape UI
(async function checkInitialSession() {

    // Contacts Database to check the user's session, destructures answers & hold data
    const { data: { session } } = await supabase.auth.getSession();

    // Displays UI elements following if a valid session exists or not
    updateUIForAuthState(session);
})();

//----HELPER TO INCREMENT LIVE ACTIVITY COUNT----
function incrementActivityCountUI() {

    // Reads existent user's activity count in the Profile Section & converts it from string to integer
    const currentValue = parseInt(profileUserActivityCount.textContent, 10) || 0;

    // Increment user's activity count by 1
    const newValue = currentValue + 1;

    // Takes the new activity count, transforms it back into a string, then saves back into Profile
    profileUserActivityCount.textContent = newValue.toString().padStart(2, "0");
}