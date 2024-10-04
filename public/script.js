document.getElementById('file').addEventListener('change', function() {
    const fileInput = this;
    const fileNameDisplay = document.getElementById('file-name');
    const fileSelectedMessage = document.getElementById('file-selected-message');

    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        fileNameDisplay.textContent = fileName;
        fileSelectedMessage.style.display = 'block'; // Exibe a mensagem
    } else {
        fileSelectedMessage.style.display = 'none'; // Oculta a mensagem se nenhum arquivo for selecionado
    }
});

// Exibir mensagem de carregamento ao enviar o formulário
document.getElementById('chat-form').onsubmit = function() {
    document.getElementById('loading-message').style.display = 'block';
    document.getElementById('chat-form').style.display = 'none'; // Oculta o formulário durante o carregamento
};
