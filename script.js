$(document).ready(function() {
    // URL simulada do backend
    const backendUrl = 'data.json'; 

    // Função para buscar e renderizar os eventos
    function fetchAndRenderEvents() {
        $.getJSON(backendUrl, function(events) {
            const groupedEvents = groupEventsByDayAndHour(events);
            renderCalendar(groupedEvents);
        });
    }

    // Função para agrupar eventos por dia e, dentro de cada dia, por horário
    function groupEventsByDayAndHour(events) {
        const groupedByDay = {};
        events.forEach(event => {
            const startDate = new Date(event.startDate);
            const dateKey = startDate.toISOString().split('T')[0];
            
            if (!groupedByDay[dateKey]) {
                groupedByDay[dateKey] = {};
            }

            const timeKey = event.allDay ? 'allDay' : startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            if (!groupedByDay[dateKey][timeKey]) {
                groupedByDay[dateKey][timeKey] = [];
            }
            groupedByDay[dateKey][timeKey].push(event);
        });
        return groupedByDay;
    }

    // Função para renderizar o calendário (modificada)
    function renderCalendar(groupedEvents) {
        const container = $('#calendar-container');
        container.empty();

        const sortedDates = Object.keys(groupedEvents).sort();

        sortedDates.forEach(dateStr => {
            const date = new Date(dateStr + 'T00:00:00Z');
            const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });
            const formattedDate = date.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' });

            const dayDiv = $('<div>').addClass('day');
            
            const dayHeader = $('<div>')
                .addClass('day-header')
                .append($('<span>').addClass('day-of-week').text(dayOfWeek))
                .append($('<span>').addClass('date').text(formattedDate));

            const eventDayList = $('<div>').addClass('event-list');
            
            const sortedTimes = Object.keys(groupedEvents[dateStr]).sort();
            sortedTimes.forEach(timeKey => {
                const eventsAtTime = groupedEvents[dateStr][timeKey];
                
                const timeGroupHeader = $('<div>').addClass('time-group-header');
                
                const timeSpan = $('<span>').addClass('time');
                if (timeKey === 'allDay') {
                    timeSpan.addClass('all-day').text('all-day');
                } else {
                    timeSpan.text(timeKey);
                }

                // Lógica de agrupamento melhorada
                const detailsDiv = $('<div>').addClass('event-details');
                
                if (eventsAtTime.length > 1) {
                    // Quando há mais de um evento
                    detailsDiv
                        .append($('<span>').addClass('bullet group-bullet'))
                        .append($('<span>').addClass('title').text(`Grupo de ${eventsAtTime.length} Eventos`))
                        // .append($('<span>').addClass('indicator').html('&#x25BC;')); // Ícone de seta para baixo
                } else {
                    // Quando há apenas um evento
                    detailsDiv
                        .append($('<span>').addClass('bullet single-bullet'))
                        .append($('<span>').addClass('title').text(eventsAtTime[0].title));
                }

                timeGroupHeader.append(timeSpan).append(detailsDiv);

                // A sub-lista agora é renderizada apenas se houver mais de um evento
                if (eventsAtTime.length > 1) {
                    const subEventList = $('<div>').addClass('sub-event-list').hide();
                    eventsAtTime.forEach(event => {
                         const subEventItem = $('<div>').addClass('sub-event-item')
                             .append($('<span>').addClass('sub-bullet'))
                             .append($('<span>').addClass('sub-title').text(event.title));
                        subEventList.append(subEventItem);
                    });
                    eventDayList.append(timeGroupHeader).append(subEventList);
                } else {
                    // Adiciona o item único diretamente
                    eventDayList.append(timeGroupHeader);
                }
            });
            
            dayDiv.append(dayHeader).append(eventDayList);
            container.append(dayDiv);
        });

        // Evento de clique para mostrar/ocultar a lista de eventos do dia
        $('.day-header').on('click', function() {
            const eventList = $(this).siblings('.event-list');
            $(this).toggleClass('active');
            eventList.slideToggle('fast');
        });

        // Evento de clique para mostrar/ocultar a sub-lista de eventos com mesmo horário
        $('.time-group-header').on('click', function() {
             const subEventList = $(this).siblings('.sub-event-list');
             if (subEventList.length > 0) { // Garante que só há clique se houver uma sub-lista
                 $(this).toggleClass('active');
                 subEventList.slideToggle('fast');
             }
        });

        // Oculta todas as listas de eventos no início
        $('.event-list, .sub-event-list').hide();
    }

    // Inicia a renderização
    fetchAndRenderEvents();
});