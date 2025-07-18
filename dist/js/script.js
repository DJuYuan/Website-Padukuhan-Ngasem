document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1: INISIALISASI & KONFIGURASI ---

    // GANTI DENGAN KONFIGURASI FIREBASE ANDA YANG BENAR
    const firebaseConfig = {
        apiKey: "AIzaSyBuS5g74JnJFxwA39p56CcsQ6pplL1f_Aw",
        authDomain: "website-padukuhan-ngasem.firebaseapp.com",
        projectId: "website-padukuhan-ngasem",
        storageBucket: "website-padukuhan-ngasem.firebasestorage.app",
        messagingSenderId: "466900285971",
        appId: "1:466900285971:web:4d032e311d285913181de6",
        measurementId: "G-GG6MNRTM82"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // --- BAGIAN 2: LOGIKA UI (NAVBAR, HAMBURGER, SCROLLSPY) ---

    const navbar = document.querySelector('.navbar');
    const menu = document.querySelector(".menu");
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelectorAll('.menu a');
    const sections = document.querySelectorAll('section[id]');

    // Logika untuk Navbar menjadi solid saat di-scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 2150) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // --- LOGIKA BARU UNTUK MENU AKTIF (SCROLLSPY) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Hapus kelas 'active' dari semua link
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Dapatkan ID dari seksi yang sedang terlihat
                const id = entry.target.getAttribute('id');
                // Cari link yang href-nya cocok dengan ID seksi
                const activeLink = document.querySelector(`.menu a[href="#${id}"]`);
                
                // Tambahkan kelas 'active' ke link yang cocok
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        // Memicu saat 50% dari seksi terlihat di tengah layar
        rootMargin: '-50% 0px -50% 0px'
    });

    // "Awasi" setiap seksi yang memiliki ID
    sections.forEach(section => {
        observer.observe(section);
    });
    // --- AKHIR LOGIKA SCROLLSPY ---


    // Logika untuk Hamburger Menu
    if (hamburger && menu) {
        hamburger.addEventListener('click', () => {
            menu.classList.toggle('menu-active');
            hamburger.classList.toggle('is-active');
            if (menu.classList.contains('menu-active')) {
                navbar.classList.add('menu-opened');
            } else {
                navbar.classList.remove('menu-opened');
            }
        });

        menu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && menu.classList.contains('menu-active')) {
                menu.classList.remove('menu-active');
                hamburger.classList.remove('is-active');
                navbar.classList.remove('menu-opened');
            }
        });
    }

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
  loadBerita();
  loadGaleri();
});
