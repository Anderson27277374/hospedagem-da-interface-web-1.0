// MQTT Setup
// Troque o broker MQTT para um broker público confiável para WebSocket.
// Exemplo alternativo: HiveMQ public broker (porta 8000, sem SSL)
const broker = 'ws://broker.hivemq.com:8000/mqtt'; // Porta 8000, sem SSL
const clientId = 'web-' + Math.random().toString(16).substr(2, 8);
const client = mqtt.connect(broker, { clientId });

const dispositivos = [];
let selecionado = null; // ín,,,,,,,,dice do dispositivo selecionado

client.on('connect', () => {
  // Opcional: console.log('MQTT conectado');
});

client.on('message', (topic, message) => {
  dispositivos.forEach(d => {
    if (d.topico_status === topic) {
      d.conectado = true;
      d.estado = message.toString();
      // Se quiser evitar delay, não chame atualizarPainelIot aqui
      // atualizarPainelIot();
    }
  });
});

client.on('error', (err) => {
  console.error('Erro MQTT:', err);
  // Opcional: exiba mensagem na interface
  // document.getElementById('iotMsg').textContent = 'Erro ao conectar ao MQTT: ' + err.message;
});

function adicionarDispositivoIot(nome, id, tipo, obs) {
  if (!nome || !id || !tipo) return;
  const iotForm = document.getElementById('iotForm');
  // Se estiver editando, faz PUT
  if (iotForm && iotForm.dataset.editando) {
    fetch("http://192.168.1.100:5000/devices/" + encodeURIComponent(iotForm.dataset.editando), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nome,
        id: id,
        tipo: tipo,
        obs: obs || ""
      })
    })
    .then(resp => resp.json())
    .then(() => {
      iotForm.dataset.editando = '';
      carregarDispositivosIoT();
    });
  } else {
    // Novo dispositivo
    fetch("http://192.168.1.100:5000/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nome,
        id: id,
        tipo: tipo,
        obs: obs || ""
      })
    })
    .then(resp => resp.json())
    .then(() => {
      carregarDispositivosIoT();
    });
  }
}

function enviarComandoIot(dispositivo, comando) {
  if (!dispositivo.topico_comando || typeof dispositivo.topico_comando !== 'string' || dispositivo.topico_comando.trim() === '') {
    console.warn('Dispositivo sem tópico MQTT válido para comando:', dispositivo);
    return;
  }
  client.publish(dispositivo.topico_comando, comando);
}

function alternarDispositivoIot(idx, estado) {
  const d = dispositivos[idx];
  if (!d) return;
  if (typeof estado === 'boolean') {
    d.ligado = estado;
  } else {
    d.ligado = !d.ligado;
  }
  // Atualiza visual imediatamente
  atualizarPainelIot();
  // Envia comando MQTT
  enviarComandoIot(d, d.ligado ? 'on' : 'off');
}

let quadroIotDetalhes = null;

// Função para criar/mostrar o quadro de detalhes do dispositivo
function mostrarQuadroDetalhesIot(dispositivo) {
  // Cria o quadro/modal se não existir
  if (!quadroIotDetalhes) {
    quadroIotDetalhes = document.createElement('div');
    quadroIotDetalhes.id = 'iotDetalhesModal';
    quadroIotDetalhes.style.position = 'fixed';
    quadroIotDetalhes.style.zIndex = '4000';
    quadroIotDetalhes.style.inset = '0';
    quadroIotDetalhes.style.background = 'rgba(0,0,0,0.45)';
    quadroIotDetalhes.style.display = 'flex';
    quadroIotDetalhes.style.alignItems = 'center';
    quadroIotDetalhes.style.justifyContent = 'center';
    quadroIotDetalhes.innerHTML = `
      <div class="iot-detalhes-content">
        <div class="iot-detalhes-nome" id="iotDetalhesNome"></div>
        <div class="iot-detalhes-row">
          <span class="iot-detalhes-id"><b>ID:</b> <span id="iotDetalhesId"></span></span>
          <span class="iot-detalhes-tipo"><b>Tipo:</b> <span id="iotDetalhesTipo"></span></span>
        </div>
        <div class="iot-detalhes-obs"><b>Comandos/Observações:</b><br><span id="iotDetalhesObs"></span></div>
        <button id="fecharIotDetalhesBtn">⛌</button>
      </div>
    `;
    document.body.appendChild(quadroIotDetalhes);
    quadroIotDetalhes.querySelector('#fecharIotDetalhesBtn').onclick = function() {
      quadroIotDetalhes.style.display = 'none';
    };
  }
  quadroIotDetalhes.querySelector('#iotDetalhesNome').textContent = dispositivo.nome || '';
  quadroIotDetalhes.querySelector('#iotDetalhesId').textContent = dispositivo.id || '';
  quadroIotDetalhes.querySelector('#iotDetalhesTipo').textContent = dispositivo.tipo || '';
  quadroIotDetalhes.querySelector('#iotDetalhesObs').textContent = dispositivo.obs || 'Nenhum comando cadastrado.';
  quadroIotDetalhes.style.display = 'flex';
}

