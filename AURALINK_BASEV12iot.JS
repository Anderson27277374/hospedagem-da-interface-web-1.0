document.addEventListener('DOMContentLoaded', () => {
  const horaElement = document.getElementById("hora");
  const dataElement = document.getElementById("data");
  const addEventBtn = document.getElementById('add-event-btn');
  const calendarContainer = document.getElementById('calendar-container');
  const eventForm = document.getElementById('event-form');
  const eventKeyboardWrapper = document.getElementById('eventKeyboardWrapper');
  const eventNameInput = document.getElementById('event-name');

  function atualizarHoraData() {
    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0') + ':' +
                 agora.getMinutes().toString().padStart(2, '0');
    const data = agora.getDate().toString().padStart(2, '0') + '/' +
                 (agora.getMonth() + 1).toString().padStart(2, '0') + '/' +
                 agora.getFullYear();
    if (horaElement) horaElement.textContent = hora;
    if (dataElement) dataElement.textContent = data;
  }
  setInterval(atualizarHoraData, 1000);
  atualizarHoraData();

  // Alternância entre chat e calendário
  function mostrarCalendario() {
    fecharFormularioIot();
    fecharFormularioCalendario();
    document.getElementById('iotMain').style.display = 'none';
    document.getElementById('painel-chat').style.display = 'none';
    document.getElementById('calendarMain').style.display = 'block';
    // Esconde o botão de adicionar IoT
    const addIotBtn = document.getElementById('add-iot-btn');
    if (addIotBtn) addIotBtn.style.display = 'none';
    // Mostra o botão de adicionar evento
    const addEventBtn = document.getElementById('add-event-btn');
    if (addEventBtn) addEventBtn.style.display = 'block';
    // Mostra o calendário e eventos
    const calendarContainer = document.getElementById('calendar-container');
    if (calendarContainer) calendarContainer.style.display = 'block';
  }

  function mostrarChat() {
    document.getElementById('iotMain').style.display = 'none';
    document.getElementById('painel-chat').style.display = 'flex';
    document.getElementById('calendarMain').style.display = 'none';
    // Esconde o botão de adicionar IoT
    const addIotBtn = document.getElementById('add-iot-btn');
    if (addIotBtn) addIotBtn.style.display = 'none';
  }

  function mostrarPainelIot() {
    fecharFormularioIot();
    document.getElementById('iotMain').style.display = 'block';
    document.getElementById('painel-chat').style.display = 'none';
    document.getElementById('calendarMain').style.display = 'none';
    // Mostra o botão de adicionar IoT e os cards
    const addIotBtn = document.getElementById('add-iot-btn');
    if (addIotBtn) addIotBtn.style.display = 'flex';
    const iotContent = document.getElementById('iotContent');
    if (iotContent) iotContent.style.display = 'flex';
  }

  // Função centralizada para trocar o vídeo de fundo
  function mostrarVideoFundo(tipo) {
    const videos = {
      chat: document.getElementById('chat-video'),
      calendario: document.getElementById('calendar-video'),
      formulario: document.getElementById('form-video'),
      iot: document.getElementById('iot-video')
    };
    for (let key in videos) {
      if (videos[key]) videos[key].style.display = 'none';
    }
    if (videos[tipo]) videos[tipo].style.display = 'block';
  }

  // Ao iniciar, vídeo do chat
  mostrarVideoFundo('chat');

  // Swipe em mobile
  let touchStartX = null, touchStartY = null;
  let touchStartEdge = false;
  document.body.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      // Só ativa swipe se começar a menos de 100px da borda esquerda, direita, topo ou base
      const w = window.innerWidth, h = window.innerHeight;
      if (
        touchStartX <= 200 || touchStartX >= w - 200 ||
        touchStartY <= 200 || touchStartY >= h - 200
      ) {
        touchStartEdge = true;
      } else {
        touchStartEdge = false;
      }
    }
  });
  document.body.addEventListener('touchend', function(e) {
    if (!touchStartEdge) {
      touchStartX = null;
      touchStartY = null;
      return;
    }
    if (touchStartX === null || touchStartY === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const limiar = 60;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -limiar) {
        // Swipe esquerda: calendário
        fecharFormularioIot();
        fecharFormularioCalendario();
        document.getElementById('calendarMain').style.display = 'block';
        document.getElementById('painel-chat').style.display = 'none';
        document.getElementById('iotMain').style.display = 'none';
        mostrarVideoFundo('calendario');
        const addIotBtn = document.getElementById('add-iot-btn');
        if (addIotBtn) addIotBtn.style.display = 'none';
      } else if (dx > limiar) {
        // Swipe direita: chat
        fecharFormularioIot();
        fecharFormularioCalendario();
        document.getElementById('painel-chat').style.display = 'flex';
        document.getElementById('calendarMain').style.display = 'none';
        document.getElementById('iotMain').style.display = 'none';
        mostrarVideoFundo('chat');
        const addIotBtn = document.getElementById('add-iot-btn');
        if (addIotBtn) addIotBtn.style.display = 'none';
      }
    } else {
      if (dy < -limiar) {
        // Swipe cima: IoT
        fecharFormularioIot();
        fecharFormularioCalendario();
        document.getElementById('iotMain').style.display = 'block';
        document.getElementById('calendarMain').style.display = 'none';
        document.getElementById('painel-chat').style.display = 'none';
        mostrarVideoFundo('iot');
        const addIotBtn = document.getElementById('add-iot-btn');
        if (addIotBtn) addIotBtn.style.display = 'flex';
        const iotContent = document.getElementById('iotContent');
        if (iotContent) iotContent.style.display = 'flex';
      } else if (dy > limiar) {
        // Swipe baixo: chat
        fecharFormularioIot();
        fecharFormularioCalendario();
        document.getElementById('painel-chat').style.display = 'flex';
        document.getElementById('calendarMain').style.display = 'none';
        document.getElementById('iotMain').style.display = 'none';
        mostrarVideoFundo('chat');
        const addIotBtn = document.getElementById('add-iot-btn');
        if (addIotBtn) addIotBtn.style.display = 'none';
      }
    }
    touchStartX = null;
    touchStartY = null;
    touchStartEdge = false;
  });

  // Swipe em desktop
  let mouseDownX = null, mouseDownY = null, mouseDownEdge = false;
  document.body.addEventListener('mousedown', e => {
    mouseDownX = e.screenX;
    mouseDownY = e.screenY;
    // Só ativa swipe se começar a menos de 100px da borda esquerda, direita, topo ou base
    const w = window.innerWidth, h = window.innerHeight;
    if (
      e.clientX <= 100 || e.clientX >= w - 100 ||
      e.clientY <= 100 || e.clientY >= h - 100
    ) {
      mouseDownEdge = true;
    } else {
      mouseDownEdge = false;
    }
  });
  document.body.addEventListener('mouseup', e => {
    if (!mouseDownEdge) {
      mouseDownX = null;
      mouseDownY = null;
      return;
    }
    if (mouseDownX !== null) {
      let delta = e.screenX - mouseDownX;
      if (delta < -50) {
        // Swipe esquerda: calendário
        fecharFormularioIot();
        fecharFormularioCalendario();
        document.getElementById('calendarMain').style.display = 'block';
        document.getElementById('painel-chat').style.display = 'none';
        document.getElementById('iotMain').style.display = 'none';
        mostrarVideoFundo('calendario');
        const addIotBtn = document.getElementById('add-iot-btn');
        if (addIotBtn) addIotBtn.style.display = 'none';
      }
      if (delta > 50) {
        // Swipe direita: chat
        fecharFormularioIot();
        fecharFormularioCalendario();
        document.getElementById('painel-chat').style.display = 'flex';
        document.getElementById('calendarMain').style.display = 'none';
        document.getElementById('iotMain').style.display = 'none';
        mostrarVideoFundo('chat');
        const addIotBtn = document.getElementById('add-iot-btn');
        if (addIotBtn) addIotBtn.style.display = 'none';
      }
      // Para cima/baixo (opcional)
      let deltaY = e.screenY - mouseDownY;
      if (deltaY < -50) {
        // Swipe cima: IoT
        fecharFormularioIot();
        fecharFormularioCalendario();
        document.getElementById('iotMain').style.display = 'block';
        document.getElementById('calendarMain').style.display = 'none';
        document.getElementById('painel-chat').style.display = 'none';
        mostrarVideoFundo('iot');
        const addIotBtn = document.getElementById('add-iot-btn');
        if (addIotBtn) addIotBtn.style.display = 'flex';
        const iotContent = document.getElementById('iotContent');
        if (iotContent) iotContent.style.display = 'flex';
      }
      if (deltaY > 50) {
        // Swipe baixo: chat
        fecharFormularioIot();
        fecharFormularioCalendario();
        document.getElementById('painel-chat').style.display = 'flex';
        document.getElementById('calendarMain').style.display = 'none';
        document.getElementById('iotMain').style.display = 'none';
        mostrarVideoFundo('chat');
        const addIotBtn = document.getElementById('add-iot-btn');
        if (addIotBtn) addIotBtn.style.display = 'none';
      }
      mouseDownX = null;
      mouseDownY = null;
      mouseDownEdge = false;
    }
  });

  // Botão de adicionar evento: abre formulário e vídeo do formulário
  document.getElementById('add-event-btn').addEventListener('click', function() {
    document.getElementById('calendar-container').style.display = 'none';
    document.getElementById('event-form').style.display = 'flex';
    document.getElementById('eventKeyboardWrapper').style.display = 'block';
    document.getElementById('event-name').focus();
    mostrarVideoFundo('formulario');
  });

  // Botão cancelar do formulário: só fecha o formulário e volta o calendário, NÃO troca vídeo
  document.getElementById('cancel-event-btn').addEventListener('click', function() {
    document.getElementById('event-form').style.display = 'none';
    document.getElementById('calendar-container').style.display = 'block';
    mostrarVideoFundo('calendario'); // <-- reforça o vídeo do calendário
  });

  // Troca de mês no calendário: reforça vídeo do calendário
  document.getElementById('prev').addEventListener('click', function() {
    // ...sua lógica de mês anterior...
    mostrarVideoFundo('calendario');
  });
  document.getElementById('next').addEventListener('click', function() {
    // ...sua lógica de mês seguinte...
    mostrarVideoFundo('calendario');
  });

  // Outras ações: mantenha o vídeo do chat como padrão

  // Centralize inicializações e listeners aqui para evitar múltiplos DOMContentLoaded
  // Exemplo: inicialize todos os botões, eventos SSE, teclado, etc.
  // Use delegação para listas dinâmicas:
  document.getElementById('event-list').addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-event-btn')) {
      // ...existing code...
    }
  });
});

