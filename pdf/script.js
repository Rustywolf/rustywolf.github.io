const { jsPDF } = window.jspdf;

function generatePDF() {
    const cardList = document.getElementById("cardList").value.trim();
    const lines = cardList.split("\n");

    const doc = new jsPDF({
        unit: "mm",
        format: [320, 450],
    });
    const imageBaseUrl = "img/"; // Cartella locale
    let xOffset = 23 + 88;
    let yOffset = 23 + 63 - 88;
    let cardsPerPage = 0;
    let loadedImages = 0; // Conteggio delle immagini caricate
    let totalImages = 0; // Numero totale di immagini da caricare
    const invalidLines = []; // Array per tenere traccia delle linee errate

    console.log(lines.length);
    if (lines[0] === "") {
        doc.save("DigiProxy.pdf");
        return;
    }

    lines.forEach(line => {
        // Ignora le linee che iniziano con //
        if (line.trim().startsWith("//")) {
            return;
        }

        const parts = line.split(/\s+(?=\S)/);
        const quantity = parseInt(parts[0]);
        const name = parts.slice(1, -1).join(' ');
        const code = parts[parts.length - 1].trim().toUpperCase(); // Rimuovi gli spazi in eccesso dal codice e converti in maiuscolo

        if (code.length === 0) {
            // Salta la riga se il codice è vuoto
            return;
        }

        totalImages += quantity; // Aggiorna il numero totale di immagini da caricare

        const imageUrl = imageBaseUrl + code + ".jpg";

        loadImage(imageUrl, (image) => {
            for (let i = 0; i < quantity; i++) {
                doc.addImage(image, "JPEG", xOffset, yOffset, 63, 88, code, "NONE", 90);

                xOffset += 93; // Larghezza della carta
                cardsPerPage++;

                if (cardsPerPage % 3 === 0) {
                    xOffset = 23 + 88;
                    yOffset += 68; // Altezza della carta
                }

                if (cardsPerPage === 18) {
                    doc.addPage();
                    xOffset = 23 + 88;
                    yOffset = 23 + 63 - 88;
                    cardsPerPage = 0;
                }
            }

            loadedImages += quantity; // Incrementa il conteggio delle immagini caricate

            if (loadedImages === totalImages) {
                if (cardsPerPage === 0) {
                    doc.deletePage(doc.getNumberOfPages()); // Rimuovi l'ultima pagina se è vuota
                }

                if (invalidLines.length > 0) {
                    const errorMessage = "The following lines contain invalid or missing cards: \n\n" + invalidLines.join("\n");
                    showError(errorMessage);
                } else {
                    doc.save("DigiProxy.pdf"); // Esegui il download del PDF quando tutte le immagini sono state caricate
                }
            }
        }, () => {
            // Aggiungi la linea errata all'array delle linee errate solo se non è già presente
            if (!invalidLines.includes(line)) {
                invalidLines.push(line);
            }

            loadedImages += quantity; // Incrementa il conteggio delle immagini caricate

            if (loadedImages === totalImages) {
                if (cardsPerPage === 0) {
                    doc.deletePage(doc.getNumberOfPages()); // Rimuovi l'ultima pagina se è vuota
                }

                if (invalidLines.length > 0) {
                    const errorMessage = "The following lines contain invalid or missing cards: \n\n" + invalidLines.join("\n");
                    showError(errorMessage);
                } else {
                    doc.save("DigiProxy.pdf"); // Esegui il download del PDF quando tutte le immagini sono state caricate
                }
            }
        });
    });
}

function loadImage(url, callback, errorCallback) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const image = new Image();

    image.crossOrigin = "Anonymous";

    image.onload = function () {
        canvas.width = image.width;
        canvas.height = image.height;
        context.fillStyle = "white";
        context.rect(0, 0, image.width, image.height);
        context.fill();
        context.drawImage(image, 0, 0);
        callback(canvas.toDataURL("image/jpeg"));
    };

    image.onerror = function () {
        errorCallback();
    };

    image.src = url;
}

function showError(message) {
    alert(message);
}