// Atualiza painel IoT
function atualizarPainelIot() {
  const container = document.getElementById('iotContent');
  if (!container) return;
  container.innerHTML = '';
  dispositivos.forEach((d, i) => {
    const estadoClasse = d.ligado ? 'ligado' : 'desligado';
    const card = document.createElement('div');
    card.className = `iot-card ${estadoClasse}`;
    card.innerHTML = `
      <strong class="iot-card-nome">${d.nome || 'Sem nome'}</strong>
      <span class="iot-card-tipo">${d.tipo || ''}</span>
      <div class="iot-switch">
        <label class="switch">
          <input type="checkbox" ${d.ligado ? 'checked' : ''} data-idx="${i}">
          <span class="slider"></span>
          <span class="switch-label">
            <span class="ligado">Ligado</span>
            <span class="desligado">Desligado</span>
          </span>
        </label>
      </div>
    `;
    const switchInput = card.querySelector('.iot-switch input[type="checkbox"]');
    // Botão liga/desliga: só liga/desliga, nunca abre modal
    switchInput.addEventListener('pointerdown', function(e) {
      e.stopPropagation();
    });
    switchInput.addEventListener('click', function(e) {
      alternarDispositivoIot(i, this.checked);
      e.stopPropagation();
    });
    // Clique no card (fora do botão) abre modal
    card.addEventListener('click', function(e) {
      if (e.target.closest('.iot-switch')) return;
      mostrarQuadroDetalhesIot(d);
    });
    container.appendChild(card);
  });
}

// Integração com o formulário do HTML
const iotForm = document.getElementById('iotForm');
if (iotForm) {
  iotForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = document.getElementById('iotNome').value.trim();
    const id = document.getElementById('iotId').value.trim();
    const tipo = document.getElementById('iotTipo').value;
    const obs = document.getElementById('iotObs').value.trim();
    adicionarDispositivoIot(nome, id, tipo, obs);
    iotForm.reset();
    iotForm.style.display = 'none';
    iotForm.dataset.editando = '';
  });
}

// Botão flutuante para mostrar o formulário
const addIotBtn = document.getElementById('add-iot-btn');
const iotKeyboardWrapper = document.getElementById('iotKeyboardWrapper');
const fundoVideo = document.getElementById('background-video'); // ajuste o id conforme seu vídeo

function mostrarFormularioIot() {
  if (iotForm) iotForm.style.display = 'block';
  if (iotKeyboardWrapper) iotKeyboardWrapper.style.display = 'flex';
  if (addIotBtn) addIotBtn.style.display = 'none';
  const iotContent = document.getElementById('iotContent');
  if (iotContent) iotContent.style.display = 'none';
  // Troca o vídeo de fundo para o formulário
  const chatVideo = document.getElementById('chat-video');
  const calendarVideo = document.getElementById('calendar-video');
  const formVideo = document.getElementById('form-video');
  const iotVideo = document.getElementById('iot-video');
  if (chatVideo) chatVideo.style.display = 'none';
  if (calendarVideo) calendarVideo.style.display = 'none';
  if (iotVideo) iotVideo.style.display = 'none';
  if (formVideo) formVideo.style.display = 'block';
}

