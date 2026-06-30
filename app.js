/* =========================================================
   ViralScreen v3.0 FINAL
   PART 1 - CORE
========================================================= */

const API = "https://vxz.megadon8787.workers.dev";

/* ==========================
   GLOBAL
========================== */

let heroMovie = null;
let heroList = [];
let heroIndex = 0;
let heroTimer = null;
let searchTimer = null;

let currentPage = "home";
let currentType = "movie";

/* ==========================
   API
========================== */

async function api(endpoint){

    try{

        const res = await fetch(API + endpoint);

        if(!res.ok){
            throw new Error("HTTP " + res.status);
        }

        return await res.json();

    }catch(err){

        console.error(err);

        showToast("Failed to load data");

        return null;

    }

}

/* ==========================
   IMAGE
========================== */

function getImage(path){

    if(!path){
        return "https://placehold.co/500x750?text=No+Image";
    }

    return "https://image.tmdb.org/t/p/w500" + path;

}

function getBackdrop(path){

    if(!path){
        return "https://placehold.co/1920x1080?text=No+Backdrop";
    }

    return "https://image.tmdb.org/t/p/original" + path;

}

/* ==========================
   FORMAT
========================== */

function getYear(date){

    if(!date) return "-";

    return date.substring(0,4);

}

function getRating(v){

    return Number(v || 0).toFixed(1);

}

function safeText(text){

    return text || "-";

}

function runtime(min){

    if(!min) return "-";

    const h = Math.floor(min / 60);
    const m = min % 60;

    return `${h}h ${m}m`;

}

/* ==========================
   SCROLL
========================== */

function scrollTopSmooth(){

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}

/* ==========================
   APP
========================== */

function setApp(html){

    const app = document.getElementById("app");

    if(app){

        app.innerHTML = html;

    }

}

/* ==========================
   LOADING
========================== */

function loading(){

    return `
    <div class="loading">

        Loading...

    </div>
    `;

}

function empty(msg="No Data"){

    return `
    <div class="empty">

        ${msg}

    </div>
    `;

}

/* ==========================
   TOAST
========================== */

function showToast(msg){

    const toast = document.getElementById("toast");

    if(!toast) return;

    toast.textContent = msg;

    toast.style.display = "block";

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(()=>{

        toast.style.display="none";

    },2500);

}

/* ==========================
   SKELETON
========================== */

function skeletonCard(){

    return `
    <div class="card skeleton">

        <div class="skeleton-box"></div>

        <div class="skeleton-line"></div>

        <div class="skeleton-line short"></div>

    </div>
    `;

}

function showLoadingGrid(id){

    const row=document.getElementById(id);

    if(!row) return;

    row.innerHTML=

        skeletonCard()+
        skeletonCard()+
        skeletonCard()+
        skeletonCard()+
        skeletonCard()+
        skeletonCard();

}

/* ==========================
   HOME
========================== */

function goHome(){

    currentPage="home";

    scrollTopSmooth();

    loadHero();

    loadHome();

}

/* ==========================
   NETWORK
========================== */

window.addEventListener("online",()=>{

    showToast("✅ Back Online");

});

window.addEventListener("offline",()=>{

    showToast("⚠ Offline Mode");

});


/* =========================================================
   PART 2 - CARD + GRID + HERO
========================================================= */

/* ==========================
   CARD
========================== */

function movieCard(item, type = "movie") {

    const title = item.title || item.name || "Unknown";

    const year = getYear(item.release_date || item.first_air_date);

    const rating = getRating(item.vote_average);

    const poster = getImage(item.poster_path || item.profile_path);

    const click =
        type === "person"
            ? `openPersonDetail(${item.id})`
            : `openDetail(${item.id},"${type}")`;

    return `
<div class="card fade" onclick='${click}'>

    <div class="poster">

        <span class="badge">
            ⭐ ${rating}
        </span>

        <img
            src="${poster}"
            alt="${title}"
            loading="lazy">

    </div>

    <h4>${title}</h4>

    <p class="card-year">
        ${year}
    </p>

</div>
`;

}

/* ==========================
   GRID
========================== */

function renderGrid(id, items = [], type = "movie") {

    const row = document.getElementById(id);

    if (!row) return;

    if (!items.length) {

        row.innerHTML = empty();

        return;

    }

    row.innerHTML =
        items.map(item => movieCard(item, type)).join("");

}

