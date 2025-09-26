//>>>This File: handler_activityPersistence.js<<<

//----RENDERS ONE ACTIVITY INTO THE RECENT ACTIVITIES SECTION----
function renderActivity(activity) {

    // Gets & hold the container for all activities
    const recentActivitiesDiv = document.getElementById('div_recentActivities');

    // Gets & hold Subtitle "Log Activity"
    const subtitle = recentActivitiesDiv.querySelector("h3");

    // Creates a Div that wild hold an individual activity information
    const activityBox = document.createElement("div");
    activityBox.classList.add("submittedActivityBox");

    // Generates & formats current date of activity into readable format
    const activityDate = new Date(activity.date);
    const formattedDate = activityDate.toLocaleString([], { 
        year: "numeric", month: "short", day: "numeric", 
        hour: "2-digit", minute: "2-digit" 
    });

    // Inserts data into the top part of the Activity Box (creates the Top Div)
    activityBox.innerHTML = `
        <div class="submittedActivityBox_top">
            <p class="submittedActivityName">${activity.activity_name}</p>
            <p class="submittedActivityDate" data-timestamp="${activity.date}">${formattedDate}</p>
        </div>
    `;

    // Creates div that corresponds to the lower part of the Activity Box
    const bottomDiv = document.createElement("div");
    bottomDiv.classList.add("submittedActivityBox_bottom");

    // Checks category & adds it to the to Bottom Div
    if (activity.category) {
        const categoryP = document.createElement("p");
        categoryP.className = "submittedActivityCategory";
        categoryP.textContent = activity.category;
        bottomDiv.appendChild(categoryP);
    }

    // Ensures to only add into the Div the Tertiary Dropdowns field values that are valid & not empty
    function addField(value, className) {
        if (value !== null && value !== undefined && String(value).trim() !== '') {
            let p = document.createElement("p");
            p.className = className;
            p.textContent = value;
            bottomDiv.appendChild(p);
        }
    }

    // Invokes the function to check & add the values in the corresponding fields
    addField(activity.residential_size, "submittedActivityResidentialSize");
    addField(activity.item_size, "submittedActivityItemSize");
    addField(activity.general_qty, "submittedActivityGeneralQty");
    addField(activity.people_qty, "submittedActivityPeopleQty");
    addField(activity.days, "submittedActivityDays");
    addField(activity.impact_score?.toString(), "impactScore");

    // Inserts the finalized Bottom Div into the Single Activity Box 
    activityBox.appendChild(bottomDiv);

    // Inserts new individual Activity Box right after the Subtitle
    if (subtitle.nextSibling) {
        recentActivitiesDiv.insertBefore(activityBox, subtitle.nextSibling);
    } else {
        recentActivitiesDiv.appendChild(activityBox);
    }

    // Ensures the Statistics Graphic Chart gets properly updated with the new activity
    window.updateStatisticsGraphicSection();

}

//-----SAVES ACTIVITY-----
async function saveActivityToSupabase(activity) {

    // Generates single activity into the Recent Activities Section, taking the data of the activity log
    renderActivity(activity);

    // Checks with Database if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();

    // If the user has not logged in, activities are collected from DOM
    if (!session) {
        console.log("Guest user activity rendered temporarily.");

        // Refreshes Monthly Recap for guests
        if (window.renderMonthlyRecapSection) {
            const guestActivities = collectActivitiesFromDOM();
            renderMonthlyRecapSection(guestActivities);
        }

        // Returns an object indicating the absence of an active session
        return { success: false, reason: "no-session" };
    }

    try {
        // Creates an object with the Activity information to be saved on Database
        const activityData = {
        ...activity,
        user_id: session.user.id,
        days: activity.days ? parseInt(activity.days, 10) : null,
        impact_score: activity.impact_score ? parseInt(activity.impact_score, 10) : 0,
        };

        // Insert new Activity into Database or holds error & display messages
        const { error } = await supabase.from("MyNanoPrint_Table_activities").insert([activityData]);
        if (error) {
            console.error("Error saving activity:", error.message);
            alert(`Could not save activity to your profile: ${error.message}`);
            return { success: false, reason: error.message };
        }
        console.log("Activity saved to Database successfully!");

        // Increment the counter after a new activity is successfully saved
        if (window.incrementActivityCountUI) {
            window.incrementActivityCountUI();
        }

        // Refreshes the activities from Database & finishes de process
        await loadUserActivities();
        return { success: true };

    } catch (err) {
        // Alerts if an error has occurred while trying to save the new Activity
        console.error("A critical error ocurred during the save process:", err);
        alert("An unexpected error occurred. Please try again.");
        return { success: false, reason: err.message };
    }
}

