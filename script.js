// script.js — расширенный: поддержка фото и видео
document.addEventListener('DOMContentLoaded', () => {
  let allPhotos = [];

  const gallery = document.getElementById('gallery');
  const filterInput = document.getElementById('filterInput');
  const themeToggle = document.getElementById('themeToggle');
  const modal = document.getElementById('modal');
  const closeModalBtn = document.getElementById('closeModal');

  // Если чекбокс FON отсутствует — создаем его динамически
  let fonFilter = document.getElementById('fonFilter');
  if (!fonFilter) {
    const filterGroup = document.createElement('div');
    filterGroup.className = 'filter-group';
    filterGroup.innerHTML = `
      <label class="checkbox-container">
        <input type="checkbox" id="fonFilter" />
        <span class="checkmark"></span>
        <span class="label-text">FON</span>
      </label>
    `;
    if (filterInput && filterInput.parentNode) {
      filterInput.parentNode.insertBefore(filterGroup, filterInput.nextSibling);
    } else {
      const header = document.querySelector('.header') || document.body;
      header.appendChild(filterGroup);
    }
    fonFilter = document.getElementById('fonFilter');
  }

  // Загрузка фото и видео
  async function loadPhotos() {
    try {
      const res = await fetch('./data/photos.json');
      if (!res.ok) throw new Error('Ошибка загрузки JSON: ' + res.status);
      allPhotos = await res.json();

      // нормализуем поле hasBackground
      allPhotos = allPhotos.map(p => ({
        ...p,
        hasBackground: p.hasBackground !== undefined ? !!p.hasBackground : true
      }));

      renderGallery(allPhotos);
    } catch (err) {
      console.error(err);
      alert('Не удалось загрузить фотографии 😢');
    }
  }

  // --- Отрисовка галереи (поддерживает фото и видео) ---
  function renderGallery(photos) {
    if (!gallery) return;
    gallery.innerHTML = '';

    photos.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'card';

      const title = document.createElement('div');
      title.className = 'card-title';
      title.textContent = photo.title || 'Untitled';

      const ext = photo.file.split('.').pop().toLowerCase();
      let mediaElement;

      if (['mp4', 'webm', 'ogg'].includes(ext)) {
        // 🎥 Видео
        mediaElement = document.createElement('video');
        mediaElement.src = photo.file;
        mediaElement.controls = true;
        mediaElement.preload = 'metadata';
        mediaElement.className = 'video-thumb';
        mediaElement.addEventListener('click', () => openModal(photo.file, 'video'));
      } else {
        // 🖼 Фото
        mediaElement = document.createElement('img');
        mediaElement.src = photo.file;
        mediaElement.alt = photo.title || '';
        mediaElement.addEventListener('click', () => openModal(photo.file, 'image'));

        // определяем ориентацию фото
        mediaElement.addEventListener('load', () => {
          const aspectRatio = mediaElement.naturalWidth / mediaElement.naturalHeight;
          if (aspectRatio > 1.3) {
            card.classList.add('horizontal');
          } else {
            card.classList.add('vertical');
          }
        });
      }

      const author = document.createElement('div');
      author.className = 'card-author';
      author.textContent = `By ${photo.author || 'Unknown'}`;

      const buttons = document.createElement('div');
      buttons.className = 'buttons';
      const download = document.createElement('a');
      download.className = 'download-btn';
      download.href = photo.file;
      download.setAttribute('download', '');
      download.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="17"></line>
          <polyline points="5 12 12 19 19 12"></polyline>
        </svg>
      `;
      buttons.appendChild(download);

      card.appendChild(title);
      card.appendChild(mediaElement);
      card.appendChild(author);
      card.appendChild(buttons);

      gallery.appendChild(card);
    });
  }

  // --- Модальное окно для фото и видео ---
  function openModal(file, type = 'image') {
    if (!modal) return;
    modal.style.display = 'block';
    modal.innerHTML = '<span id="closeModal" class="close">&times;</span>';

    if (type === 'video') {
      const vid = document.createElement('video');
      vid.src = file;
      vid.controls = true;
      vid.autoplay = true;
      vid.className = 'modal-content';
      modal.appendChild(vid);
    } else {
      const img = document.createElement('img');
      img.src = file;
      img.className = 'modal-content';
      modal.appendChild(img);
    }

    const closeBtn = modal.querySelector('#closeModal');
    closeBtn.addEventListener('click', () => (modal.style.display = 'none'));
  }
  window.openModal = openModal;

  // --- Закрытие модалки по клику и Escape ---
  window.addEventListener('click', (e) => {
    if (e.target === modal && modal) modal.style.display = 'none';
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal) modal.style.display = 'none';
  });

  // --- Фильтрация (по названию и автору, плюс FON) ---
  function applyFilters() {
    const query = filterInput ? filterInput.value.toLowerCase().trim() : '';
    const showWithFon = fonFilter ? fonFilter.checked : false;

    let filtered = allPhotos.filter(photo => {
      const title = String(photo.title || '').toLowerCase();
      const author = String(photo.author || '').toLowerCase();
      return title.includes(query) || author.includes(query);
    });

    if (showWithFon) {
      filtered = filtered.filter(photo => photo.hasBackground === true);
    }

    renderGallery(filtered);
  }

  if (filterInput) filterInput.addEventListener('input', applyFilters);
  if (fonFilter) fonFilter.addEventListener('change', applyFilters);

  // --- Переключение темы ---
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
    });
  }

  // --- Инициализация ---
  loadPhotos();
});
