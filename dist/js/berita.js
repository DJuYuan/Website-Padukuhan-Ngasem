// File: dist/js/detail-berita.js (Dengan Optimasi Gambar)

document.addEventListener('DOMContentLoaded', () => {

    // Konfigurasi Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyBuS5g74JnJFxwA39p56CcsQ6pplL1f_Aw",
        authDomain: "website-padukuhan-ngasem.firebaseapp.com",
        projectId: "website-padukuhan-ngasem",
        storageBucket: "website-padukuhan-ngasem.appspot.com",
        messagingSenderId: "466900285971",
        appId: "1:466900285971:web:4d032e311d285913181de6"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Elemen DOM & Logika UI
    const loader = document.querySelector(".loader");
    const menu = document.querySelector(".menu");
    const hamburger = document.querySelector(".hamburger");

    if (hamburger && menu) {
        hamburger.addEventListener('click', () => {
            menu.classList.toggle('menu-active');
            hamburger.classList.toggle('is-active');
        });
    }
    
    // =======================================================
    // FUNGSI BARU UNTUK OPTIMASI GAMBAR
    // =======================================================
    function getOptimizedImageUrl(originalUrl, width = 1200) {
        if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
            return originalUrl;
        }
        const transformations = `w_${width},q_auto,f_auto,c_fill`;
        return originalUrl.replace('/upload/', `/upload/${transformations}/`);
    }

    async function loadDetailBerita() {
        const detailContainer = document.getElementById('berita-detail-container');
        if (!detailContainer) {
            if(loader) loader.classList.add("loader-hidden");
            return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const beritaId = urlParams.get('id');

        if (!beritaId) {
            detailContainer.innerHTML = '<p>Berita tidak ditemukan (ID tidak valid).</p>';
            if(loader) loader.classList.add("loader-hidden");
            return;
        }

        try {
            const docRef = db.collection('berita').doc(beritaId);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                const berita = docSnap.data();
                const timestamp = berita.timestamp.toDate();
                const formattedDate = timestamp.toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });

                document.title = `${berita.judul} - Padukuhan Ngasem`;
                
                // --- PERUBAHAN DI SINI: Gunakan fungsi optimasi untuk gambar detail ---
                const optimizedImageUrl = getOptimizedImageUrl(berita.imageUrl, 1200); // Minta gambar lebih besar (1200px) tapi tetap optimal

                const deskripsiHTML = berita.deskripsi 
                    ? `<p>${berita.deskripsi.replace(/\n/g, '</p><p>')}</p>` 
                    : '';

                const beritaHTML = `
                    <div class="berita-detail-header">
                         <div class="berita-meta">
                            <span class="lokasi">
                                <i class="fa-solid fa-location-dot"></i>
                                ${berita.lokasi}
                            </span>
                            <span class="tanggal">
                                <i class="fa-solid fa-calendar-days"></i>
                                ${formattedDate}
                            </span>
                        </div>
                        <h1>${berita.judul}</h1>
                    </div>
                    <div class="berita-image-container">
                        <img src="${optimizedImageUrl}" alt="${berita.judul}" />
                    </div>
                    <div class="berita-body">
                        <p>${deskripsiHTML}</p>
                    </div>
                `;
                detailContainer.innerHTML = beritaHTML;
            } else {
                document.title = 'Berita Tidak Ditemukan - Padukuhan Ngasem';
                detailContainer.innerHTML = '<p>Maaf, berita yang Anda cari tidak ditemukan.</p>';
            }
        } catch (error) {
            console.error("Gagal memuat detail berita:", error);
            detailContainer.innerHTML = '<p>Terjadi kesalahan saat memuat berita.</p>';
        } finally {
            if(loader) {
                setTimeout(() => {
                    loader.classList.add("loader-hidden");
                }, 300);
            }
        }
    }

    loadDetailBerita();
});