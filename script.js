$(document).ready(function() {
  // Загрузка данных из локального JSON-файла
  fetch('data.json')
      .then(response => {
          if (!response.ok) {
              throw new Error('Сеть ответа не OK');
          }
          return response.json();
      })
      .then(data => {
          // Обработка полученных данных
          const tbody = $('#data-table tbody');
          tbody.empty(); // Очищаем старые данные

          data.forEach(item => {
              const values = item.values;
              const percentageChanges = calculatePercentageChanges(values);

              tbody.append(`
                  <tr data-label="${item.label}" data-values='${JSON.stringify(item.values)}'>
                      <td>${item.label}</td>
                      <td class="${getClassForChange(percentageChanges[0])}">${values[0]} ${percentageChanges[0] ? `(${percentageChanges[0]}%)` : ''}</td>
                      <td class="${getClassForChange(percentageChanges[1])}">${values[1]} ${percentageChanges[1] ? `(${percentageChanges[1]}%)` : ''}</td>
                      <td>${values[2]}</td>
                  </tr>
                  <tr class="chart-row" style="display: none;">
                      <td colspan="4">
                          <div class="chart-container" style="height: 400px;"></div>
                      </td>
                  </tr>
              `);
          });

          // Добавляем обработчик клика после загрузки данных
          addRowClickHandler();
      })
      .catch(error => console.error("Ошибка при загрузке данных:", error));

  function calculatePercentageChanges(values) {
      let changes = [];
      for (let i = 1; i < values.length; i++) {
          let change = ((values[i] - values[i - 1]) / values[i - 1] * 100).toFixed(1);
          changes.push(change);
      }
      changes.unshift(''); // Первая ячейка не имеет изменения
      return changes;
  }

  function getClassForChange(change) {
      if (change === '') return ''; // Без изменений не нужно добавлять класс
      return change < 0 ? 'negative' : 'positive';
  }

  function addRowClickHandler() {
      $('#data-table tbody tr:not(.chart-row)').click(function() {
          // Скрываем графики в других строках
          $('.chart-row').hide();

          // Получаем текущую строку и следующий элемент (где будет график)
          const $this = $(this);
          const $nextRow = $this.next('.chart-row');

          const label = $this.data('label');
          const values = $this.data('values');

          if (!Array.isArray(values) || values.length !== 3) {
              console.error("Неверное число значений для графика:", values);
              return;
          }

          // Обновляем график в следующей строке
          Highcharts.chart($nextRow.find('.chart-container').get(0), {
              chart: {
                  type: 'line'
              },
              title: {
                  text: `График для ${label}`
              },
              series: [{
                  name: label,
                  data: values
              }],
              xAxis: {
                  categories: ['За текущий день', 'За вчера', 'За текущий день недели']
              },
              yAxis: {
                  title: {
                      text: 'Значения'
                  }
              }
          });

          // Показываем график под выбранной строкой
          $nextRow.show();
      });
  }
});
