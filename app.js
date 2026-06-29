/* =========================================================
   megadon v2.1 CLEAN FINAL
========================================================= */

const API = "https://vxz.megadon8787.workers.dev";

let heroMovie = null;
let heroList = [];
let heroIndex = 0;
let heroTimer = null;
let searchTimer = null;

/* ==========================
   CORE
========================== */

async function api(endpoint){
    try{
        const res = await fetch(API + endpoint);
        if(!res.ok) throw new Error("HTTP " + res.status);
        return await res.json();
    }catch(err){
        console.error(err);
        showToast("Failed to load data");
        return null;
    }
}

function getImage(path){
    return path
        ? "https://image.tmdb.org/t/p/w500" + path
        : "https://placehold.co/500x750?text=No+Image";
}

function getBackdrop(path){
    return path
        ? "https://image.tmdb.org/t/p/original" + path
        : "https://placehold.co/1920x1080?text=No+Backdrop";
}

function getYear(date){
    return date ? date.substring(0,4) : "-";
}

function getRating(val){
    return Number(val || 0).toFixed(1);
}

function safeText(text){
    return text || "-";
}

function scrollTopSmooth(){
    window.scrollTo({top:0,behavior:"smooth"});
}

/* ==========================
   UI HELPERS
========================== */

function loading(){
    return `<div class="loading">Loading...</div>`;
}

function empty(msg="No Data"){
    return `<div class="empty">${msg}</div>`;
}

function showToast(msg){
    const el = document.getElementById("toast");
    if(!el) return;

    el.textContent = msg;
    el.style.display = "block";

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(()=>{
        el.style.display="none";
    },2500);
}

/* ==========================
   CARD
========================== */

function movieCard(item,type="movie"){
    const title = item.title || item.name || "Unknown";
    const year = getYear(item.release_date || item.first_air_date);
    const rating = getRating(item.vote_average);
    const poster = getImage(item.poster_path || item.profile_path);

    const click =
        type==="person"
        ? `openPersonDetail(${item.id})`
        : `openDetail(${item.id},"${type}")`;

    return `
<div class="card fade" onclick='${click}'>
<div class="poster">
<span class="badge">⭐ ${rating}</span>
<img src="${poster}" loading="lazy" alt="${title}">
</div>
<h4>${title}</h4>
<p class="card-year">${year}</p>
</div>`;
}

/* ==========================
   GRID
========================== */

function renderGrid(id,items=[],type="movie"){
    const row = document.getElementById(id);
    if(!row) return;

    if(!items.length){
        row.innerHTML = empty();
        return;
    }

    row.innerHTML = items.map(i=>movieCard(i,type)).join("");
}

function setApp(html){
    const app = document.getElementById("app");
    if(app){
        app.innerHTML = html;
    }
}

function showLoadingGrid(id){
    const row = document.getElementById(id);
    if(row) row.innerHTML = loading();
}

/* ==========================
   HERO
========================== */

async function loadHero(){
    const data = await api("/trending/movie/day");
    if(!data?.results?.length) return;

    heroList = data.results.slice(0,5);
    heroIndex = 0;

    updateHero();
    createHeroDots();

    if(heroTimer) clearInterval(heroTimer);

    heroTimer = setInterval(() => {
    heroNext();
}, 8000);
}

function updateHero(){

    heroMovie = heroList[heroIndex];
    if(!heroMovie) return;

    const hero = document.getElementById("hero");
    if(!hero) return;

    hero.style.backgroundImage =
        `url("${getBackdrop(heroMovie.backdrop_path)}")`;

    document.getElementById("heroTitle").textContent =
        safeText(heroMovie.title || heroMovie.name);

    document.getElementById("heroOverview").textContent =
        safeText(heroMovie.overview);

    document.getElementById("heroRating").textContent =
        "⭐ " + getRating(heroMovie.vote_average);

    document.getElementById("heroYear").textContent =
        getYear(heroMovie.release_date);

    document.querySelectorAll(".hero-dot").forEach((dot, index) => {
        dot.classList.toggle("active", index === heroIndex);
    });

}

function createHeroDots(){
    const wrap = document.getElementById("heroDots");
    if(!wrap) return;

    wrap.innerHTML = heroList.map((_,i)=>
        `<div class="hero-dot ${i===heroIndex?"active":""}" onclick="heroGoto(${i})"></div>`
    ).join("");
}

function heroGoto(i){
    heroIndex = i;
    updateHero();
    resetHeroTimer();
}

function heroPrev(){
    heroIndex = (heroIndex - 1 + heroList.length) % heroList.length;
    updateHero();
    resetHeroTimer();
}

function heroNext(){
    heroIndex = (heroIndex + 1) % heroList.length;
    updateHero();
}

function resetHeroTimer(){

    clearInterval(heroTimer);

    heroTimer = setInterval(() => {
    heroNext();
}, 8000);

}

/* ==========================
   HOME
========================== */

async function loadSection(endpoint,id,type="movie"){
    showLoadingGrid(id);
    const data = await api(endpoint);

    if(!data){
        document.getElementById(id).innerHTML = empty("Failed");
        return;
    }

    renderGrid(id,data.results,type);
}

async function loadHome(){
    await Promise.all([
        loadSection("/trending/movie/day","trendingRow"),
        loadSection("/movie/popular","popularRow"),
        loadSection("/tv/top_rated","tvRow","tv"),
        loadSection("/person/popular","peopleRow","person")
    ]);
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

    try {

        const [movies, tv, people] = await Promise.all([
            api("/search/movie?query=" + encodeURIComponent(keyword)),
            api("/search/tv?query=" + encodeURIComponent(keyword)),
            api("/search/person?query=" + encodeURIComponent(keyword))
        ]);

        const movieResult = movies?.results || [];
        const tvResult = tv?.results || [];
        const peopleResult = people?.results || [];

        setApp(`

<section class="section fade">

<h2>🎬 Movies (${movieResult.length})</h2>

<div class="grid">
${
movieResult.length
? movieResult.map(item => movieCard(item, "movie")).join("")
: empty("Movie not found")
}
</div>

</section>

<section class="section fade">

<h2>📺 TV Shows (${tvResult.length})</h2>

<div class="grid">
${
tvResult.length
? tvResult.map(item => movieCard(item, "tv")).join("")
: empty("TV Show not found")
}
</div>

</section>

<section class="section fade">

<h2>👤 People (${peopleResult.length})</h2>

<div class="grid">
${
peopleResult.length
? peopleResult.map(item => movieCard(item, "person")).join("")
: empty("People not found")
}
</div>

</section>

`);

        scrollTopSmooth();

    } catch (err) {

        console.error(err);

        showToast("Search failed");

    }

}

function setupSearch(){

    const input = document.getElementById("searchInput");
    if(!input) return;

    input.addEventListener("input", ()=>{

        clearTimeout(searchTimer);

        searchTimer = setTimeout(()=>{

            const value = input.value.trim();

            if(value.length >= 2){

                searchMovie();

            }else if(value === ""){

                goHome();

            }

        },400);

    });

}

window.addEventListener("DOMContentLoaded", async ()=>{
    await loadHero();
    await loadHome();
    setupSearch();
    console.log("APP READY");
});

/* ==========================
   EVENTS (NO DUPLICATE)
========================== */

document.querySelector(".logo")?.addEventListener("click",()=>{
    scrollTopSmooth();
    loadHero();
    loadHome();
});

window.addEventListener("online",()=>showToast("✅ Back Online"));
window.addEventListener("offline",()=>showToast("⚠ Offline Mode"));

setInterval(()=>loadHero(),15*60*1000);
