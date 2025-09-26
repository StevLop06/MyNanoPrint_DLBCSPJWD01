
//----GET NEWS ARTICLES CONTAINER----
const newsArticleContainer = document.getElementById("newsArticleContainer");

//----GET PUBLIC URL FOR AN IMAGE IN THE DATABASE STORAGE----
function getNewsImageUrl(newsDate) {

    // Hols image name with proper format
    const fileName = `${newsDate}.jpg`;

    // Calls Database Storage API to get the image URL using the proper name
    const { data } = window.supabase.storage
        .from("MyNanoPrint_Images_NewsSection")
        .getPublicUrl(fileName);
    
    // Returns the URL (real or non existent - 404 error) or defaults to the fallback placeholder
    return data.publicUrl || "/assets/Placeholder1.png"; 
}

//----DINAMICALLY CREATES NEWS ARTICLES ELEMENTS----
function createNews(newsArray) {
    // Clears the whole Articles Container before rendering
    newsArticleContainer.innerHTML = "";

    // Loops through the retrieved rows
    newsArray.forEach(news => {

        // Retrieves corresponding image URL from Database bucket
        const imgUrl = getNewsImageUrl(news.newsDate);

        // Creates the indiviual News Article div & ensures it gets visually formated
        const article = document.createElement("div");
        article.classList.add("newsArticle");

        // Populates the News Article div with the proper elements & data via template literal
        article.innerHTML = `
            <h3 class="newsArticleTitle">${news.newsTitle}</h3>
            <div class="newsArticleContent">
                <div class="newsArticleContent_Top">
                    <img class="newsArticleIMG" src="${imgUrl}" alt="${news.newsTitle}">
                    <p class="newsArticleText">${news.newsContent}</p>
                </div>
                <div class="newsArticleContent_Bot">
                    <p class="newsArticleDate">${news.newsDate}</p>
                    <a href="${news.newsURL}" class="newsArticleURL" target="_blank" rel="noopener noreferrer">Read More...</a>
                </div>
            </div>
        `;

        // Adds new Article into the DOM, inside the News Articles Container
        newsArticleContainer.appendChild(article);
    });
}

//----RETRIEVES ALL ROWS FROM DATABASE & RENDERS THE NEWS ARTICLES----
async function loadNews() {
    // Checks if the News Articles Container is setup before trying to fetch news
    if (!newsArticleContainer) {
        console.error("News article container not found!");
        return;
    }

    // Calls Database to get an array of rows from the table & then sort them by date
    const { data, error } = await window.supabase
        .from("MyNanoPrint_Table_NewsSection")
        .select("*")
        .order("newsDate", { ascending: false });

    // If an error returns from Database, a message is thrown in the Container & the console log
    if (error) {
        console.error("Error loading news:", error.message);
        newsArticleContainer.innerHTML = "<p>Could not load news articles.</p>";
        return;
    }

    // Accounts for a lack of rows (News Articles) in the database & shows a message
    if (!data || data.length === 0) {
        newsArticleContainer.innerHTML = "<p>No news articles found.</p>";
        return;
    }

    // Loops through the rows & render articles with the retrieved data
    createNews(data);
}
