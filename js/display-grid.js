document.addEventListener('DOMContentLoaded', () => {
    // Fetch the JSON data
    fetch('events.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            for (const [key, value] of Object.entries(data)) {
                displayGrid(value, key)
            }
        })
        .catch(error => {
            console.error('Error loading links:', error);
        });
});



function getWeekendRange(date) {
            const d = new Date(date);
            const day = d.getDay();
            
            let saturday = new Date(d);
            if (day === 0) {
                saturday.setDate(d.getDate() - 1);
            } else if (day === 6) {
                // Already Saturday
            } else {
                saturday.setDate(d.getDate() + (6 - day));
            }
            
            const sunday = new Date(saturday);
            sunday.setDate(saturday.getDate() + 1);
            
            return {
                start: saturday,
                end: sunday,
                label: `${saturday.getMonth() + 1}/${saturday.getDate()}-${sunday.getMonth() + 1}/${sunday.getDate()}`,
                key: saturday.toISOString().split('T')[0]
            };
        }

        function formatDate(dateStr) {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        function buildGrid(eventsData) {
            // Get unique teams
            const teams = [...new Set(eventsData.map(e => e.team))].sort();
            
            // Get unique weekends
            const weekendMap = {};
            eventsData.forEach(event => {
                const weekend = getWeekendRange(event.date);
                weekendMap[weekend.key] = weekend;
            });
            const weekends = Object.values(weekendMap).sort((a, b) => a.start - b.start);
            
            // Build data structure: team -> weekend -> events
            const grid = {};
            teams.forEach(team => {
                grid[team] = {};
                weekends.forEach(w => {
                    grid[team][w.key] = [];
                });
            });
            
            eventsData.forEach(event => {
                const weekend = getWeekendRange(event.date);
                grid[event.team][weekend.key].push(event);
            });
            
            return { teams, weekends, grid };
        }

        function displayGrid(eventsData, conf) {
            const { teams, weekends, grid } = buildGrid(eventsData);
            const container = document.getElementById('schedule-grid');
            
            // Header row
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            const emptyHeader = document.createElement('th');
            emptyHeader.textContent = conf.toUpperCase();
            headerRow.appendChild(emptyHeader);
            
            weekends.forEach(weekend => {
                const th = document.createElement('th');
                th.textContent = weekend.label;
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            container.appendChild(thead);
            
            // Team rows
            const tbody = document.createElement('tbody');
            teams.forEach(team => {
                const row = document.createElement('tr');
                
                const teamCell = document.createElement('td');
                teamCell.className = 'team-cell';
                teamCell.textContent = team;
                row.appendChild(teamCell);
                
                weekends.forEach(weekend => {
                    const cell = document.createElement('td');
                    
                    const events = grid[team][weekend.key];
                    if (events.length > 0) {
                        const content = document.createElement('div');
                        content.className = 'event-content';
                        
                        events.forEach((event, idx) => {
                            if (idx > 0) {
                                content.appendChild(document.createElement('hr'));
                            }
                            const eventDiv = document.createElement('div');
                            eventDiv.innerHTML = `
                                <div class="event-name">${event.eventName}</div>
                                <div class="event-location">${event.location}</div>
                                <div class="event-time">${formatDate(event.date)} • ${event.time}</div>
                            `;
                            content.appendChild(eventDiv);
                        });
                        
                        cell.appendChild(content);
                    } else {
                        cell.classList.add('empty-cell');
                        cell.textContent = '—';
                    }
                    
                    row.appendChild(cell);
                });
                
                tbody.appendChild(row);
            });
            
            container.appendChild(tbody);
        }