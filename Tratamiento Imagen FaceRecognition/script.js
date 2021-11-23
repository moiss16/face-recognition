const imageUpload = document.getElementById('imageUpload')

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.FaceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('models')
]).then(start)

async function start(){
    const container  = document.createElement('div')
    container.style.position = 'relative'
    document.body.append(container)
    const labelFaceDrescriptors = await loadLabeledImage()
    const faceMatcher = faceapi.FaceMatcher(labeledFaceDrescriptors, 0.6)
    let image
    let canvas
    document.body.append('Loaded')

    imageUpload.addEventListener('change', async () => {
        if (image) image.remove()
        if (canvas) canvas.remove()

        image = await faceapi.bufferToImage(imageUpload.file[0])
        container.append(image)
        canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)

        const displaySize = {width: image.width, height: image.height}
        faceapi.matchDimensions(canvas, displaySize)

        const detections = faceapi.detectionAllFaces(image).withFaceMarks().withFaceDEscriptors()
        const resizeDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizeDetections.map(d => faceMatcher.findBestMatch(d.descriptor))

        results.forEach((results, i) =>{
            const box =  resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, {label: results.toString() })
            drawBox.draw(canvas)
        })
    })
}

function loadLabeledImages(){
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
    return Promise.all(
        label.map(async label =>{
            const descriptions = []
            for (let i = 1; i <= 2; i++){
                const img = await faceapi.fetchIamge(`https://mawe.mx/face/images/${label}/${i}.jpg`)
                const detections = await faceapi.detectionSingleFace(img)
                descriptions.push(detections.descriptor)
            }
            return new faceapi.labeledFaceDrescriptors(label, descriptions)
        })
    )
}