function fecharFormularioIot() {
  if (iotForm) iotForm.style.display = 'none';
  if (iotKeyboardWrapper) iotKeyboardWrapper.style.display = 'none';
  if (addIotBtn) addIotBtn.style.display = 'flex';
  const iotContent = document.getElementById('iotContent');
  if (iotContent) iotContent.style.display = 'flex';
  // Volta o vídeo de fundo para IoT
  const chatVideo = document.getElementById('chat-video');
  const calendarVideo = document.getElementById('calendar-video');
  const formVideo = document.getElementById('form-video');
  const iotVideo = document.getElementById('iot-video');
  if (chatVideo) chatVideo.style.display = 'none';
  if (calendarVideo) calendarVideo.style.display = 'none';
  if (formVideo) formVideo.style.display = 'none';
  if (iotVideo) iotVideo.style.display = 'block';
}

// Ao clicar no botão de adicionar dispositivo
if (addIotBtn) {
  addIotBtn.addEventListener('click', mostrarFormularioIot);
}

// Ao salvar ou cancelar, fecha o formulário e o teclado
if (iotForm) {
  iotForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // ...salvar dispositivo...
    fecharFormularioIot();
  });
}
const cancelarBtn = document.getElementById('cancelarIotBtn');
if (cancelarBtn) {
  cancelarBtn.addEventListener('click', function(e) {
    e.preventDefault();
    fecharFormularioIot();
    if (iotForm) iotForm.dataset.editando = '';
  });
}

// --- Teclado Virtual IoT (modelo AURALINK_TECLADOV11iot) ---
let camadaIot = 'letras';
let capsLockIot = false;
let acentoIot = null;

const layoutsTeclasIot = {
  letras: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'ç'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '?', '⌫'],
    ['123', 'Cancelar', ' ', '´', '`', '~', '^', '!', 'Enter']
  ],
  simbolos: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '+', '*', '/', '=', '.', ',', '(', ')'],
    ['!', '#', '@', '$', '%', '&', '_', '⌫'],
    ['ABC', 'Cancelar', ' ', '[', ']', '{', '}', 'Enter']
  ]
};

const mapaAcentosIot = {
  '´': { 'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú', 'c': 'ć' },
  '`': { 'a': 'à', 'e': 'è', 'i': 'ì', 'o': 'ò', 'u': 'ù' },
  '~': { 'a': 'ã', 'o': 'õ', 'n': 'ñ' },
  '^': { 'a': 'â', 'e': 'ê', 'i': 'î', 'o': 'ô', 'u': 'û' }
};

function criarTecladoIot(input) {
  const teclado = document.getElementById('iot-keyboard');
  teclado.innerHTML = '';
  const layout = layoutsTeclasIot[camadaIot];
  layout.forEach(linha => {
    const linhaDiv = document.createElement('div');
    linhaDiv.className = 'linha';
    linha.forEach(tecla => {
      const btn = document.createElement('button');
      btn.className = 'tecla';
      btn.textContent = tecla === ' ' ? 'Espaço' : tecla;
      btn.dataset.valor = tecla;
      btn.type = 'button';
      btn.addEventListener('pointerdown', function(e) {
        e.preventDefault();
        pressionarTeclaIot(tecla, input);
      });
      linhaDiv.appendChild(btn);
    });
    teclado.appendChild(linhaDiv);
  });
}

function pressionarTeclaIot(tecla, input) {
  if (tecla === 'Caps') {
    capsLockIot = !capsLockIot;
    criarTecladoIot(input);
    return;
  }
  if (tecla === '123' || tecla === 'ABC') {
    camadaIot = tecla === '123' ? 'simbolos' : 'letras';
    criarTecladoIot(input);
    return;
  }
  if (['´', '`', '~', '^'].includes(tecla)) {
    acentoIot = tecla;
    return;
  }
  if (tecla === '⌫') {
    input.value = input.value.slice(0, -1);
    return;
  }
  if (tecla === 'Enter') {
    input.form && input.form.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));
    return;
  }
  if (tecla === 'Cancelar') {
    input.value = '';
    return;
  }
  if (tecla === 'Espaço' || tecla === ' ') {
    input.value += ' ';
    return;
  }
  // Letras e símbolos
  if (input.value.length < 100) {
    if (acentoIot && mapaAcentosIot[acentoIot]) {
      input.value += mapaAcentosIot[acentoIot][tecla] || tecla;
      acentoIot = null;
    } else {
      input.value += capsLockIot ? tecla.toUpperCase() : tecla;
    }
  }
}

