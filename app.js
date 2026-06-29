const API = "https://vxz.megadon8787.workers.dev";

let heroMovie = null;
let heroTrailer = null;
let heroIndex = 0;
let heroList = [];

/* ===================================
   API
=================================== */

async function api(endpoint){

    try{

        const res = await fetch(API + endpoint);

        if(!res.ok){

            throw new Error("API Error");

        }

        return await res.json();

    }catch(err){

        console.error(err);

        showToast("Failed to load data");

        return null;

    }

}

/* ===================================
   IMAGE
=================================== */

function getImage(path){

    if(!path){

        return "https://placehold.co/500x750?text=No+Image";

    }

    return "https://image.tmdb.org/t/p/w500"+path;

}

function getBackdrop(path){

    if(!path){

        return "https://placehold.co/1920x1080?text=No+Backdrop";

    }

    return "https://image.tmdb.org/t/p/original"+path;

}

/* ===================================
   TOAST
=================================== */

function showToast(text){

    const toast = document.getElementById("toast");

    if(!toast) return;

    toast.innerHTML = text;

    toast.style.display = "block";

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(()=>{

        toast.style.display = "none";

    },2500);

}

/* ===================================
   LOADING
=================================== */

function loading(){

    return `

<div class="loading">

Loading...

</div>

`;

}

/* ===================================
   CARD TEMPLATE
=================================== */

function movieCard(item,type="movie"){

    const title =
    item.title ||
    item.name ||
    "Unknown";

    const year =
    (
        item.release_date ||
        item.first_air_date ||
        ""
    ).substring(0,4);

    const rating =
    Number(
        item.vote_average || 0
    ).toFixed(1);

    const image =
    getImage(
        item.poster_path ||
        item.profile_path
    );

    const click =
    type==="person"
    ?

    `openPersonDetail(${item.id})`

    :

    `openDetail(${item.id},"${type}")`;

    return `

<div
class="card"
onclick='${click}'>

<div class="poster">

<span class="badge">

⭐ ${rating}

</span>

<img

loading="lazy"

decoding="async"

src="${image}"

alt="${title}"

onerror="this.onerror=null;this.src='https://placehold.co/500x750?text=No+Image'">

</div>

<h4>

${title}

</h4>

<p class="card-year">

${year || "-"}

</p>

</div>

`;

}

/* ===================================
   GRID
=================================== */

function renderGrid(rowId,items=[],type="movie"){

    const row =
    document.getElementById(rowId);

    if(!row) return;

    if(!items.length){

        row.innerHTML = `

<div class="empty">

No Data

</div>

`;

        return;

    }

    row.innerHTML =
    items
    .map(item=>movieCard(item,type))
    .join("");

}

/* ===================================
   SCROLL TOP
=================================== */

window.addEventListener("scroll",()=>{

    const btn =
    document.getElementById("scrollTop");

    if(!btn) return;

    btn.style.display =
    window.scrollY>600
    ? "block"
    : "none";

});


/* ===================================
   LOAD SECTION
=================================== */

async function loadSection(
    endpoint,
    rowId,
    type = "movie"
){

    const row =
    document.getElementById(rowId);

    if(!row) return;

    row.innerHTML = loading();

    const data =
    await api(endpoint);

    if(!data){

        row.innerHTML = `

<div class="empty">

Failed to load.

</div>

`;

        return;

    }

    renderGrid(
        rowId,
        data.results || [],
        type
    );

}

/* ===================================
   HOME
=================================== */

async function loadHome(){

    document
    .getElementById("app")
    .style.display = "block";

    loadSection(
        "/trending/movie/day",
        "trendingRow"
    );

    loadSection(
        "/movie/now_playing",
        "nowPlayingRow"
    );

    loadSection(
        "/movie/popular",
        "popularRow"
    );

    loadSection(
        "/movie/top_rated",
        "topRatedRow"
    );

    loadSection(
        "/movie/upcoming",
        "upcomingRow"
    );

    loadSection(
        "/tv/top_rated",
        "tvRow",
        "tv"
    );

    loadSection(
        "/person/popular",
        "peopleRow",
        "person"
    );

    setTimeout(()=>{

        autoScroll("trendingRow");

        autoScroll("nowPlayingRow");

        autoScroll("popularRow");

        autoScroll("topRatedRow");

        autoScroll("upcomingRow");

        autoScroll("tvRow");

        autoScroll("peopleRow");

    },1000);

}

