import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import './css/styles.css';
import PixabyApiService from './js/gallery-api-service';
import LoadMoreBtn from './js/components/load-more-btn';

const refs = {
  searchForm: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
};

const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});

const lightbox = new SimpleLightbox('.gallery a');
const pixabyApiService = new PixabyApiService();

refs.searchForm.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', getImages);

function onSearch(e) {
  e.preventDefault();

  pixabyApiService.query = e.currentTarget.elements.searchQuery.value.trim();

  if (pixabyApiService.query === '') {
    Notiflix.Notify.info('No query in the form. Please, enter your request');
    return;
  }
  if (!loadMoreBtn.refs.button.hidden) {
    loadMoreBtn.hide();
  }
  pixabyApiService.resetPage();
  clearGalleryContainer();
  getImages();
}

// ----------------------- Через then ---------------------
// function getImages() {
//   loadMoreBtn.disable();

//   pixabyApiService.fetchImages().then(({ hits, totalHits }) => {
//     if (hits.length > 0) {
//       loadMoreBtn.show();
//       appendImagesMarkup({ hits, totalHits });
//       loadMoreBtn.enable();
//       if (pixabyApiService.imageQty >= totalHits) {
//         Notiflix.Notify.info(
//           "We're sorry, but you've reached the end of search results."
//         );
//         loadMoreBtn.hide();
//       }
//     } else {
//       loadMoreBtn.hide();
//       Notiflix.Notify.failure(
//         'Sorry, there are no images matching your search query. Please try again.'
//       );

//       return;
//     }
//   });
// }

// ----------------------- Через async/await ---------------------
async function getImages() {
  loadMoreBtn.disable();
  const images = await pixabyApiService.fetchImages();
  try {
    const hits = images.hits;
    const totalHits = images.totalHits;

    if (hits.length > 0) {
      loadMoreBtn.show();
      appendImagesMarkup(hits);
      loadMoreBtn.enable();

      if (pixabyApiService.imageQty >= totalHits) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        loadMoreBtn.hide();
      }
    } else {
      loadMoreBtn.hide();
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      return;
    }
  } catch (error) {
    console.log(error.message);
  }
}

function appendImagesMarkup(hits) {
  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
  <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" width=320 height=240/></a>
  <div class="info">
  <p class="info-item">Likes: 
    <b>${likes}</b>
  </p>
    <p class="info-item">Views: 
      <b>${views}</b>
    </p>
    <p class="info-item">Comments: 
      <b>${comments}</b>
    </p>
    <p class="info-item">Downloads:
      <b>${downloads}</b> 
    </p>
  </div>
</div>`;
      }
    )
    .join('');

  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

function clearGalleryContainer() {
  refs.galleryContainer.innerHTML = '';
}
