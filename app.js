const leftBtn = document.querySelector(".popular__arrow--left");
const rightBtn = document.querySelector(".popular__arrow--right");
const cardsContainer = document.querySelector(".popular__cards");

const searchInput = document.getElementById("search_input");
const searchResults = document.querySelector(".search__results");

const burgerIcon = document.getElementById("burger-icon");
const userAvatar = document.querySelector(".nav__user");
const navMenu = document.querySelector(".nav__menu");

const headerVideo = document.querySelector(".header__video");

const json_url = "movie.json";

fetch(json_url)
  .then((res) => res.json())
  .then((data) => {

    
    const renderCards = (items) => {
      cardsContainer.innerHTML = "";
      items.forEach((movie) => {
        const { name, imdb, date, sposter, bposter, genre, description, url } =
          movie;

        const card = document.createElement("a");
        card.href = url;
        card.classList.add("popular-card");

        card.innerHTML = `
          <img src="${sposter}" alt="${name}" class="popular-card__poster">
          <div class="popular-card__overlay">
            <img src="${bposter}" alt="" class="popular-card__bg">
            <div class="popular-card__info">
              <h4>${name}</h4>
              <div class="popular-card__meta">
                <p>${genre}, ${date}</p>
                <div><span>IMDb</span> <i class="bi bi-star-fill"></i> ${imdb}</div>
              </div>
              <p class="popular-card__desc">${description}</p>
            </div>
          </div>
        `;
        cardsContainer.appendChild(card);
      });
    };

    renderCards(data);

    const popularRow = document.getElementById("popular-row");
    const top10Row = document.getElementById("top10-row");
    const comingSoonGrid = document.getElementById("coming-soon-grid");

    // Функция для рендера рядов
    const renderRow = (container, movies) => {
      container.innerHTML = "";
      movies.forEach((movie) => {
        const card = document.createElement("a");
        card.href = movie.url;
        card.className = "popular-card";
        card.innerHTML = `
      <img src="${movie.sposter}" class="popular-card__poster" alt="${movie.name}">
      <div class="popular-card__overlay">
        <img src="${movie.bposter}" class="popular-card__bg">
        <div class="popular-card__info">
          <h4>${movie.name}</h4>
          <p class="popular-card__desc">${movie.description}</p>
          <div class="popular-card__meta">
            <span>${movie.genre}, ${movie.date}</span>
            <span>IMDb ${movie.imdb}</span>
          </div>
        </div>
      </div>
    `;
        container.appendChild(card);
      });
    };

    const upcoming = data.filter((m) => m.upcoming);
    upcoming.forEach((movie) => {
      const div = document.createElement("div");
      div.className = "coming-soon__item";
      div.innerHTML = `
    <img src="${movie.bposter}" alt="${movie.name}">
    <div class="coming-soon__overlay">
      <div class="coming-soon__date">${movie.releaseDate || "Скоро"}</div>
      <h3 class="coming-soon__item-title">${movie.name}</h3>
      <p class="coming-soon__item-desc">${movie.description}</p>
    </div>
  `;
      comingSoonGrid.appendChild(div);
    });

    renderRow(popularRow, data.slice(0, 15));
    renderRow(top10Row, data.sort((a, b) => b.imdb - a.imdb).slice(0, 10));

    const header = document.querySelector(".header");
    const hasCustomBg = Array.from(header.classList).some((cls) =>
      cls.startsWith("header--")
    );

    if (!hasCustomBg && data.length > 0) {
      const main = data[0];
      document.getElementById("title").textContent = main.name;
      document.getElementById("gen").textContent = main.genre;
      document.getElementById("date").textContent = main.date;
      document.getElementById(
        "rate"
      ).innerHTML = `<span>IMDb</span> <i class="bi bi-star-fill"></i> ${main.imdb}`;
      header.className = `header header--${main.bg || "money-heist"}`;
    }

    if (headerVideo && data.length > 0) {
      const defaultMovie = data[0];
      const defaultTrailer = defaultMovie.trailer;

      const updateHero = (movie) => {
        document.getElementById("title").textContent = movie.name;
        document.getElementById("gen").textContent = movie.genre;
        document.getElementById("date").textContent = movie.date;
        document.getElementById(
          "rate"
        ).innerHTML = `<span>IMDb</span> <i class="bi bi-star-fill"></i> ${movie.imdb}`;
        document.querySelector(".hero__desc").textContent = movie.description;
        document.querySelector(".hero__watch").href = movie.url;

        header.className = `header header--${movie.bg || "money-heist"}`;

        if (headerVideo.src !== movie.trailer) {
          headerVideo.classList.add("header__video--fading");
          setTimeout(() => {
            headerVideo.src = movie.trailer;
            headerVideo.play().catch(() => {});
            headerVideo.classList.remove("header__video--fading");
          }, 400);
        }
      };

      updateHero(defaultMovie);
      if (defaultTrailer) {
        headerVideo.src = defaultTrailer;
        headerVideo.play().catch(() => {});
      }

      document.querySelectorAll(".popular-card").forEach((card) => {
        const cardTitle = card.querySelector("h4")?.textContent.trim();
        const movieData = data.find((m) => m.name === cardTitle);

        if (!movieData?.trailer && !movieData?.bg) return;

        card.addEventListener("mouseenter", () => {
          updateHero(movieData);
        });

        card.addEventListener("mouseleave", () => {
          updateHero(defaultMovie);
        });
      });

      document.querySelector(".popular").addEventListener("mouseleave", () => {
        updateHero(defaultMovie);
      });
    }

    const createSearchCard = (movie) => {
      const { name, imdb, date, sposter, genre, url } = movie;
      const card = document.createElement("a");
      card.href = url;
      card.classList.add("search-card");
      card.innerHTML = `
        <img src="${sposter}" alt="${name}">
        <div class="search-card__info">
          <h3 class="search-card__title">${name}</h3>
          <p>${genre}, ${date} <span>IMDb</span> <i class="bi bi-star-fill"></i> ${imdb}</p>
        </div>
      `;
      return card;
    };

    data.forEach((movie) => searchResults.appendChild(createSearchCard(movie)));

    searchInput.addEventListener("keyup", () => {
      const filter = searchInput.value.trim().toLowerCase();
      const cards = searchResults.querySelectorAll(".search-card");
      let hasVisible = false;

      cards.forEach((card) => {
        const title = card
          .querySelector(".search-card__title")
          .textContent.toLowerCase();
        const info = card.querySelector("p").textContent.toLowerCase();

        if (title.includes(filter) || info.includes(filter)) {
          card.style.display = "flex";
          hasVisible = true;
        } else {
          card.style.display = "none";
        }
      });

      searchResults.classList.toggle(
        "search__results--visible",
        hasVisible && filter !== ""
      );
    });

    document.querySelectorAll("[data-filter]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const filter = link.getAttribute("data-filter");
        let filtered = data;

        if (filter === "series")
          filtered = data.filter((m) => m.type === "series");
        else if (filter === "movies")
          filtered = data.filter((m) => m.type === "movie");
        else if (filter === "premier")
          filtered = data.filter((m) => m.type === "premier");
        else if (filter === "kids")
          filtered = data.filter((m) => m.type === "kids");

        renderCards(filtered);
      });
    });
  })
  .catch((err) => console.error("Ошибка загрузки movie.json:", err));

