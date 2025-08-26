// Mova estas variáveis para o topo do arquivo, antes de qualquer função ou uso delas:
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
document.addEventListener('DOMContentLoaded', () => {
  carregarEventosDoServidor(); // <-- Adicione esta linha logo no início

  const calendarGrid = document.getElementById("calendar");
  const monthYearElement = document.getElementById("month-year");
  const eventList = document.getElementById("event-list");
  const eventSection = document.getElementById('eventSection');
  const addEventBtn = document.getElementById('add-event-btn');
  const eventForm = document.getElementById('event-form');
  const eventNameInput = document.getElementById('event-name');
  const eventDayInput = document.getElementById('event-day');
  const eventTimeInput = document.getElementById('event-time');
  const eventKeyboardWrapper = document.getElementById('eventKeyboardWrapper');
  const eventKeyboard = document.getElementById('event-keyboard');
  const calendarContainer = document.getElementById('calendar-container');
  const cancelEventBtn = document.getElementById('cancel-event-btn');

  let eventos = {}; // { 'YYYY-MM-DD': [ {hora, descricao} ] }
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let selectedDate = null;
  let modoTecladoEvento = 'letras';

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  function updateCalendarHeader(month, year) {
    if (monthYearElement)
      monthYearElement.textContent = `${monthNames[month]} ${year}`;
  }

  function renderizarCalendario(month = currentMonth, year = currentYear, eventosDoBanco = []) {
    const calendarGrid = document.getElementById('calendar');
    calendarGrid.innerHTML = '';

    document.getElementById('month-year').textContent = `${monthNames[month]} ${year}`;

    const primeiroDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemana = primeiroDia.getDay();

    // Espaços em branco antes do primeiro dia
    for (let i = 0; i < diaSemana; i++) {
      const vazio = document.createElement('div');
      vazio.className = 'dia vazio';
      calendarGrid.appendChild(vazio);
    }

    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const diaElemento = document.createElement('div');
      diaElemento.textContent = dia;
      diaElemento.classList.add('dia');

      const dataStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

      // Verifica se é feriado
      const feriadoBanco = eventosDoBanco.find(ev =>
        ev.data_hora && ev.data_hora.startsWith(dataStr) &&
        (ev.nome && ev.nome.toLowerCase().includes('feriado') ||
          ev.nome && [
            "ano novo", "carnaval", "sexta-feira santa", "tiradentes", "dia do trabalho",
            "corpus christi", "independência", "nossa sra. aparecida", "finados",
            "proclamação da república", "natal", "dia dos pais"
          ].some(nomeFeriado => ev.nome.toLowerCase().includes(nomeFeriado))
        )
      );
      if (feriadoBanco) {
        diaElemento.classList.add('feriado');
        diaElemento.title = feriadoBanco.nome;
        diaElemento.style.border = "2.5px solid #c00"; // Borda vermelha para feriado
      }

      // Verifica se existe evento comum neste dia
      const eventosDoDia = eventosDoBanco.filter(ev =>
        ev.data_hora && ev.data_hora.startsWith(dataStr) && !(
          ev.nome && (
            ev.nome.toLowerCase().includes('feriado') ||
            [
              "ano novo", "carnaval", "sexta-feira santa", "tiradentes", "dia do trabalho",
              "corpus christi", "independência", "nossa sra. aparecida", "finados",
              "proclamação da república", "natal", "dia dos pais"
            ].some(nomeFeriado => ev.nome.toLowerCase().includes(nomeFeriado))
          )
        )
      );
      if (eventosDoDia.length > 0) {
        diaElemento.style.border = "2.5px solid white";
        diaElemento.style.color = "#fff";
        diaElemento.title = eventosDoDia.map(ev => ev.nome).join(', ');
      }

      diaElemento.addEventListener('click', function() {
        document.querySelectorAll('.dia.selecionado').forEach(el => el.classList.remove('selecionado'));
        diaElemento.classList.add('selecionado');
        document.getElementById('add-event-btn').style.display = 'flex';
        const dataSelecionada = `${year}-${String(month + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        document.getElementById('event-day').value = dataSelecionada;
      });
      calendarGrid.appendChild(diaElemento);
    }
  }

  function renderizarEventos() {
    eventList.innerHTML = "";
    let temEvento = false;

    Object.keys(eventos).sort().forEach(data => {
      eventos[data].forEach(evento => {
        temEvento = true;
        const li = document.createElement("li");
        li.className = "evento-item";

        function formatarData(dataStr) {
          const [ano, mes, dia] = dataStr.split("-");
          return `${dia}/${mes}/${ano.slice(-2)}`;
        }

        li.innerHTML = `
          <div class="evento-cabecalho">
            <span class="evento-data">${formatarData(data)}</span>
            <span class="evento-hora">${evento.hora}</span>
          </div>
          <div class="evento-descricao">${evento.descricao}</div>
        `;
        eventList.appendChild(li);
      });
    });

    if (!temEvento) {
      const li = document.createElement("li");
      li.textContent = "Nenhum evento cadastrado.";
      eventList.appendChild(li);
    }
  }

  // Ao clicar para adicionar evento
  if (addEventBtn) {
    addEventBtn.addEventListener('click', () => {
      eventSection.classList.add('event-form-ativo');
      eventForm.style.display = 'flex';
      eventList.style.display = "none";
      addEventBtn.style.display = "none";
      eventSection.classList.remove('event-lista');
      eventSection.classList.add('event-formulario');
      eventKeyboardWrapper.style.display = 'block';
      criarTecladoEvento();
      eventNameInput.focus();
      // Troca o vídeo de fundo para o do formulário
      mostrarVideoFundo('form-video');
    });
  }

  // Ao cancelar ou salvar evento
  if (cancelEventBtn) {
    cancelEventBtn.addEventListener('click', () => {
      eventSection.classList.remove('event-form-ativo');
      eventForm.style.display = 'none';
      eventList.style.display = "block";
      addEventBtn.style.display = "flex";
      eventSection.classList.remove('event-formulario');
      eventSection.classList.add('event-lista');
      eventKeyboardWrapper.style.display = 'none';
      calendarContainer.classList.remove('oculto');
      mostrarVideoFundo('calendario');
    });
  }

  // Função para buscar todos os eventos do servidor e exibir em .evento-card
  function carregarEventosDoServidor() {
    fetch('http://192.168.1.100:5000/eventos')
      .then(res => res.json())
      .then(eventos => {
        const eventList = document.getElementById('event-list');
        eventList.innerHTML = '';
        if (eventos && eventos.length > 0) {
          eventos.forEach(ev => {
            let data = '', hora = '';
            if (ev.data_hora) {
              const partes = ev.data_hora.split(' ');
              data = partes[0].split('-').reverse().join('/');
              hora = partes[1] || '';
            }
            const li = document.createElement('li');
            const nomesFeriados = [
              "ano novo", "carnaval", "sexta-feira santa", "tiradentes", "dia do trabalho",
              "corpus christi", "independência", "nossa sra. aparecida", "finados",
              "proclamação da república", "natal", "dia dos pais"
            ];
            const isFeriado = ev.nome && nomesFeriados.some(nomeFeriado => ev.nome.toLowerCase().includes(nomeFeriado));
            li.className = "evento-card" + (isFeriado ? " feriado" : "");

            li.innerHTML = `
              <div class="evento-hora"><b>${data}</b> ${hora}</div>
              <div class="evento-descricao">${ev.nome}</div>
            `;

            // Evento de clique para mostrar botões
            li.addEventListener('click', function (e) {
              // Remove todos os botoes de outros cards antes de abrir o atual
              document.querySelectorAll('.evento-botoes').forEach(b => b.remove());

              // Evita duplicar botões se já existirem neste card
              if (li.querySelector('.evento-botoes')) return;

              // Cria container dos botões
              const botoes = document.createElement('div');
              botoes.className = 'evento-botoes';
              botoes.style.marginTop = '10px';

              // Botão Cancelar
              const btnCancelar = document.createElement('button');
              btnCancelar.className = 'btn-cancelar-evento';
              btnCancelar.textContent = 'Cancelar';
              btnCancelar.onclick = function (evBtn) {
                evBtn.stopPropagation();
                botoes.remove();
              };

              // Botão Apagar
              const btnApagar = document.createElement('button');
              btnApagar.className = 'btn-apagar-evento';
              btnApagar.textContent = 'Apagar';
              btnApagar.style.marginLeft = '10px';
              btnApagar.onclick = function (evBtn) {
                evBtn.stopPropagation();
                window.showDeleteEventModal(function() {
                  fetch(`http://192.168.1.100:5000/eventos/${ev.id}`, {
                    method: 'DELETE'
                  })
                  .then(response => {
                    if (!response.ok) throw new Error('Erro ao apagar evento');
                    li.remove();
                  })
                  .catch(() => {
                    // Opcional: mostrar erro customizado na interface
                  });
                });
              };

              botoes.appendChild(btnCancelar);
              botoes.appendChild(btnApagar);
              li.appendChild(botoes);
            });

            eventList.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.className = "evento-vazio";
          li.textContent = "Nenhum evento cadastrado.";
          eventList.appendChild(li);
        }
      })
      .catch(() => {
        const eventList = document.getElementById('event-list');
        eventList.innerHTML = '<li>Erro ao carregar eventos do servidor.</li>';
      });
  }

  // Função para enviar novo evento ao servidor
  function salvarEventoNoServidor(data, hora, descricao) {
    return fetch('http://192.168.1.100:5000/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, hora, descricao })
    });
  }

  // Ao salvar evento, envie a cor e recarregue os eventos do mês
  document.getElementById('event-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const nomeInput = document.getElementById('event-name');
    const diaInput = document.getElementById('event-day');
    const horaInput = document.getElementById('event-time');
    const colorInput = document.getElementById('event-color');
    const nome = nomeInput ? nomeInput.value.trim() : '';
    const dia = diaInput ? diaInput.value : '';
    const hora = horaInput ? horaInput.value : '';
    const cor = colorInput ? (colorInput.value || "#2196f3") : "#2196f3";

    if (!dia || !hora || !nome) {
      alert("Preencha todos os campos!");
      return;
    }

    fetch('http://192.168.1.100:5000/eventos')
      .then(res => res.json())
      .then(eventos => {
        const existe = eventos.some(ev =>
          ev.nome && ev.nome.trim().toLowerCase() === nome.toLowerCase() &&
          ev.data_hora && ev.data_hora.startsWith(dia)
        );
        if (existe) {
          alert("Já existe um evento com esse nome nesta data!");
          renderizarEventosDoMes(currentMonth, currentYear, eventos);
          return;
        }

        // Inclua a cor ao salvar
        fetch('http://192.168.1.100:5000/eventos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: nome,
            data_hora: dia + ' ' + hora,
            cor: cor // <-- aqui!
          })
        })
        .then(response => {
          if (!response.ok) throw new Error('Erro ao salvar evento');
          eventForm.reset();
          document.getElementById('cancel-event-btn').click();
          fetch('http://192.168.1.100:5000/eventos')
            .then(res => res.json())
            .then(eventosDoBanco => {
              renderizarEventosDoMes(currentMonth, currentYear, eventosDoBanco);
              renderizarCalendario(currentMonth, currentYear, eventosDoBanco); // <-- atualiza o calendário!
            });
        })
        .catch(() => {
          alert("Erro ao salvar evento no servidor!");
        });
      });
  });

  document.getElementById('prev').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    fetch('http://192.168.1.100:5000/eventos')
      .then(res => res.json())
      .then(eventosDoBanco => {
        renderizarCalendario(currentMonth, currentYear, eventosDoBanco);
        renderizarEventosDoMes(currentMonth, currentYear, eventosDoBanco);
      });
  });

  document.getElementById('next').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    fetch('http://192.168.1.100:5000/eventos')
      .then(res => res.json())
      .then(eventosDoBanco => {
        renderizarCalendario(currentMonth, currentYear, eventosDoBanco);
        renderizarEventosDoMes(currentMonth, currentYear, eventosDoBanco);
      });
  });

  // Ao carregar a página
  fetch('http://192.168.1.100:5000/eventos')
    .then(res => res.json())
    .then(eventosDoBanco => {
      renderizarCalendario(currentMonth, currentYear, eventosDoBanco);
      renderizarEventosDoMes(currentMonth, currentYear, eventosDoBanco);
    });

  const dateContainer = document.getElementById('input-roleta-date');
  if (dateContainer) {
    dateContainer.addEventListener('click', function () {
      const input = document.getElementById('event-day');
      if (input && input.showPicker) input.showPicker();
      else if (input) input.focus();
    });
  }

  const timeContainer = document.getElementById('input-roleta-time');
  if (timeContainer) {
    timeContainer.addEventListener('click', function () {
      const input = document.getElementById('event-time');
      if (input && input.showPicker) input.showPicker();
      else if (input) input.focus();
    });
  }

  const layoutLetras = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'ç'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '?', '⌫'],
    ['123', ' ', '´', '`', '~', '^', '!']
  ];

  const layoutNumeros = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '+', '*', '/', '=', '.', ',', '(', ')', '⌫'],
    ['ABC', ' ', '#', '@', '$', '%', '&', '_', '!']
  ];

  function criarTecladoEvento() {
    const layout = modoTecladoEvento === 'letras' ? layoutLetras : layoutNumeros;
    eventKeyboard.innerHTML = '';
    layout.forEach(linha => {
      const linhaDiv = document.createElement('div');
      linhaDiv.style.display = 'flex';
      linha.forEach(tecla => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = tecla === ' ' ? 'Espaço' : tecla;
        btn.style.margin = '2px';
        // Adiciona classes especiais para teclas largas
        if (tecla === ' ' || tecla === 'Espaço') btn.classList.add('tecla-espaco');
        if (tecla === 'Enviar') btn.classList.add('tecla-enviar');
        if (tecla === 'Cancelar') btn.classList.add('tecla-cancelar');
        // Adiciona classes para teclas pequenas
        if (tecla === 'ç') btn.classList.add('tecla-c-cedilha');
        if (tecla === '⌫') btn.classList.add('tecla-apagar');
        btn.onclick = () => {
          if (tecla === 'Espaço' || tecla === ' ') {
            eventNameInput.value += ' ';
          } else if (tecla === '⌫') {
            eventNameInput.value = eventNameInput.value.slice(0, -1);
          } else if (tecla === '123') {
            modoTecladoEvento = 'numeros';
            criarTecladoEvento();
          } else if (tecla === 'ABC') {
            modoTecladoEvento = 'letras';
            criarTecladoEvento();
          } else if (tecla === 'Cancelar') {
            eventNameInput.value = '';
          } else if (tecla !== 'Caps') {
            eventNameInput.value += tecla;
          }
          eventNameInput.focus();
        };
        linhaDiv.appendChild(btn);
      });
      eventKeyboard.appendChild(linhaDiv);
    });
  }

  document.addEventListener("click", function (e) {
    if (!calendarGrid.contains(e.target) && e.target !== addEventBtn) {
      selectedDate = null;
      addEventBtn.style.display = "none";
    }
  });

  // Carrega eventos do servidor e exibe eventos do mês atual e calendário ao iniciar
  function carregarEventosDoServidorEAtualizar() {
    fetch('http://192.168.1.100:5000/eventos')
      .then(res => res.json())
      .then(eventosDoBanco => {
        renderizarCalendario(currentMonth, currentYear, eventosDoBanco);
        renderizarEventosDoMes(currentMonth, currentYear, eventosDoBanco);
      });
  }

  // Substitua o fetch inicial por esta função
  carregarEventosDoServidorEAtualizar();

  // Ao apagar evento via SSE, recarregue eventos e calendário do mês atual
  function iniciarEventosSSE() {
    if (typeof EventSource === "undefined") return;
    try {
      const evtSource = new EventSource("http://192.168.1.100:5000/eventos-sse");
      evtSource.onmessage = function(event) {
        try {
          const data = JSON.parse(event.data);
          if (data && data.acao === "deletar" && data.id) {
            carregarEventosDoServidorEAtualizar();
          }
        } catch (e) {}
      };
      evtSource.onerror = function() {
        setTimeout(iniciarEventosSSE, 3000);
      };
    } catch (e) {}
  }

  iniciarEventosSSE();
});