function adicionarMensagem(texto, tipo) {
  const wrapper = document.getElementById('respostaWrapper');
  const div = document.createElement('div');
  div.className = 'mensagem ' + tipo;
  div.textContent = texto;
  wrapper.appendChild(div);
  wrapper.scrollTop = wrapper.scrollHeight;
}

async function enviarMensagem(mensagem) {
  adicionarMensagem(mensagem, 'usuario');
  try {
    await fetch('http://192.168.1.100:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem })
    });
    // Não exiba resposta aqui! Ela virá pelo SSE.
  } catch (error) {
    adicionarMensagem('Erro: ' + error.message, 'assistente');
    console.error('Erro completo:', error);
  }
}

// Função para adicionar mensagem na interface
function addMessageToUI(text, sender = 'assistente') {
  const respostaWrapper = document.getElementById('respostaWrapper');
  if (!respostaWrapper) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = sender === 'usuario' ? 'msg-usuario' : 'msg-assistente';
  msgDiv.textContent = text;
  respostaWrapper.appendChild(msgDiv);
  respostaWrapper.scrollTop = respostaWrapper.scrollHeight;
}

// Função central para exibir e falar a resposta do assistente
function handleAssistantVoiceResponse(text) {
  addMessageToUI(text, 'assistente');
}

