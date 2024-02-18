// Import semua dependensi yang diperlukan
import express from 'express';
import { generateVideo } from './controller/ai.js'; // Sesuaikan dengan lokasi controller Anda
import path from "path"
// Inisialisasi Express app
const app = express();
const port = 3000;

// Middleware untuk menguraikan body dari permintaan POST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Rute untuk menangani permintaan generate video
app.post('/generate-video', async (req, res) => {
    try {
        const { prompt, outputPath } = req.body;
        // Memanggil fungsi generateVideo dari controller
        await generateVideo(prompt, outputPath);
        res.send('Video berhasil dibuat!');
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        res.status(500).send('Terjadi kesalahan saat membuat video');
    }
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan pada http://localhost:${port}`);
});