//----RETRIEVES USER ACTIVITIES FOR LOGGED IN USERS----
let isLoadingActivities = false;
async function loadUserActivities() {

    // Prevents multiple calls colissions
    if (isLoadingActivities) {
        console.log("Skipping duplicate loadUserActivities call");
        return;
    }

    // If no call is being made, then a true value gets stores to proceed with the rest of the code
    isLoadingActivities = true;
    console.log("Attempting to load user activities...");

    // Attempts to retrieve an active session from Database
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.log("No active session found. Aborting activity load.");
        isLoadingActivities = false;
        return;
    }

    // Cleans the activity section
    clearRecentActivitiesSection();

    // Attempts to retrieve all activities from the specific user/session in the Database or returns error
    const { data, error } = await supabase
        .from("MyNanoPrint_Table_activities")
        .select("*")
        .eq("user_id", session.user.id)
        .order("date", { ascending: false });
    if (error) {
        console.error("Error loading activities from Database:", error.message);
        alert("Could not load your activities. Check the developer consolle for errors.");
        isLoadingActivities = false;
        return;
    }
    console.log(`Found ${data.length} activities for user ${session.user.id}.`);

    // If activities are retrieved, then renders them & refreshes Monthly Recap
    if (data && data.length > 0) {
        data.forEach(renderActivity);
        if (window.renderMonthlyRecapSection) {
            renderMonthlyRecapSection(data);
        }
    }

    // Resets value to false, so future calls can be made
    isLoadingActivities = false;
}

//-----CLEAN RECENT ACTIVITIES SECTION-----
function clearRecentActivitiesSection() {

    // Gets & hold the entire Recent Activities division, terminates if this div does not exists
    const recentActivitiesDiv = document.getElementById('div_recentActivities');
    if (!recentActivitiesDiv) return;

    // Gets all Activity Boxes & completely eliminate each
    const activitiesToRemove = recentActivitiesDiv.querySelectorAll(".submittedActivityBox");
    activitiesToRemove.forEach(el => el.remove());

    // Resets Monthly Recap Section
    const monthlyRecapSection = document.getElementById("monthlyRecapSection");
    if (monthlyRecapSection) {
        monthlyRecapSection.innerHTML = `
            <div id="subtitleMonthlyRecap" class="subtitleBox">
                <h2 class="titleElementH2">📅 MONTHLY RECAP</h2>
                <p id="noData_Message_Recap" class=""> Please enter new activities to generate recap...</p>
            </div>
        `;
    }

    // Ensures the Statistics Chart Section gets reset
    if (window.updateStatisticsGraphicSection) {
        window.updateStatisticsGraphicSection();
    }
}

//----BUILDS ACTIVITY OBJECTS FROM WHAT IS DISPLAYED---- 
function collectActivitiesFromDOM() {

    // Gets all Activity Boxes
    const activityboxes = document.querySelectorAll("#div_recentActivities .submittedActivityBox");

    // Transforms Nodelist to an Array, then extracts information from each Activity Box
    return Array.from(activityboxes).map(activitybox => {
        const name = activitybox.querySelector(".submittedActivityName")?.textContent || "Unknown";
        const date = activitybox.querySelector(".submittedActivityDate")?.dataset.timestamp || new Date().toISOString();
        const category = activitybox.querySelector(".submittedActivityCategory")?.textContent || null;
        const impactScore = parseInt(activitybox.querySelector(".impactScore")?.textContent || "0", 10);

        // Creates an object with the Activities Data
        return { activity_name: name, date, impact_score: impactScore };
    });
}