/* ===================================
   MOVIES
=================================== */

async function loadMovies(){

    await loadSection(

        "/movie/popular",

        "trendingRow"

    );

}

/* ===================================
   TV
=================================== */

async function loadTV(){

    await loadSection(

        "/tv/top_rated",

        "trendingRow",

        "tv"

    );

}

/* ===================================
   PEOPLE
=================================== */

async function loadPeople(){

    await loadSection(

        "/person/popular",

        "trendingRow",

        "person"

    );

}

/* ===================================
   AUTO SCROLL
=================================== */

function autoScroll(id){

    const row =
    document.getElementById(id);

    if(!row) return;

    if(row.dataset.auto=="1") return;

    row.dataset.auto="1";

    let speed = 0.5;

    function animate(){

        if(
            row.scrollWidth <=
            row.clientWidth
        ){

            requestAnimationFrame(
                animate
            );

            return;

        }

        row.scrollLeft += speed;

        if(

            row.scrollLeft >=

            row.scrollWidth -

            row.clientWidth

        ){

            row.scrollLeft = 0;

        }

        requestAnimationFrame(
            animate
        );

    }

    animate();

}

/* ===================================
   HERO
=================================== */

async function loadHero(){

    const data =
    await api("/trending/movie/day");

    if(
        !data ||
        !data.results ||
        !data.results.length
    ) return;

    heroList =
    data.results.slice(0,5);

    heroIndex = 0;

    updateHero();

    createHeroDots();

    clearInterval(window.heroTimer);

    window.heroTimer =
    setInterval(()=>{

        heroIndex++;

        if(
            heroIndex>=heroList.length
        ){

            heroIndex=0;

        }

        updateHero();

    },8000);

}

/* ===================================
   UPDATE HERO
=================================== */

function updateHero(){

    heroMovie =
    heroList[heroIndex];

    if(!heroMovie) return;

    const hero =
    document.getElementById("hero");

    hero.style.backgroundImage =

    `url('${getBackdrop(heroMovie.backdrop_path)}')`;

    document
    .getElementById("heroTitle")
    .textContent =
    heroMovie.title ||
    heroMovie.name;

    document
    .getElementById("heroOverview")
    .textContent =
    heroMovie.overview ||
    "No overview.";

    document
    .getElementById("heroRating")
    .innerHTML =

    "⭐ " +

    Number(
    heroMovie.vote_average||0
    ).toFixed(1);

    document
    .getElementById("heroYear")
    .innerHTML =

    (
    heroMovie.release_date ||
    ""
    ).substring(0,4);

    document

    .querySelectorAll(".hero-dot")

    .forEach((dot,index)=>{

        dot.classList.toggle(

            "active",

            index===heroIndex

        );

    });

}

/* ===================================
   HERO DOTS
=================================== */

function createHeroDots(){

    const dots =
    document.getElementById("heroDots");

    if(!dots) return;

    dots.innerHTML="";

    heroList.forEach((m,index)=>{

        dots.innerHTML +=

        `

<div

class="hero-dot

${index===heroIndex?"active":""}"

onclick="heroGoto(${index})">

</div>

`;

    });

}

/* ===================================
   HERO GOTO
=================================== */

function heroGoto(index){

    heroIndex=index;

    updateHero();

}

/* ===================================
   WATCH TRAILER
=================================== */

async function playHeroTrailer(){

    if(!heroMovie) return;

    const data =
    await api(

    "/movie/"

    +heroMovie.id+

    "/videos"

    );

    const trailer =

    data?.results?.find(v=>

        v.site==="YouTube" &&

        v.type==="Trailer"

    );

    if(!trailer){

        showToast(

        "Trailer not available"

        );

        return;

    }

    window.open(

    "https://www.youtube.com/watch?v="

    +trailer.key,

    "_blank"

    );

}

/* ===================================
   MORE INFO
=================================== */

function heroMoreInfo(){

    if(!heroMovie) return;

    openDetail(

        heroMovie.id,

        "movie"

    );

}