// Exemplo de feriados fixos nacionais
const feriadosFixos = [
  { dia: 1, mes: 0, nome: "Ano Novo" },
  { dia: 21, mes: 3, nome: "teste" },
  { dia: 1, mes: 4, nome: "Dia do Trabalho" },
  { dia: 7, mes: 8, nome: "Independência" },
  { dia: 12, mes: 9, nome: "Nossa Sra. Aparecida" },
  { dia: 2, mes: 10, nome: "Finados" },
  { dia: 15, mes: 10, nome: "Proclamação da República" },
  { dia: 25, mes: 11, nome: "Natal" }
];

// Feriado móvel: Dia dos Pais (2º domingo de agosto)
function diaDosPais(ano) {
  let domingos = 0;
  for (let d = 1; d <= 31; d++) {
    const data = new Date(ano, 7, d);
    if (data.getMonth() !== 7) break;
    if (data.getDay() === 0) domingos++;
    if (domingos === 2) return d;
  }
  return null;
}

// Função para renderizar eventos e feriados do mês
function renderizarEventosDoMes(mes, ano, eventosDoBanco = []) {
  const eventList = document.getElementById('event-list');
  eventList.innerHTML = '';

  const agora = new Date();

  eventosDoBanco
    .filter(ev => {
      const [anoEv, mesEv, diaEv] = ev.data_hora.split(' ')[0].split('-');
      const horaEv = ev.data_hora.split(' ')[1] || '00:00';
      const dataEv = new Date(`${anoEv}-${mesEv}-${diaEv}T${horaEv}`);
      // Só mostra eventos do mês/ano selecionado e que ainda não passaram
      return (
        Number(mesEv) === mes + 1 &&
        Number(anoEv) === ano &&
        dataEv >= agora
      );
    })
    .forEach(ev => {
      const dataHora = ev.data_hora.split(' ');
      const data = dataHora[0].split('-').reverse().join('/');
      const hora = dataHora[1] || '';
      const li = document.createElement('li');
      li.className = "evento-card";

      const nomesFeriados = [
        "ano novo", "carnaval", "sexta-feira santa", "tiradentes", "dia do trabalho",
        "corpus christi", "independência", "nossa sra. aparecida", "finados",
        "proclamação da república", "natal", "dia dos pais"
      ];
      const isFeriado = ev.nome && nomesFeriados.some(nomeFeriado => ev.nome.toLowerCase().includes(nomeFeriado));
      li.className = "evento-card" + (isFeriado ? " feriado" : "");

      li.innerHTML = `
        <div class="evento-hora"><b>${data}</b> ${hora}</div>
        <div class="evento-descricao">${ev.nome}</div>
      `;

      // Adiciona evento de clique para mostrar botões
      li.addEventListener('click', function (e) {
        // Remove todos os botoes de outros cards antes de abrir o atual
        document.querySelectorAll('.evento-botoes').forEach(b => b.remove());

        // Evita duplicar botões se já existirem neste card
        if (li.querySelector('.evento-botoes')) return;

        // Cria container dos botões
        const botoes = document.createElement('div');
        botoes.className = 'evento-botoes';
        botoes.style.marginTop = '10px';

        // Botão Cancelar
        const btnCancelar = document.createElement('button');
        btnCancelar.className = 'btn-cancelar-evento';
        btnCancelar.textContent = 'Cancelar';
        btnCancelar.onclick = function (evBtn) {
          evBtn.stopPropagation();
          botoes.remove();
        };

        // Botão Apagar
        const btnApagar = document.createElement('button');
        btnApagar.className = 'btn-apagar-evento';
        btnApagar.textContent = 'Apagar';
        btnApagar.style.marginLeft = '10px';
        btnApagar.onclick = function (evBtn) {
          evBtn.stopPropagation();
          window.showDeleteEventModal(function() {
            fetch(`http://192.168.1.100:5000/eventos/${ev.id}`, {
              method: 'DELETE'
            })
            .then(response => {
              if (!response.ok) throw new Error('Erro ao apagar evento');
              li.remove();
            })
            .catch(() => {
              // Opcional: mostrar erro customizado na interface
            });
          });
        };

        botoes.appendChild(btnCancelar);
        botoes.appendChild(btnApagar);
        li.appendChild(botoes);
      });

      eventList.appendChild(li);
    });

  // Se não houver eventos, mostra mensagem
  if (eventList.children.length === 0) {
    const li = document.createElement('li');
    li.className = "evento-vazio";
    li.textContent = "Nenhum evento cadastrado.";
    eventList.appendChild(li);
  }
}

