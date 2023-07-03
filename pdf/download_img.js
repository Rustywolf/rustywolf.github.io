const https = require('https');
const fs = require('fs');
const path = require('path');

// Variabile per il controllo dei doppioni
const checkDuplicates = true;

async function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (error) => {
            fs.unlink(filename, () => {
                reject(error);
            });
        });
    });
}

async function downloadImages(database) {
    const imgFolder = path.join(__dirname, 'img');

    if (!fs.existsSync(imgFolder)) {
        fs.mkdirSync(imgFolder);
    }

    for (const item of database) {
        const imageUrl = item.imageUrl;
        const imageName = item.cardid.replace('/', '-') + '.jpg';
        const imagePath = path.join(imgFolder, imageName);

        // Verifica dei doppioni solo se la variabile checkDuplicates è impostata su true
        if (checkDuplicates && fs.existsSync(imagePath)) {
            console.log(`Skipped existing image: ${imageName}`);
            continue;
        }

        try {
            await downloadImage(imageUrl, imagePath);
            console.log(`Downloaded image: ${imageName}`);
        } catch (error) {
            console.log(`Failed to download image: ${imageName}`);
        }
    }
}

async function fetchCardDatabase() {
    const requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    try {
        const response = await fetch("https://digimoncard.dev/data.php", requestOptions);
        const database = await response.json();

        await downloadImages(database);
    } catch (error) {
        console.log("Failed to fetch card database:", error);
    }
}

fetchCardDatabase();