/* ==========================
   HERO
========================== */

async function loadHero() {

    const data = await api("/trending/movie/day");

    if (!data?.results?.length) return;

    heroList = data.results.slice(0, 5);

    heroIndex = 0;

    updateHero();

    createHeroDots();

    clearInterval(heroTimer);

    heroTimer = setInterval(heroNext, 8000);

}

function updateHero() {

    heroMovie = heroList[heroIndex];

    if (!heroMovie) return;

    const hero = document.getElementById("hero");

    if (!hero) return;

    hero.style.backgroundImage =
        `url("${getBackdrop(heroMovie.backdrop_path)}")`;

    document.getElementById("heroTitle").textContent =
        safeText(heroMovie.title);

    document.getElementById("heroOverview").textContent =
        safeText(heroMovie.overview);

    document.getElementById("heroRating").textContent =
        "⭐ " + getRating(heroMovie.vote_average);

    document.getElementById("heroYear").textContent =
        getYear(heroMovie.release_date);

    document.querySelectorAll(".hero-dot").forEach((dot, index) => {

        dot.classList.toggle(
            "active",
            index === heroIndex
        );

    });

}

function createHeroDots() {

    const wrap =
        document.getElementById("heroDots");

    if (!wrap) return;

    wrap.innerHTML =
        heroList.map((item, index) =>

            `<div
                class="hero-dot ${index === heroIndex ? "active" : ""}"
                onclick="heroGoto(${index})">
            </div>`

        ).join("");

}

function heroGoto(index) {

    heroIndex = index;

    updateHero();

    resetHeroTimer();

}

function heroPrev() {

    heroIndex--;

    if (heroIndex < 0)
        heroIndex = heroList.length - 1;

    updateHero();

    resetHeroTimer();

}

function heroNext() {

    heroIndex++;

    if (heroIndex >= heroList.length)
        heroIndex = 0;

    updateHero();

}

function resetHeroTimer() {

    clearInterval(heroTimer);

    heroTimer =
        setInterval(heroNext, 8000);

}

/* ==========================
   HERO BUTTON
========================== */

function heroMoreInfo() {

    if (!heroMovie) return;

    openDetail(heroMovie.id, "movie");

}

async function playHeroTrailer() {

    if (!heroMovie) return;

    const videos =
        await api(`/movie/${heroMovie.id}/videos`);

    const trailer =
        videos?.results?.find(v =>

            v.site === "YouTube" &&
            v.type === "Trailer"

        );

    if (!trailer) {

        showToast("Trailer not available");

        return;

    }

    window.open(

        `https://www.youtube.com/watch?v=${trailer.key}`,

        "_blank"

    );

}

/* =========================================================
   PART 3 - HOME + MOVIES + TV + PEOPLE + SEARCH
========================================================= */

/* ==========================
   HOME
========================== */

async function loadSection(endpoint, id, type = "movie") {

    showLoadingGrid(id);

    const data = await api(endpoint);

    if (!data) {

        const row = document.getElementById(id);

        if (row) row.innerHTML = empty("Failed to load");

        return;

    }

    renderGrid(id, data.results || [], type);

}

async function loadHome() {

    currentPage = "home";

    setApp(`

<section class="section">

<div class="section-header">
<h2 class="section-title">🔥 Trending Movies</h2>
</div>

<div id="trendingRow" class="row"></div>

</section>


<section class="section">

<div class="section-header">
<h2 class="section-title">🎬 Popular Movies</h2>
</div>

<div id="popularRow" class="row"></div>

</section>


<section class="section">

<div class="section-header">
<h2 class="section-title">📺 Top Rated TV</h2>
</div>

<div id="tvRow" class="row"></div>

</section>


<section class="section">

<div class="section-header">
<h2 class="section-title">👤 Popular People</h2>
</div>

<div id="peopleRow" class="row"></div>

</section>

`);

    await Promise.all([

        loadSection("/trending/movie/day", "trendingRow"),

        loadSection("/movie/popular", "popularRow"),

        loadSection("/tv/top_rated", "tvRow", "tv"),

        loadSection("/person/popular", "peopleRow", "person")

    ]);

}

/* ==========================
   MOVIES
========================== */

