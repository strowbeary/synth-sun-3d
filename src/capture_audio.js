let public_analysers = false;
export async function init() {
    if (public_analysers) {
        return public_analysers
    } else {
        const contexteAudio = new AudioContext(); // définition du contexte audio
        // les navigateurs avec un moteur Webkit/blink demandent un préfixe

        const analyser = contexteAudio.createAnalyser();
        const analyser_left = contexteAudio.createAnalyser();
        const analyser_right = contexteAudio.createAnalyser();
        analyser_left.fftSize = 2048;
        analyser_right.fftSize = 2048;
        public_analysers = {
                analyser,
                analyser_left,
                analyser_right
            };
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia supported.');
            const stream = await navigator.mediaDevices.getUserMedia(
                // constraints - only audio needed for this app
                {
                    audio: true
                });
            const source = contexteAudio.createMediaStreamSource(stream);
            const splitter = contexteAudio.createChannelSplitter(2);
            splitter.connect(analyser_left, 0);
            splitter.connect(analyser_right, 0);
            source.connect(splitter);
            source.connect(analyser);
            return public_analysers;
        } else {
            console.log('getUserMedia not supported on your browser!');
        }
    }
}