// Quando o assistente de voz responder:
function handleAssistantVoiceResponse(text) {
  addMessageToUI(text, 'assistente'); // Sempre exibe a resposta no chat
}

// Quando o usuário enviar mensagem pelo teclado:
document.getElementById('input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const userText = this.value.trim();
    if (!userText) return;
    addMessageToUI(userText, 'usuario');
    this.value = '';
    // Envie para o servidor e trate a resposta centralizadamente
    processUserMessage(userText).then(assistantResponse => {
      handleAssistantVoiceResponse(assistantResponse);
    });
  }
});

// Supondo que você tenha algo assim para reconhecimento de voz:
function onVoiceInputResult(text) {
  if (!text) return;
  adicionarMensagem(text, 'usuario'); // Mostra a mensagem do usuário no chat
  processUserMessage(text);
}

// Exemplo para OpenWeatherMap
function atualizarClimaOWM() {
  const cidade = "Brasopolis,BR";
  const apiKey = "1f7290d4e0cf075771d32afdbdc31007";
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&lang=pt_br&units=metric`)
    .then(res => res.json())
    .then(dados => {
      if (dados.weather && dados.weather.length > 0) {
        const icon = dados.weather[0].icon;
        const desc = dados.weather[0].description;
        const temp = Math.round(dados.main.temp);
        const nomeCidade = dados.name;
        document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        document.getElementById('weatherIcon').style.display = 'inline';
        document.getElementById('weatherCidade').textContent = nomeCidade;
        document.getElementById('weatherTemp').textContent = ` ${temp}°C`;
        document.getElementById('weatherDesc').textContent = ` ${desc.charAt(0).toUpperCase() + desc.slice(1)}`;
      } else {
        document.getElementById('weatherCidade').textContent = "";
        document.getElementById('weatherTemp').textContent = "";
        document.getElementById('weatherDesc').textContent = "Clima indisponível";
        document.getElementById('weatherIcon').style.display = 'none';
      }
    })
    .catch(() => {
      document.getElementById('weatherCidade').textContent = "";
      document.getElementById('weatherTemp').textContent = "";
      document.getElementById('weatherDesc').textContent = "Clima indisponível";
      document.getElementById('weatherIcon').style.display = 'none';
    });
}

document.addEventListener('DOMContentLoaded', atualizarClimaOWM);

const traducaoClima = {
  "Partly cloudy": "Parcialmente nublado",
  "Clear": "Céu limpo",
  "Sunny": "Ensolarado",
  "Cloudy": "Nublado",
  "Overcast": "Encoberto",
  "Mist": "Névoa",
  "Patchy rain possible": "Possibilidade de chuva isolada",
  "Light rain": "Chuva leve",
  "Moderate rain": "Chuva moderada",
  "Heavy rain": "Chuva forte",
  "Thunderstorm": "Trovoada",
  "Fog": "Nevoeiro",
  "Snow": "Neve",
  "Light snow": "Neve leve",
  "Heavy snow": "Neve forte",
  // Adicione mais traduções conforme necessário
};

let _servidorOffline = false;

function checarStatusServidor() {
  fetch('http://192.168.1.100:5000/eventos', { method: 'GET' })
    .then(res => {
      if (res.ok) {
        document.getElementById('server-status').classList.add('online');
        document.getElementById('server-status').classList.remove('offline');
        // Se estava offline e voltou, recarrega a página
        if (_servidorOffline) {
          window.location.reload();
        }
        _servidorOffline = false;
      } else {
        document.getElementById('server-status').classList.add('offline');
        document.getElementById('server-status').classList.remove('online');
        _servidorOffline = true;
      }
    })
    .catch(() => {
      document.getElementById('server-status').classList.add('offline');
      document.getElementById('server-status').classList.remove('online');
      _servidorOffline = true;
    });
}

// Checa ao carregar e a cada 10 segundos
document.addEventListener('DOMContentLoaded', () => {
  checarStatusServidor();
  setInterval(checarStatusServidor, 10000);
});

// Botão para fechar IoT
document.addEventListener('DOMContentLoaded', function() {
  const fecharIot = document.getElementById('fecharIot');
  if (fecharIot) {
    fecharIot.onclick = function() {
      document.getElementById('iotMain').style.display = 'none';
      document.getElementById('painel-chat').style.display = 'flex';
    };
  }
});

function fecharFormularioIot() {
  const iotForm = document.getElementById('iotForm');
  const iotKeyboardWrapper = document.getElementById('iotKeyboardWrapper');
  const addIotBtn = document.getElementById('add-iot-btn');
  const iotContent = document.getElementById('iotContent');
  if (iotForm) iotForm.style.display = 'none';
  if (iotKeyboardWrapper) iotKeyboardWrapper.style.display = 'none';
  if (addIotBtn) addIotBtn.style.display = 'flex';
  if (iotContent) iotContent.style.display = 'flex';
}

function fecharFormularioCalendario() {
  const eventForm = document.getElementById('event-form');
  const eventKeyboardWrapper = document.getElementById('eventKeyboardWrapper');
  const calendarContainer = document.getElementById('calendar-container');
  const addEventBtn = document.getElementById('add-event-btn');
  if (eventForm) eventForm.style.display = 'none';
  if (eventKeyboardWrapper) eventKeyboardWrapper.style.display = 'none';
  if (calendarContainer) calendarContainer.style.display = 'block';
  if (addEventBtn) addEventBtn.style.display = 'block';
  // Se quiser garantir que os eventos do mês estejam visíveis, pode chamar sua função de renderização aqui:
  // renderizarEventosDoMesAtual();
}

// Adiciona mensagens do chat de voz em tempo real usando SSE
function iniciarVoiceStream() {
  if (typeof EventSource === "undefined") return;
  try {
    const evtSource = new EventSource("http://192.168.1.100:5001/voice-stream");
    evtSource.onmessage = function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data && data.tipo === "comando") {
          if (data.texto === "abrir_calendario") {
            document.getElementById('calendarMain').style.display = 'block';
            document.getElementById('painel-chat').style.display = 'none';
            document.getElementById('iotMain').style.display = 'none';
            mostrarVideoFundo('calendario');
            const addIotBtn = document.getElementById('add-iot-btn');
            if (addIotBtn) addIotBtn.style.display = 'none';
          }
          if (data.texto === "abrir_chat") {
            document.getElementById('painel-chat').style.display = 'flex';
            document.getElementById('calendarMain').style.display = 'none';
            document.getElementById('iotMain').style.display = 'none';
            mostrarVideoFundo('chat');
            const addIotBtn = document.getElementById('add-iot-btn');
            if (addIotBtn) addIotBtn.style.display = 'none';
          }
          if (data.texto === "abrir_iot") {
            document.getElementById('iotMain').style.display = 'block';
            document.getElementById('calendarMain').style.display = 'none';
            document.getElementById('painel-chat').style.display = 'none';
            mostrarVideoFundo('iot');
            const addIotBtn = document.getElementById('add-iot-btn');
            if (addIotBtn) addIotBtn.style.display = 'flex';
          }
        }
        // ...restante do código...
      } catch (e) {}
    };
    evtSource.onerror = function() {
      setTimeout(iniciarVoiceStream, 3000);
    };
  } catch (e) {}
}

// Função para processar mensagem do usuário (input ou voz)
async function processUserMessage(userText) {
  try {
    await fetch('http://192.168.1.100:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem: userText })
    });
    // Não exiba resposta aqui! Ela virá pelo SSE.
  } catch (error) {
    adicionarMensagem('Erro: ' + error.message, 'assistente');
    console.error('Erro completo:', error);
  }
}

// Função para carregar histórico do chat do backend e exibir na interface
async function carregarHistoricoChat() {
  try {
    const resp = await fetch('http://192.168.1.100:5000/historico');
    if (!resp.ok) return;
    const historico = await resp.json();
    const wrapper = document.getElementById('respostaWrapper');
    if (!wrapper) return;
    wrapper.innerHTML = ''; // Limpa o chat
    historico.forEach(item => {
      adicionarMensagem(item.pergunta, 'usuario');
      adicionarMensagem(item.resposta, 'assistente');
    });
    wrapper.scrollTop = wrapper.scrollHeight;
  } catch (e) {
    // Se falhar, apenas ignora
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarHistoricoChat(); // Carrega histórico ao abrir/recarregar a página
  // ...existing code...
  iniciarVoiceStream();

  const input = document.getElementById('input');
  if (input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && input.value.trim()) {
        const userText = input.value.trim();
        adicionarMensagem(userText, 'usuario');
        input.value = '';
        processUserMessage(userText);
      }
    });
  }
});

// Exemplo: clique em um dia do calendário
document.querySelectorAll('.calendar-day').forEach(function(dia) {
  dia.addEventListener('click', function() {
    // Remove a seleção de todos os dias
    document.querySelectorAll('.calendar-day.selected').forEach(function(sel) {
      sel.classList.remove('selected');      sel.classList.remove('selected');
    });
    // Adiciona a seleção ao dia clicado
    this.classList.add('selected');
  });
});

// Exemplo: clique em um card de evento
document.querySelectorAll('.evento-card').forEach(function(card) {
  card.addEventListener('click', function(e) {
    // Apenas mostra detalhes do evento
    // NÃO chame mostrarVideoFundo aqui!
    mostrarDetalhesDoEvento(this.dataset.eventId);
  });
});


document.getElementById('event-list').addEventListener('click', function(e) {
  if (e.target.classList.contains('delete-event-btn')) {
    // ...sua lógica para apagar o evento...
    document.getElementById('calendarMain').style.display = 'block';
    mostrarVideoFundo('calendario');
  }
});

document.querySelectorAll('.delete-event-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    // ...sua lógica para apagar o evento...
    document.getElementById('calendarMain').style.display = 'block';
    mostrarVideoFundo('calendario'); // reforça o vídeo do calendário
  });
});

// Delegação para todos os botões "Cancelar" e "Apagar" dentro do calendário
document.getElementById('calendarMain').addEventListener('click', function(e) {
  if (
    e.target.matches('button') &&
    (
      e.target.textContent.trim().toLowerCase() === 'cancelar' ||
      e.target.textContent.trim().toLowerCase() === 'apagar'
    )
  ) {
    // Esconde o formulário se for o caso
    const eventForm = document.getElementById('event-form');
    if (eventForm) eventForm.style.display = 'none';
    // Exibe o calendário principal
    document.getElementById('calendarMain').style.display = 'block';
    // Reforça o vídeo do calendário
    mostrarVideoFundo('calendario');
  }
});

function checarVozStatus() {
  fetch('http://192.168.1.100:5000/voz-status') // <-- Corrigido para URL absoluta
    .then(resp => resp.json())
    .then(data => {
      const el = document.getElementById('voz-status');
      if (el) {
        el.innerHTML = '';
        if (data.conectado === true) {
          el.classList.add('online');
          el.classList.remove('offline');
        } else {
          el.classList.add('offline');
          el.classList.remove('online');
        }
      }
    })
    .catch(() => {
      const el = document.getElementById('voz-status');
      if (el) {
        el.innerHTML = '';
        el.classList.add('offline');
        el.classList.remove('online');
      }
    });
}
setInterval(checarVozStatus, 5000);
checarVozStatus();

function mostrarVideoFundo() {
  // Implemente aqui ou deixe vazio para não dar erro
}

document.addEventListener('DOMContentLoaded', function() {

  const cancelarBtn = document.getElementById('cancelarIotBtn');

  // Ao clicar no botão, mostra o formulário e esconde o botão
  const addIotBtn = document.getElementById('add-iot-btn');
  if (addIotBtn) {
    addIotBtn.addEventListener('click', function() {
      if (iotForm) iotForm.style.display = 'block';
      if (iotKeyboardWrapper) iotKeyboardWrapper.style.display = 'flex';
      addIotBtn.style.display = 'none';
      // Se quiser focar no primeiro campo:
      const input = iotForm.querySelector('input, textarea');
      if (input) input.focus();
      // Troca o vídeo de fundo se desejar:
      if (typeof mostrarVideoFundo === 'function') mostrarVideoFundo('formulario');
    });
  }

  // Ao salvar ou cancelar, mostra o botão novamente
  if (cancelarBtn) {
    cancelarBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (iotForm) iotForm.style.display = 'none';
      if (iotKeyboardWrapper) iotKeyboardWrapper.style.display = 'none';
      if (addIotBtn) addIotBtn.style.display = 'flex';
    });
  }
  if (iotForm) {
    iotForm.addEventListener('submit', function(e) {
      // ...sua lógica de salvar...
      if (iotForm) iotForm.style.display = 'none';
      if (iotKeyboardWrapper) iotKeyboardWrapper.style.display = 'none';
      if (addIotBtn) addIotBtn.style.display = 'flex';
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const addIotBtn = document.getElementById('add-iot-btn');
  const iotForm = document.getElementById('iotForm');
  const iotKeyboardWrapper = document.getElementById('iotKeyboardWrapper');
  const formVideo = document.getElementById('form-video');
  const chatVideo = document.getElementById('chat-video');
  const calendarVideo = document.getElementById('calendar-video');
  const iotVideo = document.getElementById('iot-video');
  const cancelarBtn = document.getElementById('cancelarIotBtn');

  // Garante que todos os vídeos começam ocultos, exceto o chat
  function mostrarVideoFundo(tipo) {
    if (chatVideo) chatVideo.style.display = 'none';
    if (calendarVideo) calendarVideo.style.display = 'none';
    if (formVideo) formVideo.style.display = 'none';
    if (iotVideo) iotVideo.style.display = 'none';
    if (tipo === 'formulario' && formVideo) formVideo.style.display = 'block';
    if (tipo === 'chat' && chatVideo) chatVideo.style.display = 'block';
    if (tipo === 'calendario' && calendarVideo) calendarVideo.style.display = 'block';
    if (tipo === 'iot' && iotVideo) iotVideo.style.display = 'block';
  }

  // Ao clicar no botão, mostra o formulário, teclado e vídeo do formulário
  if (addIotBtn) {
    addIotBtn.addEventListener('click', function() {
      if (iotForm) iotForm.style.display = 'block';
      if (iotKeyboardWrapper) iotKeyboardWrapper.style.display = 'flex';
      addIotBtn.style.display = 'none';
      // Não altere o display dos cards!
      // Se quiser focar no primeiro campo:
      const input = iotForm.querySelector('input, textarea');
      if (input) input.focus();
    });
  }

  // Ao cancelar ou salvar, volta para o vídeo IoT
  function cancelarFormularioIot() {
    if (iotForm) iotForm.style.display = 'none';
    if (iotKeyboardWrapper) iotKeyboardWrapper.style.display = 'none';
    if (addIotBtn) addIotBtn.style.display = 'flex';
    mostrarVideoFundo('iot');
  }

  if (cancelarBtn) {
    cancelarBtn.addEventListener('click', function(e) {
      e.preventDefault();
      cancelarFormularioIot();
    });
  }
  if (iotForm) {
    iotForm.addEventListener('submit', function(e) {
      // ...sua lógica de salvar...
      cancelarFormularioIot();
    });
  }
});

function iniciarEventosSSE() {
  if (typeof EventSource === "undefined") return;
  try {
    const evtSource = new EventSource("http://192.168.1.100:5000/eventos-sse");
    evtSource.onmessage = function(event) {
      try {
        const data = JSON.parse(event.data);
        // Atualize o painel de eventos conforme sua lógica
        atualizarPainelEventos(data);
        // Se receber sinal para atualizar o chat
        if (data && data.atualizar_chat) {
          carregarHistoricoChat();
        }
      } catch (e) {}
    };
    evtSource.onerror = function() {
      setTimeout(iniciarEventosSSE, 3000);
    };
  } catch (e) {}
}

function atualizarPainelEventos(eventos) {
  // Implemente a lógica para atualizar a UI do calendário/eventos
  // Exemplo:
  const lista = document.getElementById('event-list');
  if (!lista) return;
  lista.innerHTML = '';
  eventos.forEach(ev => {
    const li = document.createElement('li');
    li.textContent = `${ev.nome} - ${ev.data_hora}`;
    lista.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', iniciarEventosSSE);

// Remova ou comente a função abaixo para evitar conflito com a versão correta do JS principal
/*
async function carregarDispositivosIoT() {
  try {
    const resp = await fetch("http://192.168.1.100:5000/devices");
    const dispositivos = await resp.json();
    const container = document.getElementById('iotContent');
    container.innerHTML = '';
    if (dispositivos.length === 0) {
      container.innerHTML = '<div style="color:#fff;opacity:0.7;">Nenhum dispositivo cadastrado.</div>';
      return;
    }
    dispositivos.forEach(dev => {
      const card = document.createElement('div');
      card.className = 'iot-card';
      card.innerHTML = `
        <strong>${dev.nome || 'Sem nome'}</strong><br>
        ID: ${dev.id || ''}<br>
        Tipo: ${dev.tipo || ''}<br>
        <span style="font-size:0.9em;color:#ccc;">${dev.obs || ''}</span>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    console.error('Erro ao carregar dispositivos IoT:', e);
    document.getElementById('iotContent').innerHTML = '<div style="color:#fff;background:#c00;padding:8px;border-radius:8px;">Erro ao carregar dispositivos.</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Oculta o painel IoT e o botão ao carregar
  document.getElementById('iotMain').style.display = 'none';
  const addIotBtn = document.getElementById('add-iot-btn');
  if (addIotBtn) addIotBtn.style.display = 'none';
  carregarDispositivosIoT(); // Carrega dispositivos IoT ao iniciar
});
*/