// Função para renderizar os dias do calendário com a cor do evento
function renderizarDiasCalendario(eventos) {
  const dias = document.querySelectorAll('.calendar-day');
  dias.forEach(diaEl => {
    // Supondo que cada dia tenha um atributo data-date no formato YYYY-MM-DD
    const dataDia = diaEl.getAttribute('data-date');
    // Procura evento para esse dia
    const evento = eventos.find(ev => {
      // ev.data_hora pode ser "YYYY-MM-DD HH:MM"
      const dataEv = ev.data_hora.split(' ')[0];
      return dataEv === dataDia;
    });
    if (evento && evento.cor) {
      diaEl.style.background = evento.cor;
      diaEl.style.color = "#fff";
      diaEl.style.border = `2px solid ${evento.cor}`;
    } else {
      diaEl.style.background = "";
      diaEl.style.color = "";
      diaEl.style.border = "";
    }
  });
}

// Função para criar o card de evento
function criarCardEvento(evento) {
  const card = document.createElement('div');
  card.className = 'evento-card';
  // Detecta feriado pelo nome ou por uma propriedade evento.feriado
  const nomesFeriados = [
    "Ano Novo", "Carnaval", "Sexta-feira Santa", "Tiradentes", "Dia do Trabalho",
    "Corpus Christi", "Independência", "Nossa Sra. Aparecida", "Finados",
    "Proclamação da República", "Natal", "Dia dos Pais"
  ];
  const ehFeriado = evento.feriado === true ||
    (typeof evento.nome === 'string' && nomesFeriados.some(f => evento.nome.trim().toLowerCase().includes(f.toLowerCase())));
  if (ehFeriado) {
    card.classList.add('feriado');
    card.innerHTML = `
      <div class="evento-cabecalho">
        <span class="evento-data">${evento.data_hora}</span>
      </div>
      <div class="evento-descricao">${evento.nome}</div>
    `;
    // Não adiciona botões nem evento de clique
    return card;
  }
  card.innerHTML = `
    <div class="evento-cabecalho">
      <span class="evento-data">${evento.data_hora}</span>
    </div>
    <div class="evento-descricao">${evento.nome}</div>
    <div class="evento-botoes">
      <button class="btn-apagar-evento">Apagar</button>
      <button class="btn-cancelar-evento">Cancelar</button>
    </div>
  `;
  // Adiciona eventos de clique normalmente
  card.querySelector('.btn-apagar-evento').onclick = function() { /* ... */ }
  card.querySelector('.btn-cancelar-evento').onclick = function() { /* ... */ }
  card.onclick = function() { /* ...abrir detalhes... */ }
  return card;
}

