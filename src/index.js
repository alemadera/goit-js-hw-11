import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("search-form");
    const gallery = document.querySelector(".gallery");
    let page = 1;
    let currentQuery = '';
    let totalHits = 0;
    let lightbox;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const searchQuery = form.searchQuery.value.trim();
        if (searchQuery === '') return;

        page = 1;
        currentQuery = searchQuery;
        gallery.innerHTML = ''; // Limpiar el contenido de la galería al buscar una nueva palabra clave
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll al inicio de la página

        await searchImages(searchQuery);
    });

    async function searchImages(searchQuery) {
        try {
            const response = await fetch(`https://pixabay.com/api/?key=42609932-4bff4bd098f55c20bce283dff&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`);
            const data = await response.json();
            const { hits, total } = data;

            totalHits = total;

            if (hits.length === 0) {
                Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
                return;
            }

            hits.forEach(hit => {
                const card = createPhotoCard(hit);
                gallery.appendChild(card);
            });

            if (!lightbox) {
                lightbox = new SimpleLightbox('.gallery a');
            } else {
                lightbox.refresh();
            }

        } catch (error) {
            console.error("Error fetching images:", error);
            Notiflix.Notify.failure("Error fetching images. Please try again later.");
        }
    }

    function createPhotoCard(photo) {
        const card = document.createElement("div");
        card.classList.add("photo-card");

        const link = document.createElement("a");
        link.href = photo.largeImageURL;

        const img = document.createElement("img");
        img.src = photo.webformatURL;
        img.alt = photo.tags;
        img.loading = "lazy";

        link.appendChild(img);
        card.appendChild(link);

        // Añadir información extra como Likes, Views, Comments, Downloads si está disponible
        const infoDiv = document.createElement("div");
        infoDiv.classList.add("info");

        const likes = document.createElement("p");
        likes.classList.add("info-item");
        likes.innerHTML = `<b>Likes</b> ${photo.likes}`;
        infoDiv.appendChild(likes);

        const views = document.createElement("p");
        views.classList.add("info-item");
        views.innerHTML = `<b>Views</b> ${photo.views}`;
        infoDiv.appendChild(views);

        const comments = document.createElement("p");
        comments.classList.add("info-item");
        comments.innerHTML = `<b>Comments</b> ${photo.comments}`;
        infoDiv.appendChild(comments);

        const downloads = document.createElement("p");
        downloads.classList.add("info-item");
        downloads.innerHTML = `<b>Downloads</b> ${photo.downloads}`;
        infoDiv.appendChild(downloads);

        card.appendChild(infoDiv);

        return card;
    }

    window.addEventListener('scroll', async () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            page++;
            await searchImages(currentQuery);
        }
    });
});