/* ===================================
   SEARCH
=================================== */

async function searchMovie(){

    const input =
    document.getElementById("searchInput");

    if(!input) return;

    const keyword =
    input.value.trim();

    if(keyword===""){

        loadHero();

        loadHome();

        return;

    }

    document.getElementById("app").innerHTML =

    `<div class="loading">

        Searching...

    </div>`;

    try{

        const [

            movies,

            tv,

            people

        ] = await Promise.all([

            api(

            "/search/movie?query="+

            encodeURIComponent(keyword)

            ),

            api(

            "/search/tv?query="+

            encodeURIComponent(keyword)

            ),

            api(

            "/search/person?query="+

            encodeURIComponent(keyword)

            )

        ]);

        const movieResult =
        movies?.results || [];

        const tvResult =
        tv?.results || [];

        const peopleResult =
        people?.results || [];

        const total =

        movieResult.length+

        tvResult.length+

        peopleResult.length;

        if(total===0){

            document.getElementById("app").innerHTML =

            `

<section class="section">

<h2>

Search Result

</h2>

<div class="empty">

No result found.

</div>

</section>

`;

            return;

        }

        document.getElementById("app").innerHTML =

        `

<section class="section fade">

<h2>

🎬 Movies

</h2>

<div class="grid">

${movieResult.map(

i=>movieCard(i,"movie")

).join("")}

</div>

</section>

<section class="section fade">

<h2>

📺 TV Shows

</h2>

<div class="grid">

${tvResult.map(

i=>movieCard(i,"tv")

).join("")}

</div>

</section>

<section class="section fade">

<h2>

👤 People

</h2>

<div class="grid">

${peopleResult.map(

i=>movieCard(i,"person")

).join("")}

</div>

</section>

`;

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    }

    catch(err){

        console.error(err);

        showToast(

        "Search failed"

        );

    }

}

/* ===================================
   ENTER KEY
=================================== */

document.addEventListener(

"keydown",

e=>{

    if(

        e.key==="Enter"

    ){

        const active =

        document.activeElement;

        if(

            active &&

            active.id==="searchInput"

        ){

            searchMovie();

        }

    }

});

/* ===================================
   CLEAR SEARCH
=================================== */

function clearSearch(){

    const input =

    document.getElementById(

    "searchInput"

    );

    if(!input) return;

    input.value="";

    loadHero();

    loadHome();

}

/* ===================================
   LIVE SEARCH (Optional)
=================================== */

let searchTimer;

document

.getElementById("searchInput")

?.addEventListener(

"input",

()=>{

    clearTimeout(

    searchTimer

    );

    searchTimer=

    setTimeout(()=>{

        const text=

        document

        .getElementById(

        "searchInput"

        )

        .value

        .trim();

        if(

            text.length>=3

        ){

            searchMovie();

        }

    },500);

});


/* ===================================
   DETAIL MOVIE / TV
=================================== */

