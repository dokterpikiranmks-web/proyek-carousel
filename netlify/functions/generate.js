/* =============================================
   KODE "PELAYAN" (NETLIFY FUNCTION)
   File: netlify/functions/generate.js
   ============================================= */

// 1. Memuat "Bahan-Bahan"
// Kita tidak perlu install manual, Netlify akan otomatis menyediakannya
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 2. Mengambil Kunci API Rahasia
// Nanti kita akan simpan kunci ini di pengaturan Netlify
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 3. Menyiapkan Model AI Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

// 4. Ini adalah "Resepsionis" utama
// Nama 'handler' ini WAJIB untuk Netlify
exports.handler = async (event, context) => {
  // 5. Cek apakah permintaannya benar
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 6. Mengambil data (tema & jumlah) yang dikirim dari script.js
    const body = JSON.parse(event.body);
    const { tema, jumlah } = body;

    // 7. Membuat Perintah (Prompt) untuk AI
    const prompt = `
      Buatkan saya data untuk carousel dengan tema "${tema}".
      Saya butuh persis ${jumlah} slide.
      Tolong berikan HANYA respons dalam format JSON array.
      Setiap objek dalam array harus memiliki dua properti: "title" (judul) dan "description" (deskripsi).
      
      Contoh format:
      [
        { "title": "Judul Slide 1", "description": "Deskripsi untuk slide 1." },
        { "title": "Judul Slide 2", "description": "Deskripsi untuk slide 2." }
      ]

      Jangan tambahkan teks pembuka atau penutup seperti "Berikut adalah..." atau tanda "'''json".
      HANYA JSON array.
    `;

    // 8. Mengirim perintah ke AI dan menunggu jawaban
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiTextResponse = response.text();

    console.log('AI merespons:', aiTextResponse);

    // 9. Membersihkan jawaban AI
    const cleanJsonText = aiTextResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // 10. Kirim jawaban sukses (format JSON) kembali ke script.js
    return {
      statusCode: 200,
      body: cleanJsonText, // Kita kirim sebagai teks JSON
    };

  } catch (error) {
    // 11. Jika terjadi error
    console.error('Error saat memanggil Gemini:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Maaf, terjadi kesalahan di server AI.' }),
    };
  }
};