// Mostra teclado ao focar nos campos do formulário IoT
['iotNome', 'iotId', 'iotObs'].forEach(id => {
  const campo = document.getElementById(id);
  if (campo) {
    campo.addEventListener('focus', function() {
      document.getElementById('iotKeyboardWrapper').style.display = 'flex';
      camadaIot = 'letras';
      capsLockIot = false;
      acentoIot = null;
      criarTecladoIot(this);
    });
  }
});

// Fecha teclado ao enviar ou cancelar
if (iotForm) {
  iotForm.addEventListener('submit', function(e) {
    document.getElementById('iotKeyboardWrapper').style.display = 'none';
    camadaIot = 'letras';
    capsLockIot = false;
    acentoIot = null;
  });
}
if (cancelarIotBtn && iotForm) {
  cancelarIotBtn.onclick = () => {
    document.getElementById('iotKeyboardWrapper').style.display = 'none';
    camadaIot = 'letras';
    capsLockIot = false;
    acentoIot = null;
  };
}

// ...adicione ao seu JS principal...
async function carregarDispositivosIoT() {
  const resp = await fetch("http://192.168.1.100:5000/devices");
  const lista = await resp.json();
  const container = document.getElementById('iotContent');
  container.innerHTML = '';
  dispositivos.length = 0; // Limpa o array global

  if (!Array.isArray(lista) || lista.length === 0) {
    container.innerHTML = '<div style="color:#fff;opacity:0.7;">Nenhum dispositivo cadastrado.</div>';
    return;
  }

  lista.forEach((dev, idx) => {
    if (typeof dev.ligado === 'undefined') dev.ligado = false;
    dispositivos.push(dev); // Atualiza o array global
  });
  // Sempre atualiza os cards e eventos de clique
  atualizarPainelIot();
}

// Garante que os cards são carregados ao iniciar
document.addEventListener('DOMContentLoaded', carregarDispositivosIoT);

async function salvarNovoDispositivoIoT(nome, id, tipo, obs) {
  await fetch("http://localhost:5001/iot/dispositivos", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome, id, tipo, obs})
  });
  carregarDispositivosIoT();
}

// Sempre que abrir o painel IoT:
document.getElementById('iotMain').addEventListener('show', carregarDispositivosIoT);
// Ou chame carregarDispositivosIoT() logo após mostrar o painel IoT via comando de voz.

if (data.texto === "abrir_iot") {
  document.getElementById('iotMain').style.display = 'block';
  document.getElementById('calendarMain').style.display = 'none';
  document.getElementById('painel-chat').style.display = 'none';
  mostrarVideoFundo('iot');
  carregarDispositivosIoT(); // <-- aqui!
}
document.getElementById('iotMain').addEventListener('show', carregarDispositivosIoT);
// Ou chame carregarDispositivosIoT() logo após mostrar o painel IoT via comando de voz.

if (data.texto === "abrir_iot") {
  document.getElementById('iotMain').style.display = 'block';
  document.getElementById('calendarMain').style.display = 'none';
  document.getElementById('painel-chat').style.display = 'none';
  mostrarVideoFundo('iot');
  carregarDispositivosIoT(); // <-- aqui!
}
  carregarDispositivosIoT();


// Sempre que abrir o painel IoT:
document.getElementById('iotMain').addEventListener('show', carregarDispositivosIoT);
// Ou chame carregarDispositivosIoT() logo após mostrar o painel IoT via comando de voz.

if (data.texto === "abrir_iot") {
  document.getElementById('iotMain').style.display = 'block';
  document.getElementById('calendarMain').style.display = 'none';
  document.getElementById('painel-chat').style.display = 'none';
  mostrarVideoFundo('iot');
  carregarDispositivosIoT(); // <-- aqui!
}
document.getElementById('iotMain').addEventListener('show', carregarDispositivosIoT);
// Ou chame carregarDispositivosIoT() logo após mostrar o painel IoT via comando de voz.

if (data.texto === "abrir_iot") {
  document.getElementById('iotMain').style.display = 'block';
  document.getElementById('calendarMain').style.display = 'none';
  document.getElementById('painel-chat').style.display = 'none';
  mostrarVideoFundo('iot');
  carregarDispositivosIoT(); // <-- aqui!
}