leftBtn?.addEventListener("click", () => {
  cardsContainer.scrollBy({ left: -300, behavior: "smooth" });
});
rightBtn?.addEventListener("click", () => {
  cardsContainer.scrollBy({ left: 300, behavior: "smooth" });
});

function toggleMenu() {
  const isActive = navMenu.classList.toggle("nav__menu--active");

  if (burgerIcon && getComputedStyle(burgerIcon).display !== "none") {
    burgerIcon.classList.toggle("bi-list", !isActive);
    burgerIcon.classList.toggle("bi-x", isActive);
  }

  if (userAvatar && window.innerWidth <= 480) {
    userAvatar.classList.toggle("nav__user--menu-active", isActive);
  }
}

burgerIcon?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
});

userAvatar?.addEventListener("click", (e) => {
  if (window.innerWidth <= 480) {
    e.stopPropagation();
    toggleMenu();
  }
});

document.querySelectorAll(".nav__menu-link").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("nav__menu--active");
    if (burgerIcon) {
      burgerIcon.classList.add("bi-list");
      burgerIcon.classList.remove("bi-x");
    }
    if (userAvatar && window.innerWidth <= 480) {
      userAvatar.classList.remove("nav__user--menu-active");
    }
  });
});

document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".nav__menu") &&
    !e.target.closest(".burger") &&
    !e.target.closest(".nav__user")
  ) {
    navMenu.classList.remove("nav__menu--active");
    if (burgerIcon) {
      burgerIcon.classList.add("bi-list");
      burgerIcon.classList.remove("bi-x");
    }
    if (userAvatar && window.innerWidth <= 480) {
      userAvatar.classList.remove("nav__user--menu-active");
    }
  }
});
