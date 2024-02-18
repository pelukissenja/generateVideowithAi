import Ffmpeg from "fluent-ffmpeg";
import axios from "axios";
import ytdl from "ytdl-core";
import compromise from "compromise";

// Fungsi untuk mengambil URL gambar dari Pixabay
const getPixabayImage = async (query) => {
    try {
        const apiKey = "37559108-7684b46c4fbf07b134b3e90ba";
        const response = await axios.get(`https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&per_page=1`);
        if (response.data.hits.length > 0) {
            return response.data.hits[0].largeImageURL;
        } else {
            console.error("Tidak ada gambar yang ditemukan untuk query:", query);
            return null;
        }
    } catch (error) {
        console.error("Terjadi kesalahan saat mengambil gambar dari Pixabay:", error);
        return null;
    }
};

// Fungsi untuk mengunduh audio dari video YouTube berdasarkan prompt
const getYoutubeAudio = async (query) => {
    try {
        const searchResult = await ytdl.search(query);
        if (searchResult && searchResult.items && searchResult.items.length > 0) {
            return searchResult.items[0].url;
        } else {
            console.error("Tidak ada video yang ditemukan untuk query:", query);
            return null;
        }
    } catch (error) {
        console.error("Terjadi kesalahan saat mencari video di YouTube:", error);
        return null;
    }
};

// Fungsi untuk generate teks dari prompt menggunakan Compromise
const generateText = (prompt) => {
    const doc = compromise(prompt);
    const sentences = doc.sentences().out('array');
    return sentences.join(' ');
};

export const generateVideo = async (req, res) => {
    try {
        const outputFilePath = '/result/video.mp4'; // Tentukan lokasi file output video dengan benar
        const prompt = req.body.prompt;

        // Ambil teks dari prompt
        const text = generateText(prompt);

        // Ambil URL gambar dari Pixabay berdasarkan prompt
        const imageUrl = await getPixabayImage(prompt);

        // Ambil URL audio dari video YouTube berdasarkan prompt
        const audioUrl = await getYoutubeAudio(prompt);

        if (text && imageUrl && audioUrl) {
            // Gunakan fluent-ffmpeg untuk membuat video dari audio, gambar, dan teks
            Ffmpeg()
                .input(audioUrl)        // Masukkan URL audio dari YouTube
                .input(imageUrl)        // Masukkan URL gambar dari Pixabay
                .loop(1)                // Ulangi gambar sekali
                .fps(30)                // Atur frame per detik
                .videoCodec('libx264')  // Codec video
                .audioCodec('aac')      // Codec audio
                .input(`-vf drawtext=text='${text}':fontfile=arial.ttf:fontsize=24:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`) // Tambahkan teks ke video
                .output(outputFilePath) // Lokasi output video
                .on('end', () => {
                    console.log('Video berhasil dibuat:', outputFilePath);
                    res.send('Video berhasil dibuat!');
                })
                .on('error', (err) => {
                    console.error('Terjadi kesalahan saat membuat video:', err);
                    // res.status(500).send('Terjadi kesalahan saat membuat video');
                })
                .run();
        } else {
            console.error("Tidak dapat membuat video karena gambar, audio, atau teks tidak ditemukan untuk prompt:", prompt);
            // res.status(400).send('Tidak dapat membuat video karena data tidak lengkap');
        }
    } catch (error) {
        console.error("Terjadi kesalahan saat membuat video:", error);
        // res.status(500).send('Terjadi kesalahan saat membuat video');
    }
};


export default generateVideo;

