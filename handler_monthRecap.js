//>>>This File: handler_monthRecap.js<<<

function renderMonthlyRecapSection(activities) {

    // Gets entire container for the Monthly Recap Section or terminates if nothing is found
    const monthlyRecapSection = document.getElementById("monthlyRecapSection");
    if (!monthlyRecapSection) return;

    // Clears any content & inserts the Section Title before processing
    monthlyRecapSection.innerHTML = `
        <div id="subtitleMonthlyRecap" class="subtitleBox">
            <h2 class="titleElementH2">📅 MONTHLY RECAP</h2>
        </div>
    `;

    // Const to hold object of grouped activities
    const grouped = {};

    // Loops over every Activity to sort by Date
    activities.forEach(singleActivity => {

        // Holds Activity Date & validates that is an actual number
        const date = new Date(singleActivity.date);
        if (isNaN(date.getTime())) {
            console.warn("Skipping invalid date:", singleActivity.date, singleActivity);
            return;
        }

        // Holds 4 digit year
        const year = date.getFullYear();

        // Extracts the month & transform it into a short form
        const month = date.toLocaleString("default", { month: "short" });

        // Creates a key with the transformed data of the year & month variables
        const key = `${year}-${month}`;

        // Creates object of grouped activities if it does not exists
        if (!grouped[key]) grouped[key] = { year, month, items: [] };

        // Fills group object with activities information
        grouped[key].items.push({
            name: singleActivity.activity_name,
            score: singleActivity.impact_score ?? 0
        });
    });

    // Sort groups by date with the latest added first
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
        const [yearA, monthA] = a.split("-");
        const [yearB, monthB] = b.split("-");
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateB - dateA;
    });

    // Renders Recap
    sortedKeys.forEach(key => {

        // Hold the created group object & create the container for monthly group
        const group = grouped[key];
        const box = document.createElement("div");
        box.classList.add("box_activitiesByMonth");

        // Renders Monthly group
        box.innerHTML = `
            <div class="date">
                <div class="activitiesMonth">${group.month.toUpperCase()}</div>
                <div class="activitiesyear">${group.year}</div>
            </div>
            <div class="box_activityList"></div>
        `;

        // Gets & Hold the recently created div that will hold the Activity List
        const list = box.querySelector(".box_activityList");

        // Loops over all activities, inserts information, then adds it to the Activity List Div
        group.items.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("singleActivity");
            div.innerHTML = `${item.name} - <span class="singleActivity_Score">${item.score}</span>`;
            list.appendChild(div);
        });

        // Goes back to the main Recap Section container & adds the new Monthly Group
        monthlyRecapSection.appendChild(box);
    });
}
