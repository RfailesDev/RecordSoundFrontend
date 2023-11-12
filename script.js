$(document).ready(function () {
    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];

    $('#recordButton').on('click', toggleRecording);

    async function toggleRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        if (!isRecording) {
            // Начало записи
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.start();
            $('#recordButton').text('🛑 Остановить запись');
        } else {
            // Завершение записи
            mediaRecorder.stop();

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

                // Создаем элемент audio для воспроизведения
                const audioElement = document.createElement('audio');
                audioElement.src = URL.createObjectURL(audioBlob);
                audioElement.controls = true;

                // Создаем контейнер для звука и кнопки отправки
                const audioContainer = document.createElement('div');
                audioContainer.classList.add('audio_bar');

                // Создаем кнопку отправки
                const sendButton = document.createElement('button');
                sendButton.classList.add('send_button');
                sendButton.textContent = 'SEND';


                const currentTime = new Date();
                const options = { hour: 'numeric', minute: 'numeric' };
                const timeText = currentTime.toLocaleString(undefined, options);

                const timeElement = document.createElement('div');
                timeElement.classList.add('time_element');
                timeElement.textContent = timeText;
                // Добавляем время в контейнер
                audioContainer.appendChild(timeElement);

                // Добавляем звук в контейнер
                audioContainer.appendChild(audioElement);

                // Добавляем кнопку в контейнер
                audioContainer.appendChild(sendButton);

                // Добавляем контейнер в audios_container
                const audiosContainer = document.querySelector('.audios_container');
                audiosContainer.appendChild(audioContainer);

                // Отправляем запись на сервер при нажатии кнопки sendButton
                sendButton.addEventListener('click', function() {
                    if (sendButton.textContent !== "...") {
                        sendButton.textContent = '...';
                        sendAudioToServer(audioBlob).then(response => {
                            if (response.message === 'Audio received successfully!') {
                                sendButton.textContent = '✓';
                            } else {
                                sendButton.textContent = 'SEND';
                            }
                        });
                    }
                });

                // Очищаем данные
                audioChunks = [];
            };

            $('#recordButton').text('🎙️ Начать запись');
        }

        isRecording = !isRecording;
    }

    function sendAudioToServer(blob) {
        console.log("Sending audio to server...");

        const formData = new FormData();
        formData.append('audio', blob);

        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                url: 'https://85.236.189.41:777/upload',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    console.log("Server response:", response);
                    resolve(response);
                },
                error: function (error) {
                    console.error('Error:', error);
                    reject(error);
                }
            });
        });
    }
});