// Configurações persistentes
const configPadrao = {
  notificacoesSonoras: true,
  volumeVoz: 1,
  vozAssistente: true
};
function carregarConfigChat() {
  try {
    return JSON.parse(localStorage.getItem('configChat')) || {...configPadrao};
  } catch {
    return {...configPadrao};
  }
}
function salvarConfigChat(cfg) {
  localStorage.setItem('configChat', JSON.stringify(cfg));
}

let configChat = carregarConfigChat();

// Função para alterar o volume do sistema via API da interface de voz
function setVolumeDispositivo(valor) {
  // Altera o volume de todos os elementos <audio> e <video> localmente
  document.querySelectorAll('audio, video').forEach(el => {
    el.volume = valor;
  });
  // Envia para a interface de voz (backend Python)
  fetch('http://localhost:5001/set-volume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ volume: valor })
  }).catch(() => {});
}

// Modal de configuração
function mostrarConfigChat() {
  const modal = document.getElementById('config-modal');
  if (!modal) return;

  // Preenche os campos do modal com os valores atuais
  document.getElementById('config-notif-chat').checked = !!configChat.notificacoesSonoras;
  document.getElementById('config-volume-chat').value = configChat.volumeVoz;
  document.getElementById('config-volume-chat-label').textContent = Math.round(configChat.volumeVoz * 100) + '%';

  // Listeners dos controles
  document.getElementById('config-notif-chat').onchange = function() {
    configChat.notificacoesSonoras = this.checked;
    salvarConfigChat(configChat);
  };
  document.getElementById('config-volume-chat').oninput = function() {
    configChat.volumeVoz = parseFloat(this.value);
    document.getElementById('config-volume-chat-label').textContent = Math.round(this.value * 100) + '%';
    salvarConfigChat(configChat);
    setVolumeDispositivo(configChat.volumeVoz); // <-- Envia para o Python ao alterar o slider
  };
  document.getElementById('config-brilho-chat').oninput = function() {
    const valor = parseFloat(this.value);
    document.getElementById('config-brilho-chat-label').textContent = Math.round(valor * 100) + '%';
    // Aqui você pode aplicar o brilho, por exemplo, no body:
    document.body.style.filter = `brightness(${0.5 + valor * 0.5})`;
  };

  document.getElementById('btn-clear-historico').onclick = function() {
    // Adicione aqui a lógica para limpar o histórico do chat
  };
  document.getElementById('fechar-config-chat').onclick = function() {
    modal.style.display = 'none';
  };

  modal.style.display = 'flex';
}

