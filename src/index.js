import '../node_modules/modern-normalize/modern-normalize.css';

import { GalleryController } from "./js/proprietary";

const refs = {
  searchQuery: document.querySelector('input[name="searchQuery"]'),
  submitBtn: document.querySelector('button[type="submit"]'),
  gallery: document.querySelector('div.gallery'),
  searchForm: document.querySelector('#search-form'),
};

const galleryController = new GalleryController(refs);