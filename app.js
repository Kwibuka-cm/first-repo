document.getElementById('captureButton').addEventListener('click', () => {
    const constraints = {
        video: { facingMode: 'environment' }
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        video.addEventListener('loadeddata', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            document.getElementById('image').src = canvas.toDataURL('image/png');
            stream.getTracks().forEach(track => track.stop());
        });
    }).catch((err) => {
        console.error('Error accessing camera: ', err);
    });
});

document.getElementById('uploadButton').addEventListener('click', () => {
    document.getElementById('uploadInput').click();
});

document.getElementById('uploadInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('image').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('extractButton').addEventListener('click', () => {
    const img = document.getElementById('image');
    if (img.src) {
        preprocessImage(img).then(preprocessedImage => {
            Tesseract.recognize(
                preprocessedImage,
                'eng+fra', // You can change this to other languages or use 'eng+fra' for multiple languages
                {
                    logger: (m) => console.log(m)
                }
            ).then(({ data: { text } }) => {
                document.getElementById('outputText').value = text;
            }).catch((err) => {
                console.error('Error extracting text: ', err);
            });
        });
    } else {
        alert('Please upload or capture an image first.');
    }
});

async function preprocessImage(img) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Convert to grayscale
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
    }
    context.putImageData(imageData, 0, 0);

    return canvas.toDataURL('image/png');
}