// Listener do botão de configuração
document.addEventListener('DOMContentLoaded', function() {
  const btnConfig = document.getElementById('btn-config-chat');
  if (btnConfig) {
    btnConfig.addEventListener('click', mostrarConfigChat);
  }
});

// Notificação sonora e voz do evento usando interface de voz
function notificarEvento(texto) {
  // Só envia se notificações sonoras estiverem ativadas
  if (!configChat.notificacoesSonoras) return;
  fetch('http://localhost:5001/voice-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto: texto, tipo: 'assistente' })
  }).catch(() => {});
  // Ajusta o volume do sistema via API
  setVolumeDispositivo(configChat.volumeVoz);
  // Não usa mais o Web Speech API local para falar o evento
}

// Exemplo: chamada quando chega a hora de um evento
function checarEventosProximos(eventos) {
  const agora = new Date();
  eventos.forEach(ev => {
    const [data, hora] = ev.data_hora.split(' ');
    const eventoDate = new Date(data + 'T' + (hora || '00:00'));
    // Se o evento é agora (tolerância de 1 minuto)
    if (Math.abs(eventoDate - agora) < 60000 && !ev.notificado) {
      notificarEvento(`Evento: ${ev.nome} em ${ev.data_hora}`);
      ev.notificado = true; // Marque como notificado para não repetir
    }
  });
}

