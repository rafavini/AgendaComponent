$(document).ready(function() {
    const backendUrl = 'data.json'; 
    let allEvents = [];
    let currentWeekStart = getStartOfWeek(new Date());

    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function fetchAllEvents() {
        $.getJSON(backendUrl, function(events) {
            allEvents = events;
            renderCalendarForWeek();
        });
    }

    function renderCalendarForWeek() {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Atualiza o texto do cabeçalho
        const startFormatted = currentWeekStart.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' });
        const endFormatted = weekEnd.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' });
        $('#current-week-range').text(`${startFormatted} - ${endFormatted}`);

        // Filtra os eventos da semana atual
        const eventsInWeek = allEvents.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= currentWeekStart && eventDate <= weekEnd;
        });

        const groupedEvents = groupEventsByDayAndHour(eventsInWeek);
        renderCalendar(groupedEvents);
    }
    
    // As funções de agrupamento e renderização do calendário permanecem as mesmas
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

    function renderCalendar(groupedEvents) {
        const container = $('#calendar-container');
        container.empty();

        const sortedDates = Object.keys(groupedEvents).sort();

        // Código para renderizar os dias e eventos, conforme a solução anterior...
        // ... (todo o código de renderização) ...
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

                const detailsDiv = $('<div>').addClass('event-details');
                
                if (eventsAtTime.length > 1) {
                    detailsDiv
                        .append($('<span>').addClass('bullet group-bullet'))
                        .append($('<span>').addClass('title').text(`Grupo de ${eventsAtTime.length} Eventos`))
                        .append($('<span>').addClass('indicator').html('&#x25BC;'));
                } else {
                    detailsDiv
                        .append($('<span>').addClass('bullet single-bullet'))
                        .append($('<span>').addClass('title').text(eventsAtTime[0].title));
                }

                timeGroupHeader.append(timeSpan).append(detailsDiv);

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
                    eventDayList.append(timeGroupHeader);
                }
            });
            
            dayDiv.append(dayHeader).append(eventDayList);
            container.append(dayDiv);
        });

        if (sortedDates.length === 0) {
            container.append($('<div>').addClass('no-events').text('Nenhum evento nesta semana.'));
        }

        $('.day-header').off('click').on('click', function() {
            const eventList = $(this).siblings('.event-list');
            $(this).toggleClass('active');
            eventList.slideToggle('fast');
        });

        $('.time-group-header').off('click').on('click', function() {
             const subEventList = $(this).siblings('.sub-event-list');
             if (subEventList.length > 0) {
                 $(this).toggleClass('active');
                 subEventList.slideToggle('fast');
             }
        });

        $('.event-list, .sub-event-list').hide();
    }
    
    // Adiciona os eventos de clique nos botões de navegação
    $('#prev-week-btn').on('click', function() {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderCalendarForWeek();
    });

    $('#next-week-btn').on('click', function() {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderCalendarForWeek();
    });

    // --- NOVOS EVENTOS DE NAVEGAÇÃO ---
    // Navegação por mês
    $('#prev-month-btn').on('click', function() {
        currentWeekStart.setMonth(currentWeekStart.getMonth() - 1);
        renderCalendarForWeek();
    });

    $('#next-month-btn').on('click', function() {
        currentWeekStart.setMonth(currentWeekStart.getMonth() + 1);
        renderCalendarForWeek();
    });

    // Seletor de data (Date Picker)
    $('#date-picker').on('change', function() {
        const selectedDate = new Date($(this).val());
        if (selectedDate instanceof Date && !isNaN(selectedDate)) {
            currentWeekStart = getStartOfWeek(selectedDate);
            renderCalendarForWeek();
        }
    });

    // Inicia a aplicação buscando todos os eventos
    fetchAllEvents();
});