async function loadMovies() {

    currentPage = "movie";

    setApp(`

<section class="section">

<div class="section-header">
<h2 class="section-title">🎬 Popular Movies</h2>
</div>

<div id="moviesGrid" class="grid"></div>

</section>

`);

    showLoadingGrid("moviesGrid");

    const data = await api("/movie/popular");

    renderGrid(

        "moviesGrid",

        data?.results || [],

        "movie"

    );

}

/* ==========================
   TV
========================== */

async function loadTV() {

    currentPage = "tv";

    setApp(`

<section class="section">

<div class="section-header">
<h2 class="section-title">📺 Top Rated TV Shows</h2>
</div>

<div id="tvGrid" class="grid"></div>

</section>

`);

    showLoadingGrid("tvGrid");

    const data = await api("/tv/top_rated");

    renderGrid(

        "tvGrid",

        data?.results || [],

        "tv"

    );

}

/* ==========================
   PEOPLE
========================== */

async function loadPeople() {

    currentPage = "person";

    setApp(`

<section class="section">

<div class="section-header">
<h2 class="section-title">👤 Popular People</h2>
</div>

<div id="peopleGrid" class="grid"></div>

</section>

`);

    showLoadingGrid("peopleGrid");

    const data = await api("/person/popular");

    renderGrid(

        "peopleGrid",

        data?.results || [],

        "person"

    );

}

/* ==========================
   SEARCH
========================== */

async function searchMovie() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    const keyword = input.value.trim();

    if (!keyword) {

        goHome();

        return;

    }

    showToast("Searching...");

    const [

        movies,

        tv,

        people

    ] = await Promise.all([

        api("/search/movie?query=" + encodeURIComponent(keyword)),

        api("/search/tv?query=" + encodeURIComponent(keyword)),

        api("/search/person?query=" + encodeURIComponent(keyword))

    ]);

    const movieResult = movies?.results || [];

    const tvResult = tv?.results || [];

    const peopleResult = people?.results || [];

    setApp(`

<section class="section">

<h2 class="section-title">

🎬 Movies (${movieResult.length})

</h2>

<div class="grid">

${movieResult.length ?

movieResult.map(m=>movieCard(m,"movie")).join("")

:

empty("Movie not found")

}

</div>

</section>


<section class="section">

<h2 class="section-title">

📺 TV Shows (${tvResult.length})

</h2>

<div class="grid">

${tvResult.length ?

tvResult.map(m=>movieCard(m,"tv")).join("")

:

empty("TV Show not found")

}

</div>

</section>


<section class="section">

<h2 class="section-title">

👤 People (${peopleResult.length})

</h2>

<div class="grid">

${peopleResult.length ?

peopleResult.map(m=>movieCard(m,"person")).join("")

:

empty("People not found")

}

</div>

</section>

`);

    scrollTopSmooth();

}

/* ==========================
   SEARCH LISTENER
========================== */

function setupSearch() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    input.addEventListener("input", () => {

        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {

            const value = input.value.trim();

            if (value.length >= 2) {

                searchMovie();

            } else if (value === "") {

                goHome();

            }

        }, 400);

    });

}

/* ==========================
   START APP
========================== */

window.addEventListener("DOMContentLoaded", async () => {

    await loadHero();

    await loadHome();

    setupSearch();

    console.log("ViralScreen Ready");

});

/* ==========================
   EVENTS
========================== */

document.querySelector(".logo")?.addEventListener("click", goHome);

setInterval(loadHero, 15 * 60 * 1000);


/* =========================================================
   PART 4A - DETAIL PAGE + TRAILER
========================================================= */

