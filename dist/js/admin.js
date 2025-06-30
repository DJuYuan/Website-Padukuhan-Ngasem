// Menunggu seluruh konten HTML dimuat sebelum menjalankan JavaScript
document.addEventListener('DOMContentLoaded', () => {

    // --- KONFIGURASI FIREBASE ---
    // CATATAN PENTING: Meskipun API key Anda terekspos di sisi klien,
    // pastikan Anda telah mengatur Firestore Security Rules dengan benar di console Firebase
    // untuk melindungi data Anda dari akses yang tidak sah.
    const firebaseConfig = {
        apiKey: "AIzaSyBuS5g74JnJFxwA39p56CcsQ6pplL1f_Aw",
        authDomain: "website-padukuhan-ngasem.firebaseapp.com",
        projectId: "website-padukuhan-ngasem",
        storageBucket: "website-padukuhan-ngasem.appspot.com", // Koreksi umum: .appspot.com
        messagingSenderId: "466900285971",
        appId: "1:466900285971:web:4d032e311d285913181de6",
        measurementId: "G-GG6MNRTM82"
    };

    // --- Inisialisasi Firebase ---
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();

    // --- REFERENSI ELEMEN HTML ---
    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const navTabs = document.querySelector('.nav-tabs');

    // --- KONFIGURASI CLOUDINARY ---
    const CLOUD_NAME = 'dcjsrbhlx';
    const UPLOAD_PRESET = 'web_upload';

    // =================================================================
    // --- FUNGSI UTAMA & HELPER ---
    // =================================================================

    /**
     * Mengatur halaman mana yang aktif (terlihat)
     * @param {HTMLElement} pageElement - Elemen halaman yang ingin ditampilkan
     */
    const showPage = (pageElement) => {
        document.querySelectorAll('.page-container').forEach(p => p.classList.remove('active'));
        pageElement.classList.add('active');
    };

    /**
     * Mengunggah file ke Cloudinary
     * @param {File} file - File yang akan diunggah
     * @returns {Promise<string>} URL gambar yang aman dari Cloudinary
     */
    async function uploadToCloudinary(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (!data.secure_url) {
            throw new Error('Upload ke Cloudinary gagal.');
        }
        return data.secure_url;
    }

    /**
     * Menampilkan daftar item dari Firestore ke dalam elemen list
     * @param {string} collectionName - Nama koleksi ('berita' atau 'galeri')
     * @param {HTMLElement} listElement - Elemen HTML untuk menampilkan list
     * @param {function} renderItem - Fungsi untuk merender satu item menjadi string HTML
     */
    const loadData = (collectionName, listElement, renderItem) => {
        listElement.innerHTML = 'Memuat...';
        db.collection(collectionName).orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            if (snapshot.empty) {
                listElement.innerHTML = `<p>Belum ada data di ${collectionName}.</p>`;
                return;
            }
            let html = '';
            snapshot.forEach(doc => {
                html += renderItem(doc.id, doc.data());
            });
            listElement.innerHTML = html;
        }, error => {
            console.error(`Gagal memuat data ${collectionName}: `, error);
            listElement.innerHTML = `<p>Gagal memuat data. Coba lagi nanti.</p>`;
        });
    };

    /**
     * Merender satu item data menjadi string HTML
     * @param {string} type - Tipe data ('berita' atau 'galeri')
     * @param {string} id - ID dokumen
     * @param {object} data - Objek data dari Firestore
     * @returns {string} String HTML untuk satu item
     */
    const renderDataItem = (type, id, data) => {
        const text = type === 'berita' 
            ? data.judul 
            : `${data.imageUrl.substring(0, 40)}...`;
            
        return `
            <div class="data-item">
                <p>${text}</p>
                <button class="delete-btn" data-collection="${type}" data-id="${id}">Hapus</button>
            </div>
        `;
    };

    // =================================================================
    // --- EVENT LISTENERS & LOGIKA UTAMA ---
    // =================================================================

    // --- PENGATURAN AUTH ---
    auth.onAuthStateChanged(user => {
        if (user) {
            showPage(dashboardPage);
            // Muat data saat login berhasil
            loadData('berita', document.getElementById('berita-list'), (id, data) => renderDataItem('berita', id, data));
            loadData('galeri', document.getElementById('galeri-list'), (id, data) => renderDataItem('galeri', id, data));
        } else {
            showPage(loginPage);
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => loginError.textContent = 'Email atau password salah.');
    });

    logoutBtn.addEventListener('click', () => auth.signOut());
    
    // --- NAVIGASI TAB ---
    navTabs.addEventListener('click', (e) => {
        e.preventDefault();
        const clickedTab = e.target.closest('a[data-tab]');
        if (!clickedTab) return;

        navTabs.querySelector('a.active').classList.remove('active');
        clickedTab.classList.add('active');

        document.querySelector('.content-tab.active').classList.remove('active');
        const tabId = clickedTab.dataset.tab;
        document.getElementById(`tab-${tabId}`).classList.add('active');
    });
    
    // --- SUBMIT FORM (BERITA & GALERI) ---
    const handleFormSubmit = async (e, collectionName) => {
        e.preventDefault();
        const form = e.target;
        const fileInput = form.querySelector('input[type="file"]');
        const statusP = form.querySelector('.upload-status');
        
        const file = fileInput.files[0];
        if (!file) {
            statusP.textContent = 'Harap pilih gambar!';
            return;
        }

        statusP.textContent = 'Mengupload...';
        
        try {
            const imageUrl = await uploadToCloudinary(file);
            const dataToSave = {
                imageUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (collectionName === 'berita') {
                dataToSave.judul = form.querySelector('#berita-judul').value;
                dataToSave.lokasi = form.querySelector('#berita-lokasi').value;
                dataToSave.deskripsi = form.querySelector('#berita-deskripsi').value;
            }

            await db.collection(collectionName).add(dataToSave);

            statusP.textContent = 'Berhasil ditambahkan!';
            form.reset();
            setTimeout(() => { statusP.textContent = ''; }, 3000);
        } catch (error) {
            console.error('Submit Gagal:', error);
            statusP.textContent = 'Gagal! ' + error.message;
        }
    };
    
    document.getElementById('add-berita-form').addEventListener('submit', (e) => handleFormSubmit(e, 'berita'));
    document.getElementById('add-galeri-form').addEventListener('submit', (e) => handleFormSubmit(e, 'galeri'));

    // --- HAPUS DATA (EVENT DELEGATION) ---
    dashboardPage.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const button = e.target;
            const id = button.dataset.id;
            const collection = button.dataset.collection;
            
            if (confirm(`Anda yakin ingin menghapus item ini dari ${collection}?`)) {
                try {
                    button.textContent = 'Menghapus...';
                    button.disabled = true;
                    await db.collection(collection).doc(id).delete();
                    // List akan ter-update otomatis karena kita menggunakan onSnapshot
                } catch (error) {
                    console.error("Gagal menghapus: ", error);
                    alert("Gagal menghapus item.");
                    button.textContent = 'Hapus';
                    button.disabled = false;
                }
            }
        }
    });
});