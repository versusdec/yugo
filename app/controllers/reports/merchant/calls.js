define(['microcore', 'apexcharts', 'json!/js/ru', 'mst!/reports/merchant/calls', "popup"],
  function (mc, ApexCharts, ruLang, view, popup) {

      let chart;

      function draw($scope) {
          const options = {
              series: [{
                  name: mc.i18n('reports.calls.targeted'),
                  type: 'line',
                  data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39]
              }, {
                  name: mc.i18n('reports.calls.not_targeted'),
                  type: 'column',
                  data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30]
              }, {
                  name: mc.i18n('reports.calls.conversion'),
                  type: 'column',
                  data: [-2, -10, -1, -20, -15, -5, 37, 21, 44, 22, 30]
              }],
              chart: {
                  // locales: [ruLang],
                  // defaultLocale: 'ru',
                  height: 265,
                  type: 'line',
                  stacked: true,
                  toolbar: {
                      show: false
                  },
              },
              stroke: {
                  width: [3, 0, 0],
                  curve: 'smooth',
                  colors: ['#26aceb', '#A09DC0', '#D8DCF0'],
              },
              plotOptions: {
                  bar: {
                      columnWidth: '50%'
                  }
              },

              fill: {
                  type: 'solid',
                  colors: ['#26aceb', '#A09DC0', '#D8DCF0'],
                  /*
                  opacity: [0.85, 0.25, 1],
                  gradient: {
                      inverseColors: false,
                      shade: 'light',
                      type: "vertical",
                      opacityFrom: 0.85,
                      opacityTo: 0.55,
                      stops: [0, 100, 100, 100]
                  }*/
              },
              labels: ['2021-11-15', '2021-11-16', '2021-11-17', '2021-11-18', '2021-11-19', '2021-11-20', '2021-11-21',
                  '2021-11-22', '2021-11-23', '2021-11-24', '2021-11-25'
              ],
              markers: {
                  size: [6, 0, 0],
                  colors: ['#fff', '#fff', '#fff'],
                  strokeColors: '#26aceb',
                  strokeWidth: 3,
                  hover: {
                      size: 8
                  }
              },
              xaxis: {
                  type: 'category',
              },
              yaxis: {
                  title: {
                      text: '',
                  },
              },
              tooltip: {
                  enabled: true,
                  shared: true,
                  intersect: false,
                  custom: function ({series, seriesIndex, dataPointIndex, w}) {
                      return '<div class="arrow_box">' +
                        '<span>' + w.config.series[seriesIndex].name + ': ' + series[seriesIndex][dataPointIndex] + '</span>' +
                        '</div>'
                  }
                  /*
                  y: {
                      formatter: function (y) {
                          if (typeof y !== "undefined") {
                              return y.toFixed(0) + "";
                          }
                          return y;
                      }
                  }*/
              },
              legend: {
                  show: false
              },
              grid: {
                  show: true,
                  borderColor: '#E8EBFA',
                  strokeDashArray: 5,
                  position: 'back'
              },
              annotations: {
                  yaxis: [
                      {
                          y: 0,
                          strokeDashArray: 0,
                          borderColor: '#D8DCF0',
                          borderWidth: 1,
                          opacity: 1,
                          width: '120%',
                          offsetX: -20,
                          offsetY: 0,
                      }
                  ],
              }
          };

          chart = new ApexCharts($($scope).find('.calls_chart')[0], options);
          chart.render();
      }

      mc.events.on('reports.merchant.stats.calls.toggle.series', ({name, btn}) => {
          btn.classList.toggle('toggled');
          chart.toggleSeries(name);
      });

      mc.events.on("reports.merchant.stats.calls.sort", async (e) => {
          if (e.length == 2) {
              let table = $(e[0]).closest("table"), thead = table.find("thead"), th = $(e[0]).closest("th"), tbody = table.find("tbody");
              Array.from(tbody[0].querySelectorAll('tr'))
                .sort(comparer(Array.from(th[0].parentNode.children).indexOf(th[0]), e[1]))
                .forEach(tr => tbody[0].appendChild(tr));
              let spans = thead.find("span.sorted");
              for (let s of spans) {
                  s.classList.remove("sorted");
              }
              e[0].classList.add("sorted");
          }
      });

      mc.events.on('sys:page.init:controllers/reports/merchant/expenses', () => {
          console.log('init')
      })

      mc.events.on('reports.test', () => {

      })

      return async function ($scope, $params) {
          let data = {}
          $($scope).find('.content').html(await view(data))
          draw($scope);
      }
  });