async function openDetail(id, type = "movie") {

    scrollTopSmooth();

    showToast("Loading...");

    const detail = await api(`/${type}/${id}`);

    if (!detail) {
        showToast("Failed to load");
        return;
    }

    const videos = await api(`/${type}/${id}/videos`);
    const credits = await api(`/${type}/${id}/credits`);
    const recommendations = await api(`/${type}/${id}/recommendations`);

    const trailer = videos?.results?.find(v =>
        v.site === "YouTube" &&
        (v.type === "Trailer" || v.type === "Teaser")
    );

    const genres =
        detail.genres?.map(g => g.name).join(", ") || "-";

    const runtime =
        detail.runtime
            ? detail.runtime + " min"
            : detail.number_of_seasons
                ? detail.number_of_seasons + " Seasons"
                : "-";

    const release =
        detail.release_date ||
        detail.first_air_date ||
        "-";

    setApp(`

<div class="detail-page">

<div
class="detail-backdrop"
style="background-image:url('${getBackdrop(detail.backdrop_path)}')">

</div>

<div class="detail-content">

<div class="detail-poster">

<img
src="${getImage(detail.poster_path)}"
alt="${detail.title || detail.name}">

</div>

<div class="detail-info">

<h1>

${detail.title || detail.name}

</h1>

<div class="detail-meta">

<span>

⭐ ${getRating(detail.vote_average)}

</span>

<span>

${getYear(release)}

</span>

<span>

${runtime}

</span>

<span>

${genres}

</span>

</div>

<p class="detail-overview">

${safeText(detail.overview)}

</p>

<div class="detail-actions">

<button
class="btn btn-primary"
onclick="playHeroTrailer()">

▶ Trailer

</button>

<button
class="btn btn-secondary"
onclick="goHome()">

← Home

</button>

</div>

${
trailer
?

`

<div class="trailer">

<iframe

src="https://www.youtube.com/embed/${trailer.key}"

allowfullscreen>

</iframe>

</div>

`

:

`

<p style="margin-top:25px;color:#94a3b8">

Trailer not available.

</p>

`

}

<h2>

🎭 Cast

</h2>

<div

id="castRow"

class="cast-row">

</div>

<h2>

🎬 Recommendations

</h2>

<div

id="recommendationRow"

class="recommendation-row">

</div>

</div>

</div>

</div>

`);

    renderCast(credits?.cast || []);

    renderRecommendations(

        recommendations?.results || [],

        type

    );

}


/* =========================================================
   DETAIL MOVIE
========================================================= */

async function openDetail(id, type = "movie") {

    scrollTopSmooth();

    const detail = await api(`/${type}/${id}`);

    if (!detail) {
        showToast("Failed to load detail");
        return;
    }

    const videos = await api(`/${type}/${id}/videos`);
    const credits = await api(`/${type}/${id}/credits`);
    const recommendations = await api(`/${type}/${id}/recommendations`);

    const trailer = videos?.results?.find(v =>
        v.site === "YouTube" &&
        (v.type === "Trailer" || v.type === "Teaser")
    );

    const cast = (credits?.cast || []).slice(0, 12);

    const recommend = recommendations?.results || [];

    setApp(`
<div class="detail-page fade">

<div
class="detail-backdrop"
style="background-image:url('${getBackdrop(detail.backdrop_path)}')">
</div>

<div class="detail-content">

<div class="detail-poster">
<img src="${getImage(detail.poster_path)}">
</div>

<div class="detail-info">

<h1>${detail.title || detail.name}</h1>

<div class="detail-meta">

<span>⭐ ${getRating(detail.vote_average)}</span>

<span>${getYear(detail.release_date || detail.first_air_date)}</span>

<span>${safeText(detail.runtime || detail.number_of_episodes)} ${
type === "movie" ? "min" : "Episodes"
}</span>

</div>

<p class="detail-overview">
${safeText(detail.overview)}
</p>

<div class="detail-actions">

<button
class="btn btn-primary"
onclick="playTrailer(${id},'${type}')">
▶ Watch Trailer
</button>

<button
class="btn btn-secondary"
onclick="goHome()">
Back
</button>

</div>

${
trailer
?
`
<div class="trailer">

<iframe
src="https://www.youtube.com/embed/${trailer.key}"
allowfullscreen>
</iframe>

</div>
`
:
""
}

<h2>Cast</h2>

<div class="cast-row">

${cast.map(actor => `
<div
class="cast-card"
onclick="openPersonDetail(${actor.id})">

<img src="${getImage(actor.profile_path)}">

<p>${actor.name}</p>

</div>
`).join("")}

</div>

<h2>Recommendations</h2>

<div class="recommendation-row">

${recommend.map(movie =>
movieCard(movie, type)
).join("")}

</div>

</div>

</div>

</div>
`);

}


/* =========================================================
   PLAY TRAILER
========================================================= */

