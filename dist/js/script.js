const navbar = document.getElementById('navbar');
const wisata = document.getElementById('wisata'); // Ambil elemen wisata utama
const menu = document.querySelector(".menu");
const hamburger = document.querySelector(".hamburger");

// 1. Logika untuk Navbar Transparan ke Solid
if (navbar && wisata) {
  // Tentukan titik pemicu, yaitu setinggi wisata
  const triggerHeight = wisata.offsetHeight - navbar.offsetHeight;

  window.addEventListener('scroll', () => {
  // Jika posisi scroll lebih besar dari tinggi wisata, tambahkan kelas .scrolled
  if (window.scrollY > triggerHeight) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  });
}

// 2. Logika untuk Hamburger Menu
if (hamburger && menu) {
  hamburger.addEventListener('click', () => {
    menu.classList.toggle('menu-active');
    hamburger.classList.toggle('is-active');
            
    // Tambahan: Jika menu mobile dibuka di atas, beri background pada navbar
    if (menu.classList.contains('menu-active')) {
      navbar.classList.add('menu-opened');
    } else {
      navbar.classList.remove('menu-opened');
    }
  });

  // Menutup menu jika link di dalam menu diklik
  menu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && menu.classList.contains('menu-active')) {
      menu.classList.remove('menu-active');
      hamburger.classList.remove('is-active');
      navbar.classList.remove('menu-opened');
    }
  });
}


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBuS5g74JnJFxwA39p56CcsQ6pplL1f_Aw",
  authDomain: "website-padukuhan-ngasem.firebaseapp.com",
  projectId: "website-padukuhan-ngasem",
  storageBucket: "website-padukuhan-ngasem.firebasestorage.app",
  messagingSenderId: "466900285971",
  appId: "1:466900285971:web:4d032e311d285913181de6",
  measurementId: "G-GG6MNRTM82"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// =======================================================
// FUNGSI UNTUK MEMUAT BERITA DARI FIREBASE
// =======================================================
async function loadBerita() {
    const beritaWrapper = document.getElementById('berita-wrapper');
    if (!beritaWrapper) return;

    try {
        const snapshot = await db.collection('berita').orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            beritaWrapper.innerHTML = '<p style="text-align:center; width:100%;">Belum ada berita untuk ditampilkan.</p>';
            return;
        }

        let beritaHTML = '';
        snapshot.forEach(doc => {
            const berita = doc.data();
            // PERUBAHAN UTAMA: Tambahkan tag <a> di sini
            beritaHTML += `
                <a href="berita.html?id=${doc.id}" class="swiper-slide">
                    <img src="${berita.imageUrl}" alt="${berita.judul}" loading="lazy" />
                    <div class="loc">
                        <h3>${berita.judul}</h3>
                        <p><i class="fa-solid fa-location-dot"></i> ${berita.lokasi}</p>
                    </div>
                </a>
            `;
        });
        beritaWrapper.innerHTML = beritaHTML;
        initializeSwiper();
    } catch (error) {
        console.error("Gagal memuat berita:", error);
        beritaWrapper.innerHTML = '<p style="text-align:center; width:100%;">Gagal memuat berita.</p>';
    }
}

// =======================================================
// FUNGSI UNTUK MEMUAT GALERI DARI FIREBASE
// =======================================================
async function loadGaleri() {
  const galleryContainer = document.getElementById('gallery-container');
  if (!galleryContainer) return; // Hentikan jika elemen tidak ditemukan

  const galeriCollection = await db.collection('galeri').get();

  let galeriHTML = '';
  galeriCollection.forEach(doc => {
    const galeri = doc.data();
    galeriHTML += `
      <a href="${galeri.imageUrl}" target="_blank" data-aos="fade-in" data-aos-delay="400">
        <img src="${galeri.imageUrl}" alt="Galeri Ngasem" />
      </a>
    `;
  });

  galleryContainer.innerHTML = galeriHTML;

  // Inisialisasi ulang AOS jika diperlukan setelah konten dinamis ditambahkan
  AOS.refresh();
}

// =======================================================
// PINDAHKAN INISIALISASI SWIPER KE FUNGSI SENDIRI
// =======================================================
function initializeSwiper() {
  var swiper = new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      type: "fraction",
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      992: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
      1280: {
        slidesPerView: 4,
        spaceBetween: 20,
      },
    },
  });
}

// =======================================================
// JALANKAN FUNGSI KETIKA HALAMAN SELESAI DIMUAT
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
  loadBerita();
  loadGaleri();
});