// Chame checarEventosProximos(eventos) a cada minuto junto com sua lógica de eventos
setInterval(() => {
  fetch('http://192.168.1.100:5000/eventos')
    .then(resp => resp.json())
    .then(eventos => checarEventosProximos(eventos));
}, 60000);
// Chame checarEventosProximos(eventos) a cada minuto junto com sua lógica de eventos
setInterval(() => {
  fetch('http://192.168.1.100:5000/eventos')
    .then(resp => resp.json())
    .then(eventos => checarEventosProximos(eventos));
}, 60000);

// Delegação para botões de apagar evento na lista de eventos
document.addEventListener('DOMContentLoaded', function() {
  const eventList = document.getElementById('event-list');
  if (eventList) {
    eventList.addEventListener('click', function(e) {
      if (e.target.classList.contains('delete-event-btn')) {
        // Sempre usa o modal customizado, nunca confirm()
        window.showDeleteEventModal(function() {
          const eventId = e.target.dataset.eventId || e.target.getAttribute('data-event-id');
          if (eventId) {
            deletarEventoPorId(eventId);
          }
        });
      }
    });
  }
});

// Exemplo de função de deleção (ajuste conforme sua lógica)
function deletarEventoPorId(eventId) {
  // ...sua lógica para deletar o evento no backend...
  // Após deletar, atualize a lista de eventos conforme necessário
  // Exemplo:
  fetch(`http://192.168.1.100:5000/eventos/${eventId}`, { method: 'DELETE' })
    .then(resp => {
      // Atualize a UI após deletar
      // ...exemplo: recarregar eventos...
      // atualizarPainelEventos();
    });
}

