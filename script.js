document.addEventListener('DOMContentLoaded', () => {
    const temaInput = document.getElementById('temaInput');
    const jumlahSlideSelect = document.getElementById('jumlahSlide');
    const buatButton = document.getElementById('buatButton');
    const carouselContainer = document.getElementById('carouselContainer');
    const loadingIndicator = document.getElementById('loading');

    let currentSlideIndex = 0;
    let totalSlides = 0;

    // Menangani klik tombol "Buat"
    buatButton.addEventListener('click', async () => {
        const tema = temaInput.value;
        const jumlah = parseInt(jumlahSlideSelect.value, 10);

        if (!tema) {
            alert('Silakan masukkan tema terlebih dahulu.');
            return;
        }

        // Tampilkan loading & bersihkan carousel lama
        loadingIndicator.classList.remove('hidden');
        carouselContainer.innerHTML = '';
        currentSlideIndex = 0;

        // --- INI BAGIAN PANGGILAN AI (SUDAH DIUBAH) ---
        // Kita panggil fungsi AI yang asli, bukan simulasi lagi
        const slidesData = await getRealAIGeneration(tema, jumlah);
        // --- Akhir Bagian Panggilan AI ---

        // Sembunyikan loading
        loadingIndicator.classList.add('hidden');

        // Render carousel baru
        renderCarousel(slidesData);
    });

    /**
     * FUNGSI PANGGILAN AI (GEMINI) YANG SEBENARNYA
     * Memanggil "pelayan" kita yang ada di Netlify.
     */
    async function getRealAIGeneration(tema, jumlah) {
        console.log(`Memanggil AI untuk tema '${tema}'...`);
        
        // Alamat "pelayan" kita di Netlify
        // Alamat ini HANYA akan berfungsi SETELAH kita upload ke Netlify
        const functionUrl = '/.netlify/functions/generate';

        try {
            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tema: tema,
                    jumlah: jumlah
                })
            });

            if (!response.ok) {
                // Jika server AI mengembalikan error (misal 500)
                throw new Error(`Server merespons dengan error: ${response.statusText}`);
            }

            // Jawaban dari Netlify adalah teks, kita ubah jadi data JSON
            const aiData = await response.json(); 
            
            // aiData sekarang berisi [{ title: '...', description: '...' }, ...]
            // Kita tambahkan properti imageUrl ke setiap objek
            return aiData.map((item, index) => ({
                ...item,
                // Kita tetap pakai Unsplash untuk gambar berdasarkan tema
                imageUrl: `https://source.unsplash.com/random/800x450?${tema},${index + 1}`
            }));

        } catch (error) {
            // Jika ada error (misal internet putus atau AI gagal total)
            console.error('Gagal mengambil data dari AI:', error);
            alert('Gagal terhubung ke AI. Pastikan server Netlify sudah jalan.');
            return []; // Kembalikan array kosong agar aplikasi tidak rusak
        }
    }


    /**
     * Membuat elemen HTML carousel dari data
     */
    function renderCarousel(slidesData) {
        totalSlides = slidesData.length;
        if (totalSlides === 0) return;

        // 1. Buat 'wrapper' untuk semua slide
        const slidesWrapper = document.createElement('div');
        slidesWrapper.className = 'carousel-slides';

        // 2. Buat setiap slide
        slidesData.forEach(data => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            
            slide.innerHTML = `
                <img src="${data.imageUrl}" alt="${data.title}">
                <div class="slide-content">
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                </div>
            `;
            slidesWrapper.appendChild(slide);
        });

        // 3. Buat tombol navigasi
        const prevButton = document.createElement('button');
        prevButton.className = 'carousel-nav prev';
        prevButton.innerHTML = '&#10094;'; // Simbol <
        prevButton.onclick = () => showSlide(currentSlideIndex - 1);

        const nextButton = document.createElement('button');
        nextButton.className = 'carousel-nav next';
        nextButton.innerHTML = '&#10095;'; // Simbol >
        nextButton.onclick = () => showSlide(currentSlideIndex + 1);

        // 4. Masukkan semua ke container utama
        carouselContainer.appendChild(slidesWrapper);
        carouselContainer.appendChild(prevButton);
        carouselContainer.appendChild(nextButton);

        // Tampilkan slide pertama
        updateSlidePosition();
    }

    /**
     * Logika untuk pindah slide
     */
    function showSlide(index) {
        if (index >= totalSlides) {
            currentSlideIndex = 0; // Kembali ke awal jika sudah di akhir
        } else if (index < 0) {
            currentSlideIndex = totalSlides - 1; // Pergi ke akhir jika di awal
        } else {
            currentSlideIndex = index;
        }
        updateSlidePosition();
    }

    /**
     * Memperbarui posisi 'transform' CSS untuk efek geser
     */
    function updateSlidePosition() {
        const slidesWrapper = carouselContainer.querySelector('.carousel-slides');
        if (slidesWrapper) {
            const offset = -currentSlideIndex * 100; // Geser sejauh X%
            slidesWrapper.style.transform = `translateX(${offset}%)`;
        }
    }
});