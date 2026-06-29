/* ==========================
   HERO FIX SAFE
========================== */

function updateHero(){

    if(!heroList.length) return;

    heroMovie = heroList[heroIndex];
    if(!heroMovie) return;

    const hero = document.getElementById("hero");
    if(!hero) return;

    hero.style.backgroundImage =
        `url("${getBackdrop(heroMovie.backdrop_path)}")`;

    document.getElementById("heroTitle")?.textContent =
        safeText(heroMovie.title || heroMovie.name);

    document.getElementById("heroOverview")?.textContent =
        safeText(heroMovie.overview);

    document.getElementById("heroRating")?.textContent =
        "⭐ " + getRating(heroMovie.vote_average);

    document.getElementById("heroYear")?.textContent =
        getYear(heroMovie.release_date);

    document.querySelectorAll(".hero-dot").forEach((dot, index) => {
        dot.classList.toggle("active", index === heroIndex);
    });

}

/* ==========================
   HERO NAV FIX
========================== */

function heroNext(){

    if(!heroList.length) return;

    heroIndex = (heroIndex + 1) % heroList.length;
    updateHero();
}

function heroPrev(){

    if(!heroList.length) return;

    heroIndex = (heroIndex - 1 + heroList.length) % heroList.length;
    updateHero();
}

/* ==========================
   TIMER FIX (ANTI DOUBLE)
========================== */

function resetHeroTimer(){

    if(heroTimer) clearInterval(heroTimer);

    heroTimer = setInterval(() => {
        heroNext();
    }, 8000);

}

/* ==========================
   LOAD HERO FIX
========================== */

async function loadHero(){

    const data = await api("/trending/movie/day");

    if(!data?.results?.length){
        console.warn("Hero empty");
        return;
    }

    heroList = data.results.slice(0,5);
    heroIndex = 0;

    updateHero();
    createHeroDots();
    resetHeroTimer();
}

/* ==========================
   SEARCH IMPROVED
========================== */

let lastSearchId = 0;

async function searchMovie() {

    const input = document.getElementById("searchInput");
    if (!input) return;

    const keyword = input.value.trim();

    if (!keyword) {
        goHome();
        return;
    }

    const currentSearch = ++lastSearchId;

    showToast("Searching...");

    try {

        const [movies, tv, people] = await Promise.all([
            api("/search/movie?query=" + encodeURIComponent(keyword)),
            api("/search/tv?query=" + encodeURIComponent(keyword)),
            api("/search/person?query=" + encodeURIComponent(keyword))
        ]);

        // ❗ IGNORE RESULT LAMA
        if(currentSearch !== lastSearchId) return;

        const movieResult = movies?.results || [];
        const tvResult = tv?.results || [];
        const peopleResult = people?.results || [];

        setApp(`
<section class="section fade">
<h2>🎬 Movies (${movieResult.length})</h2>
<div class="grid">
${movieResult.length
? movieResult.map(item => movieCard(item, "movie")).join("")
: empty("Movie not found")}
</div>
</section>

<section class="section fade">
<h2>📺 TV Shows (${tvResult.length})</h2>
<div class="grid">
${tvResult.length
? tvResult.map(item => movieCard(item, "tv")).join("")
: empty("TV Show not found")}
</div>
</section>

<section class="section fade">
<h2>👤 People (${peopleResult.length})</h2>
<div class="grid">
${peopleResult.length
? peopleResult.map(item => movieCard(item, "person")).join("")
: empty("People not found")}
</div>
</section>
`);

        scrollTopSmooth();

    } catch (err) {

        console.error(err);
        showToast("Search failed");

    }

}

/* ==========================
   SAFE INIT (ANTI DOUBLE LOAD)
========================== */

let appStarted = false;

window.addEventListener("DOMContentLoaded", async ()=>{

    if(appStarted) return;
    appStarted = true;

    await loadHero();
    await loadHome();
    setupSearch();

    console.log("APP READY");

});

/* ==========================
   LOGO CLICK FIX
========================== */

document.querySelector(".logo")?.addEventListener("click",()=>{

    scrollTopSmooth();

    heroIndex = 0; // reset posisi hero
    loadHero();
    loadHome();

});

/* ==========================
   BACKGROUND REFRESH SAFE
========================== */

setInterval(()=>{
    if(document.visibilityState === "visible"){
        loadHero();
    }
},15*60*1000);
