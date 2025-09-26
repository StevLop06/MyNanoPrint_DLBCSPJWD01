//>>>This File: handler_ideas.js<<<

const IDEAS_BUCKET = "MyNanoPrint_Images_IdeasSection";

//----BUILDS AN IMAGE URL FOR A CATEGORY & REQUEST IT FROM SUPABASE----
function getIdeaImageUrl(category) {
    if (!category) return null;
    const fileName = category.charAt(0).toUpperCase() + category.slice(1) + ".jpg"; 
    return window.supabase.storage.from(IDEAS_BUCKET).getPublicUrl(fileName).data.publicUrl;
}

//----GETS RANDOM IDEA ARTICLE BY CATEGORY----
async function fetchRandomArticleByCategory(category) {
    try {
        // Gets (only) a precise count of the amount of articles in the Database
        const { count, error: countError } = await window.supabase
            .from('MyNanoPrint_Table_IdeasArticles')
            .select('*', { count: 'exact', head: true })
            .eq('ideasArticleCategory', category);     
        if (countError) throw countError;
        if (!count || count === 0) return null;

        // Generates a random number
        const randomIndex = Math.floor(Math.random() * count);

        // Gets actual article data, filters by category, selects randomly & ensures only one object is returned
        const { data, error: fetchError } = await window.supabase
            .from('MyNanoPrint_Table_IdeasArticles')
            .select('ideasArticleTitle, ideasArticleContent, ideasArticleCategory')
            .eq('ideasArticleCategory', category)
            .range(randomIndex, randomIndex)
            .single();

        // Returns final article information or shows an error
        if (fetchError) throw fetchError;
        return data;

    } catch (error) {
        console.error(`Error fetching article for category ${category}:`, error.message);
        return null;
    }
}

//----GET THE 2 MOST RECENT DISTINCT CATEGORIES FOR A LOGGED IN USER----
async function getRecentCategories(userId) {
    try {
        // Requests the user's activity rows' categories from the database
        const { data, error } = await window.supabase
            .from('MyNanoPrint_Table_activities')
            .select('category')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(10);
        if (error) throw error;

        // Holds 2 unique categories
        const uniqueCategories = [];
        
        // Loops over row data
        for (let row of data) {
            // Holds converted data to lower case
            const category = row.category.toLowerCase();
            // Push any unique category into the array
            if (!uniqueCategories.includes(category)) {
                uniqueCategories.push(category);
            }
            // Finishes loop when 2 unique categories are found
            if (uniqueCategories.length === 2) break;
        }

        // Returns array with 2 unique categories
        return uniqueCategories;

    } catch (error) {
        console.error("Error fetching recent categories:", error.message);
        return [];
    }
}

//----INSERTS ARTICLES IN THE IDEAS SECTION----
async function populateIdeasSection() {

    // Gets the main div where the Ideas Articles will be displayed
    const ideasSection = document.getElementById('ideasSection');
    if (!ideasSection) return;

    // Clears any previous Ideas Articles
    ideasSection.querySelectorAll('.ideasArticle').forEach(article => article.remove());

    // Show a loading message
    const loadingPlaceholder = document.createElement('div');
    loadingPlaceholder.className = 'ideasArticle';
    loadingPlaceholder.innerHTML = `
        <div class="ideasArticleContent">
            <p class="ideasArticleText">Loading fresh ideas...</p>
        </div>
    `;
    ideasSection.appendChild(loadingPlaceholder);

    try {
        // Hold a categories array
        let categories = [];

        // Verifies user session from Database
        const { data: { user } } = await window.supabase.auth.getUser();

        // If user is logged in, checks database activities (categories), otherwise gets data from DOM
        if (user) {
            categories = await getRecentCategories(user.id);
        } else {
            const activityDivs = Array.from(document.querySelectorAll('#div_recentActivities .submittedActivityBox'));
            const checkedCategories = [];
            for (let div of activityDivs) {
                const submittedActivity = div.querySelector('.submittedActivityCategory');
                if (submittedActivity) {
                    const categoryElement = submittedActivity.textContent.trim().toLowerCase();
                    if (!checkedCategories.includes(categoryElement)) {
                        checkedCategories.push(categoryElement);
                    }
                    if (checkedCategories.length === 2) break;
                }
            }
            categories = checkedCategories;
        }

        // Ensures that if there are categories available, they occupy the first 2 slots, then a generic
        categories = categories.slice(0, 2);
        while (categories.length < 2) categories.push("generic");
        categories.push("generic");

        // Loads one random article per category
        const articles = [];
        for (let categoryElement of categories) {
            let article = await fetchRandomArticleByCategory(categoryElement);
            if (!article && categoryElement !== "generic") {
                article = await fetchRandomArticleByCategory("generic");
            }
            if (!article) {
                article = {
                    ideasArticleTitle: "No idea available",
                    ideasArticleContent: "Add more activities to unlock personalized ideas!",
                    ideasArticleCategory: "generic"
                };
            }
            articles.push(article);
        }

        // Removes loading message
        if (loadingPlaceholder.parentNode) {
            ideasSection.removeChild(loadingPlaceholder);
        }

        // Loops over array of articles
        articles.forEach(article => {

            // Holds category, image URL & an individual article container
            const category = article.ideasArticleCategory || "generic";
            const imgUrl = getIdeaImageUrl(category);
            const articleContainer = document.createElement('div');

            // Generates HTML structure with the data
            articleContainer.className = 'ideasArticle';
            articleContainer.innerHTML = `
                <div class="ideasArticleContent">
                    <div class="ideasArticleTitle">${article.ideasArticleTitle}</div>
                    <p class="ideasArticleText">${article.ideasArticleContent}</p>
                </div>
                <div class="ideasArticleBackground">
                    <div class="ideasArticleBackground_darkOverlay"></div>
                    <img class="ideasArticleIMG" src="${imgUrl || '/assets/Placeholder1.png'}" alt="${category}">
                </div>
            `;

            // Inserts fresh article in the parent container
            ideasSection.appendChild(articleContainer);
        });

    } catch (error) {
        console.error("Error populating ideas section:", error.message);
        ideasSection.innerHTML = `
            <div class="ideasArticle">
                <div class="ideasArticleContent">
                    <p class="ideasArticleText">Could not load ideas. Please try again later.</p>
                </div>
            </div>
        `;
    }
}