async function openDetail(id, type = "movie") {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    document.getElementById("app").innerHTML = `

<div class="loading">

Loading Detail...

</div>

`;

    const data = await api(`/${type}/${id}`);

    if (!data) {

        showToast("Failed to load detail");

        loadHome();

        return;

    }

    const title =
        data.title ||
        data.name ||
        "Unknown";

    const poster =
        getImage(
            data.poster_path ||
            data.profile_path
        );

    const backdrop =
        getBackdrop(
            data.backdrop_path
        );

    const rating =
        Number(
            data.vote_average || 0
        ).toFixed(1);

    const release =
        data.release_date ||
        data.first_air_date ||
        "-";

    const runtime =
        data.runtime ||

        data.episode_run_time?.[0] ||

        "-";

    const genres =

        (data.genres || [])

        .map(g => g.name)

        .join(" • ");

    const trailer =

        data.videos?.results?.find(v =>

            v.site === "YouTube" &&

            v.type === "Trailer"

        );

    const cast =

        (data.credits?.cast || [])

        .slice(0, 12)

        .map(c => `

<div
class="cast-card"
onclick="openPersonDetail(${c.id})">

<img
loading="lazy"
src="${getImage(c.profile_path)}"
alt="${c.name}">

<p>${c.name}</p>

</div>

`).join("");

    const recommend =

        (data.recommendations?.results || [])

        .slice(0, 12)

        .map(item =>

            movieCard(item, type)

        )

        .join("");

    document.getElementById("app").innerHTML = `

<div class="detail-page fade">

<div

class="detail-backdrop"

style="background-image:url('${backdrop}')">

</div>

<div class="detail-content">

<div class="detail-poster">

<img

loading="lazy"

src="${poster}"

alt="${title}">

</div>

<div class="detail-info">

<h1>

${title}

</h1>

<div class="detail-meta">

<span>

⭐ ${rating}

</span>

<span>

${release}

</span>

<span>

${runtime} min

</span>

${
genres
?

`<span>

${genres}

</span>`

:

""
}

</div>

<p class="detail-overview">

${data.overview || "No overview available."}

</p>

${
trailer
?

`

<iframe

width="100%"

height="430"

src="https://www.youtube.com/embed/${trailer.key}"

allowfullscreen>

</iframe>

`

:

`

<p class="text-muted">

Trailer not available.

</p>

`

}

<h2>

Cast

</h2>

<div class="cast-row">

${cast}

</div>

<h2 style="margin-top:40px">

Recommendations

</h2>

<div class="row">

${recommend}

</div>

<div class="detail-actions">

<button

class="btn btn-primary"

onclick="loadHero();loadHome();">

← Back Home

</button>

<button

class="btn btn-secondary"

onclick="navigator.share ? navigator.share({title:'${title}',url:location.href}) : showToast('Share not supported');">

Share

</button>

</div>

</div>

</div>

</div>

`;

}


/* ===================================
   PERSON DETAIL
=================================== */

async function openPersonDetail(id){

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

    document.getElementById("app").innerHTML=`

<div class="loading">

Loading Profile...

</div>

`;

    const data = await api(`/person/${id}`);

    if(!data){

        showToast("Failed to load profile");

        return;

    }

    const credits =
    await api(`/person/${id}/combined_credits`);

    const knownFor =

    (credits?.cast || [])

    .sort((a,b)=>

        (b.popularity||0)-

        (a.popularity||0)

    )

    .slice(0,12);

    const profile =
    getImage(data.profile_path);

    const birthday =
    data.birthday || "-";

    const deathday =
    data.deathday || "";

    const place =
    data.place_of_birth || "-";

    const department =
    data.known_for_department || "-";

    const bio =
    data.biography ||

    "Biography not available.";

    document.getElementById("app").innerHTML=`

<div class="detail-page fade">

<div

class="detail-backdrop"

style="background-image:url('${profile}')">

</div>

<div class="detail-content">

<div class="detail-poster">

<img

src="${profile}"

loading="lazy"

alt="${data.name}">

</div>

<div class="detail-info">

<h1>

${data.name}

</h1>

<div class="detail-meta">

<span>

🎭 ${department}

</span>

<span>

🎂 ${birthday}

</span>

${
deathday
?

`<span>

✝ ${deathday}

</span>`

:

""
}

<span>

📍 ${place}

</span>

</div>

<p class="detail-overview">

${bio}

</p>

<h2>

Known For

</h2>

<div class="row">

${knownFor

.map(item=>

movieCard(

item,

item.media_type ||

(item.first_air_date

?"tv"

:"movie")

)

)

.join("")}

</div>

<div class="detail-actions">

<button

class="btn btn-primary"

onclick="loadHero();loadHome()">

← Back Home

</button>

<button

class="btn btn-secondary"

onclick="history.back()">

Back

</button>

</div>

</div>

</div>

</div>

`;

}

/* ==========================================
   PERSON DETAIL
========================================== */

