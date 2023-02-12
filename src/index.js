import '../node_modules/modern-normalize/modern-normalize.css';
import '../node_modules/notiflix/dist/notiflix-3.2.6.min.css';
import '../node_modules/simplelightbox/dist/simple-lightbox.min.css';

import SimpleLightbox from 'simplelightbox';
import { GalleryController } from "./js/proprietary";

const refs = {
  searchQuery: document.querySelector('input[name="searchQuery"]'),
  submitBtn: document.querySelector('button[type="submit"]'),
  gallery: document.querySelector('div.gallery'),
  searchForm: document.querySelector('#search-form'),
};

const galleryController = new GalleryController(refs);

const slbInstance = new SimpleLightbox(document.querySelector('div.gallery'));
