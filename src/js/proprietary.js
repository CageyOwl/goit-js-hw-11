export { GalleryController };

import axios from 'axios';
import Notiflix from 'notiflix';
import throttle from 'lodash.throttle';
import simpleLightbox from 'simplelightbox';

// The singleton class, therefore static members are optional
class GalleryController {
  #userKey; // It has a setter
  #currentRequest = 'Good request';

  #currentPage = 1;
  #maxPage = 0;
  #perPage = 20; // It has a setter

  #requestNode;
  #submitNode;
  #galleryNode;
  #formNode;

  #slbInstance;

  constructor(nodesStruct, userKey = '33496732-1283670651f4c7d1c9074e6ca') {
    if (!GalleryController._instance) {
      GalleryController._instance = this;
    } else {
      return;
    }

    this.#userKey = userKey;
    this.#unpackData(nodesStruct);
    this.#attachEvents();

    return GalleryController._instance;
  }

  #unpackData(nodesStruct) {
    ({
      searchQuery: this.#requestNode,
      submitBtn: this.#submitNode,
      gallery: this.#galleryNode,
      searchForm: this.#formNode,
    } = nodesStruct);
    this.#slbInstance = new simpleLightbox(
      `.${this.#galleryNode.classList[0]} a`
    );
  }

  #attachEvents() {
    this.#galleryNode.addEventListener('click', event => {
      event.preventDefault();
    });

    this.#submitNode.addEventListener('click', event => {
      event.preventDefault();
      this.#initGallery(this.#requestNode, this.#galleryNode, this.#userKey);
    });

    window.addEventListener(
      'scroll',
      throttle(() => {
        this.#continueGallery(this.#galleryNode, this.#userKey);
      }, 300)
    );
  }

  async #initGallery(requestNode, galleryNode, userKey) {
    const value = requestNode.value.trim();

    if (!value) {
      Notiflix.Notify.info(
        'No query has been entered. Please, tell us what you want to see.'
      );
      return;
    }
    if (value === this.#currentRequest) {
      Notiflix.Notify.info(
        'The current request is identical to the previous one.'
      );
      return;
    }

    this.#currentPage = 1;
    this.#currentRequest = value;
    const data = await this.#fetchImgsData(value, userKey);

    if (!data.total) {
      this.#galleryNode.innerHTML = '';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    Notiflix.Notify.success(`Hooray! We found ${data.total} images.`);
    this.#maxPage = Math.ceil(data.totalHits / this.#perPage);
    galleryNode.innerHTML = this.#renderGalleryPage(data.hits);
    this.#slbInstance.refresh();

    setTimeout(() => {
      window.scroll({
        top: this.#calcScrollY({ form: this.#formNode }),
        behavior: 'smooth',
      });
    }, 500);
    return;
  }

  async #fetchImgsData(userRequest, userKey, pageNum = 1) {
    try {
      const response = await axios.get(
        `https://pixabay.com/api/?key=${userKey}&q=${userRequest}&image_type=photo&orientation=horizontal&safesearch=true&page=${pageNum}&per_page=${
          this.#perPage
        }`
      );
      return response.data;
    } catch (error) {
      console.log(error.message);
    }
  }

  #renderGalleryPage(dataArr) {
    return dataArr.reduce((output, data) => {
      return (output += `
        <a class="lightbox-link" href="${data.largeImageURL}">

        <div class="photo-card">
          <img src="${data.webformatURL}" alt="${data.tags}" loading="lazy" />
          <div class="info">
            <p class="info-item">
              <b>Likes</b>${data.likes}
            </p>
            <p class="info-item">
              <b>Views</b>${data.views}
            </p>
            <p class="info-item">
              <b>Comments</b>${data.comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>${data.downloads}
            </p>
          </div>
        </div>

        </a>
      `);
    }, '');
  }

  #calcScrollY(geomNodesStruct) {
    let totalHeight = 0;
    for (let node in geomNodesStruct) {
      totalHeight += geomNodesStruct[node].getBoundingClientRect().height;
    }
    return totalHeight;
  }

  async #continueGallery(galleryNode, userKey) {
    if (window.innerHeight + window.scrollY < document.body.offsetHeight - 1) {
      return;
    }
    if (this.#currentPage === this.#maxPage) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }

    ++this.#currentPage;
    const data = await this.#fetchImgsData(
      this.#currentRequest,
      this.#userKey,
      this.#currentPage
    );
    this.#galleryNode.insertAdjacentHTML(
      'beforeend',
      this.#renderGalleryPage(data.hits)
    );
    this.#slbInstance.refresh();
  }

  set userKey(value) {
    this.#userKey = value;
  }
  set perPage(value) {
    this.#perPage = value;
  }
}