async function openPersonDetail(id){

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

    document.getElementById("app").innerHTML=`

<div class="loading">

Loading Profile...

</div>

`;

    try{

        const person =
        await api("/person/"+id);

        const credits =
        await api("/person/"+id+"/combined_credits");

        if(!person){

            showToast("Profile not found");

            loadHome();

            return;

        }

        const profile =
        getImage(person.profile_path);

        const backdrop =
        profile;

        const birthday =
        person.birthday || "-";

        const deathday =
        person.deathday || "";

        const place =
        person.place_of_birth || "-";

        const department =
        person.known_for_department || "-";

        const popularity =
        Number(
            person.popularity||0
        ).toFixed(1);

        const bio =
        person.biography ||
        "Biography not available.";

        const knownFor =

        (credits?.cast||[])

        .sort((a,b)=>

            (b.popularity||0)-

            (a.popularity||0)

        )

        .slice(0,20)

        .map(item=>

            movieCard(

                item,

                item.media_type ||

                (item.first_air_date

                ?"tv"

                :"movie")

            )

        )

        .join("");

        document.getElementById("app").innerHTML=`

<div class="detail-page fade">

<div

class="detail-backdrop"

style="background-image:url('${backdrop}')">

</div>

<div class="detail-content">

<div class="detail-poster">

<img

src="${profile}"

loading="lazy"

alt="${person.name}"

onerror="this.src='https://placehold.co/500x750?text=No+Image'">

</div>

<div class="detail-info">

<h1>

${person.name}

</h1>

<div class="detail-meta">

<span>

🎭 ${department}

</span>

<span>

⭐ ${popularity}

</span>

<span>

🎂 ${birthday}

</span>

${
deathday
?

`<span>

✝ ${deathday}

</span>`

:

""
}

<span>

📍 ${place}

</span>

</div>

<p class="detail-overview">

${bio}

</p>

<h2>

Known For

</h2>

<div class="row">

${knownFor}

</div>

<div class="detail-actions">

<button

class="btn btn-primary"

onclick="loadHero();loadHome()">

🏠 Home

</button>

<button

class="btn btn-secondary"

onclick="history.back()">

← Back

</button>

</div>

</div>

</div>

</div>

`;

    }

    catch(err){

        console.error(err);

        showToast("Failed to load profile");

    }

}


/* ===================================
   MOBILE MENU
=================================== */

function toggleMenu(){

    const nav =
    document.querySelector(".nav-links");

    if(!nav) return;

    nav.classList.toggle("show");

}

/* ===================================
   HERO SHORTCUT
=================================== */

function heroMoreInfo(){

    if(!heroMovie) return;

    openDetail(

        heroMovie.id,

        "movie"

    );

}

async function playHeroTrailer(){

    if(!heroMovie) return;

    const data =
    await api(

    "/movie/"+

    heroMovie.id+

    "/videos"

    );

    const trailer =

    data?.results?.find(v=>

        v.site==="YouTube" &&

        v.type==="Trailer"

    );

    if(!trailer){

        showToast(

        "Trailer not available"

        );

        return;

    }

    window.open(

    "https://www.youtube.com/watch?v="+

    trailer.key,

    "_blank"

    );

}

/* ===================================
   HISTORY
=================================== */

window.onpopstate=()=>{

    loadHero();

    loadHome();

};

/* ===================================
   SCROLL BUTTON
=================================== */

window.addEventListener(

"scroll",

()=>{

const btn=

document.getElementById(

"scrollTop"

);

if(!btn) return;

btn.style.display=

window.scrollY>400

?

"block"

:

"none";

});

/* ===================================
   ESC SEARCH
=================================== */

document.addEventListener(

"keydown",

e=>{

if(e.key==="Escape"){

const input=

document.getElementById(

"searchInput"

);

if(input){

input.value="";

}

loadHero();

loadHome();

}

});

/* ===================================
   NETWORK
=================================== */

window.addEventListener(

"offline",

()=>{

showToast(

"Offline Mode"

);

});

window.addEventListener(

"online",

()=>{

showToast(

"Back Online"

);

});

/* ===================================
   INIT
=================================== */

window.addEventListener(

"load",

async()=>{

await loadHero();

await loadHome();

});

/* ===================================
   LOGO CLICK
=================================== */

document

.querySelector(".logo")

?.addEventListener(

"click",

()=>{

loadHero();

loadHome();

});

/* ===================================
   AUTO REFRESH HERO
=================================== */

setInterval(()=>{

loadHero();

},1000*60*15);

/* ===================================
   PERFORMANCE
=================================== */

if("requestIdleCallback" in window){

requestIdleCallback(()=>{

console.log(

"ViralScreen Ready"

);

});

}
