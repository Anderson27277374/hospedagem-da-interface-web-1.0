const SERVER_URL = 'http://192.168.1.100:5000/chat';
let camadaAtual = 'letras';
let capsLock = false;
let acentoAtivo = null;

const layoutsTeclas = {
  letras: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'ç'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '?', '⌫'],
    ['123', 'Cancelar', ' ', '´', '`', '~', '^', '!', 'Enviar']
  ],
  simbolos: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '+', '*', '/', '=', '.', ',', '(', ')'],
    ['!', '#', '@', '$', '%', '&', '_', '⌫'],
    ['ABC', 'Cancelar', ' ', '[', ']', '{', '}', 'Enviar']
  ]
};

const mapaAcentos = {
  '´': { 'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú' },
  '`': { 'a': 'à', 'e': 'è', 'i': 'ì', 'o': 'ò', 'u': 'ù' },
  '~': { 'a': 'ã', 'o': 'õ', 'n': 'ñ' },
  '^': { 'a': 'â', 'e': 'ê', 'i': 'î', 'o': 'ô', 'u': 'û' }
};

function criarTeclado(layout) {
  const teclado = document.getElementById('keyboard');
  teclado.innerHTML = '';
  layout.forEach(linha => {
    const linhaDiv = document.createElement('div');
    linhaDiv.className = 'linha';
    linha.forEach(tecla => {
      const btn = document.createElement('button');
      btn.className = 'tecla';
      btn.textContent = tecla === ' ' ? 'Espaço' : tecla;
      btn.dataset.valor = tecla;
      // Adiciona classes especiais para teclas largas
      if (tecla === ' ' || tecla === 'Espaço') btn.classList.add('tecla-espaco');
      if (tecla === 'Enviar') btn.classList.add('tecla-enviar');
      if (tecla === 'Cancelar') btn.classList.add('tecla-cancelar');
      // Adiciona classes para teclas pequenas
      if (tecla === 'ç') btn.classList.add('tecla-c-cedilha');
      if (tecla === '⌫') btn.classList.add('tecla-apagar');
      btn.addEventListener('pointerdown', function(e) {
        e.preventDefault();
        pressionarTecla(tecla);
      });
      linhaDiv.appendChild(btn);
    });
    teclado.appendChild(linhaDiv);
  });
}

function pressionarTecla(tecla) {
  let campoInput = document.getElementById('input');

  if (tecla === 'Caps') {
    capsLock = !capsLock;
    criarTeclado(layoutsTeclas[camadaAtual]);
    return;
  }

  if (tecla === '123' || tecla === 'ABC') {
    camadaAtual = tecla === '123' ? 'simbolos' : 'letras';
    criarTeclado(layoutsTeclas[camadaAtual]);
    return;
  }

  if (['´', '`', '~', '^'].includes(tecla)) {
    acentoAtivo = tecla;
    return;
  }

  if (tecla === '⌫') {
    if (campoInput.value.length > 0) {
      campoInput.value = campoInput.value.slice(0, -1);
    }
    return;
  }

  if (tecla === 'Enviar') {
    if (campoInput.value.trim() !== '') {
      enviarMensagem(campoInput.value);
      campoInput.value = '';
    }
    return;
  }

  if (tecla === 'Cancelar') {
    if (campoInput) campoInput.value = '';
    return;
  }

  if (campoInput.value.length < 100) {
    if (acentoAtivo && mapaAcentos[acentoAtivo]) {
      campoInput.value += mapaAcentos[acentoAtivo][tecla] || tecla;
      acentoAtivo = null;
    } else {
      campoInput.value += capsLock ? tecla.toUpperCase() : tecla;
    }
  }
}

// Substitua ou adicione esta função para validar IPs com porta e localhost:
function validarIP(ip) {
  // Aceita IPv4, IPv4:porta, localhost, localhost:porta
  const ipv4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}(:\d{1,5})?$/;
  const localhost = /^localhost(:\d{1,5})?$/i;
  const mqtt = /^mqtt:\/\/[^\s]+$/i;
  return ipv4.test(ip) || localhost.test(ip) || mqtt.test(ip);
}

document.addEventListener('DOMContentLoaded', () => {
  criarTeclado(layoutsTeclas.letras);
});