async function playTrailer(id,type="movie"){

    const videos = await api(`/${type}/${id}/videos`);

    const trailer = videos?.results?.find(v=>

        v.site==="YouTube" &&
        (v.type==="Trailer" || v.type==="Teaser")

    );

    if(trailer){

        window.open(

            `https://www.youtube.com/watch?v=${trailer.key}`,

            "_blank"

        );

    }else{

        showToast("Trailer not available");

    }

}

/* =========================================================
   HERO BUTTONS
========================================================= */

async function playHeroTrailer(){

    if(!heroMovie) return;

    playTrailer(heroMovie.id,"movie");

}

function heroMoreInfo(){

    if(!heroMovie) return;

    openDetail(heroMovie.id,"movie");

}


/* =========================================================
   PART 4C - PERSON DETAIL + TRAILER
========================================================= */

async function openPersonDetail(id){

    scrollTopSmooth();

    showToast("Loading person...");

    const person = await api(`/person/${id}`);

    if(!person){
        showToast("Failed to load");
        return;
    }

    const credits = await api(`/person/${id}/combined_credits`);

    const knownFor = (credits?.cast || [])
        .sort((a,b)=>(b.popularity||0)-(a.popularity||0))
        .slice(0,12);

    setApp(`

<div class="detail-page">

<div
class="detail-backdrop"
style="background-image:url('${getBackdrop(person.profile_path)}')">
</div>

<div class="detail-content">

<div class="detail-poster">

<img
src="${getImage(person.profile_path)}"
alt="${person.name}">

</div>

<div class="detail-info">

<h1>${person.name}</h1>

<div class="detail-meta">

<span>${person.known_for_department || "-"}</span>

<span>${person.birthday || "-"}</span>

<span>${person.place_of_birth || "-"}</span>

</div>

<p class="detail-overview">

${safeText(person.biography)}

</p>

<div class="detail-actions">

<button
class="btn btn-secondary"
onclick="goHome()">

← Home

</button>

</div>

<h2>

Known For

</h2>

<div
id="knownForGrid"
class="grid">

</div>

</div>

</div>

</div>

`);

    renderGrid("knownForGrid", knownFor);

}

/* =========================================================
   PLAY TRAILER
========================================================= */

async function playTrailer(id,type="movie"){

    const videos = await api(`/${type}/${id}/videos`);

    const trailer = videos?.results?.find(v=>

        v.site==="YouTube" &&
        (v.type==="Trailer" || v.type==="Teaser")

    );

    if(trailer){

        window.open(

            `https://www.youtube.com/watch?v=${trailer.key}`,

            "_blank"

        );

    }else{

        showToast("Trailer not available");

    }

}

/* =========================================================
   HERO BUTTONS
========================================================= */

async function playHeroTrailer(){

    if(!heroMovie) return;

    playTrailer(heroMovie.id,"movie");

}

function heroMoreInfo(){

    if(!heroMovie) return;

    openDetail(heroMovie.id,"movie");

}


/* =========================================================
   PART 4D - FINAL UTILITIES
========================================================= */

function goHome(){

    scrollTopSmooth();

    loadHero();

    loadHome();

}

function toggleMenu(){

    document
        .querySelector(".nav-links")
        ?.classList.toggle("show");

}

/* ==========================
   SCROLL TOP
========================== */

const scrollBtn = document.getElementById("scrollTop");

window.addEventListener("scroll",()=>{

    if(!scrollBtn) return;

    if(window.scrollY > 400){

        scrollBtn.style.display="flex";

    }else{

        scrollBtn.style.display="none";

    }

});

/* ==========================
   ONLINE / OFFLINE
========================== */

window.addEventListener("online",()=>{

    showToast("✅ Back Online");

});

window.addEventListener("offline",()=>{

    showToast("⚠ Offline Mode");

});

/* ==========================
   LOGO
========================== */

window.addEventListener("DOMContentLoaded",()=>{

    document
        .querySelector(".logo")
        ?.addEventListener("click",goHome);

});

/* ==========================
   AUTO REFRESH HERO
========================== */

setInterval(()=>{

    loadHero();

},15*60*1000);

/* ==========================
   APP START
========================== */

window.addEventListener("DOMContentLoaded",async()=>{

    await loadHero();

    await loadHome();

    setupSearch();

    console.log("ViralScreen Ready");

});
