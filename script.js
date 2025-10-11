// script.js — надійний варіант, чекає DOMContentLoaded, створює чекбокс при відсутності та валідує елементи
document.addEventListener('DOMContentLoaded', () => {
  let allPhotos = [];

  const gallery = document.getElementById('gallery');
  const filterInput = document.getElementById('filterInput');
  const themeToggle = document.getElementById('themeToggle');
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  const closeModalBtn = document.getElementById('closeModal');

  // Якщо чекбокс FON відсутній — створимо його динамічно (щоб не падало)
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
    // вставляємо поруч з полем фільтра, або в хедер якщо поля немає
    if (filterInput && filterInput.parentNode) {
      filterInput.parentNode.insertBefore(filterGroup, filterInput.nextSibling);
    } else {
      const header = document.querySelector('.header') || document.body;
      header.appendChild(filterGroup);
    }
    fonFilter = document.getElementById('fonFilter');
  }

  // Загрузка фото
  async function loadPhotos() {
    try {
      const res = await fetch('./data/photos.json');
      if (!res.ok) throw new Error('Ошибка загрузки JSON: ' + res.status);
      allPhotos = await res.json();
      // нормалізуємо поле hasBackground: якщо його немає — вважаємо true (щоб не ховати нечекнуті)
      allPhotos = allPhotos.map(p => ({ ...p, hasBackground: p.hasBackground !== undefined ? !!p.hasBackground : true }));
      renderGallery(allPhotos);
    } catch (err) {
      console.error(err);
      alert('Не удалось загрузить фотографии 😢');
    }
  }

  // Відрисовка галереї
  function renderGallery(photos) {
    if (!gallery) return;
    gallery.innerHTML = '';

    photos.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'card';

      const title = document.createElement('div');
      title.className = 'card-title';
      title.textContent = photo.title || 'Untitled';

      const img = document.createElement('img');
      img.src = photo.file;
      img.alt = photo.title || '';
      img.addEventListener('click', () => openModal(photo.file));

      const author = document.createElement('div');
      author.className = 'card-author';
      author.textContent = `By ${photo.author || 'Unknown'}`;

      const buttons = document.createElement('div');
      buttons.className = 'buttons';
      const download = document.createElement('a');
      download.className = 'download-btn';
      download.href = photo.file;
      download.setAttribute('download', '');
      download.textContent = '⬇️ Скачать';
      buttons.appendChild(download);

      card.appendChild(title);
      card.appendChild(img);
      card.appendChild(author);
      card.appendChild(buttons);

      gallery.appendChild(card);
    });
  }

  // Модал
  function openModal(imgSrc) {
    if (!modal || !modalImg) return;
    modal.style.display = 'block';
    modalImg.src = imgSrc;
  }
  window.openModal = openModal; // на випадок, якщо хтось викличе global

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal && modal) modal.style.display = 'none';
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal) modal.style.display = 'none';
  });

  // Фільтрація
  function applyFilters() {
    const query = filterInput ? filterInput.value.toLowerCase() : '';
    const showWithFon = fonFilter ? fonFilter.checked : false;

    let filtered = allPhotos.filter(photo =>
      String(photo.title || '').toLowerCase().includes(query)
    );

    if (showWithFon) {
      filtered = filtered.filter(photo => photo.hasBackground === true);
    }

    renderGallery(filtered);
  }

  if (filterInput) filterInput.addEventListener('input', applyFilters);
  if (fonFilter) fonFilter.addEventListener('change', applyFilters);

  // Тема
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
    });
  }

  // Ініціалізація
  loadPhotos();
});