document.addEventListener('DOMContentLoaded', function() {
  // ...existing code...

  // Ao clicar no botão "Limpar histórico", mostra o card de confirmação customizado
  const btnClearHistorico = document.getElementById('btn-clear-historico');
  if (btnClearHistorico) {
    btnClearHistorico.addEventListener('click', function() {
      // Mostra o card/modal customizado de confirmação para limpar histórico
      const modal = document.getElementById('confirm-clear-modal');
      modal.style.display = 'flex';
      const btnConfirm = document.getElementById('confirm-clear-btn');
      const btnCancel = document.getElementById('cancel-clear-btn');
      // Remove listeners antigos
      btnConfirm.onclick = null;
      btnCancel.onclick = null;
      btnConfirm.onclick = function() {
        modal.style.display = 'none';
        // Chama o backend para limpar o histórico
        fetch('http://192.168.1.100:5000/limpar-historico', { method: 'POST' })
          .then(resp => resp.json())
          .then(data => {
            if (data.ok) {
              carregarHistoricoChat(); // Atualiza a interface
              
            } else {
              alert('Falha ao apagar histórico!');
            }
          })
          .catch(() => alert('Erro ao conectar ao servidor!'));
      };
      btnCancel.onclick = function() {
        modal.style.display = 'none';
      };
    });
  }

  // ...existing code...
});
