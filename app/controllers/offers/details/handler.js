define(
  ['microcore', 'mst!offers/details/item', "chart"],
  function (mc, item_view, Chart
  ) {
      let filter = {}, page = 1, limit = 10, chart;

      function drawGraph(items, $scope) {
          try {
              let data = [0, 0, 0, 0, 0], sum = 0;

              if (items && items.length) {
                  let item = items[0];
                  data[0] = Number(item.new);
                  data[1] = Number(item.inwork);
                  data[2] = Number(item.approved);
                  data[3] = Number(item.rejected);
                  data[4] = Number(item.appealed);
                  for (const v of data) {
                      sum += v;
                  }
              }

              if (typeof chart !== "undefined") {
                  chart.destroy();
              }

              const getOrCreateLegendList = (chart, id) => {
                  const legendContainer = document.getElementById(id);
                  let listContainer = legendContainer.querySelector('ul');

                  if (!listContainer) {
                      listContainer = document.createElement('ul');
                      listContainer.style.display = 'flex';
                      listContainer.style.flexDirection = 'row';
                      listContainer.style.margin = 0;
                      listContainer.style.padding = 0;

                      legendContainer.appendChild(listContainer);
                  }

                  return listContainer;
              };

              // const htmlLegendPlugin =


              chart = new Chart(document.getElementById('chart'), {
                  type: 'doughnut',
                  data: {
                      labels: [mc.i18n('status.new'), mc.i18n('status.inwork'), mc.i18n('status.approved'), mc.i18n('status.rejected'), mc.i18n('status.appealed')],
                      datasets: [
                          {
                              data: data,
                              backgroundColor: ['#FFBB00', '#06D6A0', '#C69DD2', '#90BE6D', '#DB3A34'],
                          }
                      ],

                  },
                  options: {
                      animation: {
                          onComplete: function (animation) {
                              if (sum > 0) {
                                  $($scope).find('.no-data-placeholder')[0].classList.add('hide');
                              } else {
                                  $($scope).find('.no-data-placeholder')[0].classList.remove('hide');
                              }
                          }
                      },
                      config: {
                          options: {
                              responsive: false,
                              maintainAspectRatio: false
                          }
                      },
                      plugins: {
                          htmlLegend: {
                              // ID of the container to put the legend in
                              containerID: 'legend-container',
                          },
                          legend: {
                              display: false,
                          }
                      },

                  },
                  plugins: [{
                      id: 'htmlLegend',
                      afterDraw(chart, args, options) {
                          const ul = getOrCreateLegendList(chart, options.containerID);

                          // Remove old legend items
                          while (ul.firstChild) {
                              ul.firstChild.remove();
                          }
                            ul.style.display = 'flex';
                            ul.style.flexWrap = 'wrap';
                            ul.style.gap = '10px';
                            // ul.style.flexWrap = 'wrap';
                          // Reuse the built-in legendItems generator
                          const items = chart.options.plugins.legend.labels.generateLabels(chart);

                          items.forEach(item => {
                              const li = document.createElement('li');
                              li.style.alignItems = 'center';
                              li.style.cursor = 'pointer';
                              li.style.display = 'flex';

                              li.onclick = () => {
                                  const {type} = chart.config;
                                  if (type === 'pie' || type === 'doughnut') {
                                      // Pie and doughnut charts only have a single dataset and visibility is per item
                                      chart.toggleDataVisibility(item.index);
                                  } else {
                                      chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                                  }
                                  chart.update();
                              };

                              // Color box
                              const boxSpan = document.createElement('span');
                              boxSpan.style.background = item.fillStyle;
                              boxSpan.style.borderColor = item.strokeStyle;
                              boxSpan.style.borderWidth = item.lineWidth + 'px';
                              boxSpan.style.display = 'inline-block';
                              boxSpan.style.height = '20px';
                              boxSpan.style.marginRight = '10px';
                              boxSpan.style.width = '20px';

                              // Text
                              const textContainer = document.createElement('p');
                              textContainer.style.color = item.fontColor;
                              textContainer.style.margin = 0;
                              textContainer.style.padding = 0;
                              textContainer.style.whiteSpace = 'nowrap';
                              textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

                              const text = document.createTextNode(item.text);
                              textContainer.appendChild(text);

                              li.appendChild(boxSpan);
                              li.appendChild(textContainer);
                              ul.appendChild(li);
                          });
                      }
                  }],


              });
          } catch
            (e) {
              console.log(e.message);
          }
      }

      mc.events.on('offers.details.filter.apply', async ($scope) => {
          filter.limit = limit;
          filter.offset = (page - 1) * limit;
          let data = await mc.api.call("offers.stats", filter);
          console.log(data);
          data = {
              items: [
                  {
                      total: 50,
                      new: 12,
                      inwork: 13,
                      approved: 21,
                      rejected: 12,
                      appealed: 32,
                      ptl: 24,
                      amount: 300
                  },
                  {
                      total: 6,
                      new: 123,
                      inwork: 32,
                      approved: 21,
                      rejected: 23,
                      appealed: 3,
                      ptl: 32,
                      amount: 300
                  },
                  {
                      total: 6,
                      new: 22,
                      inwork: 33,
                      approved: 123,
                      rejected: 54,
                      appealed: 34,
                      ptl: 32,
                      amount: 300
                  },


              ],
              total: 3
          }
          if (data && data.items && data.items.length) {
              $($scope).find('table > tbody').html('')
              if (data.items.length) {
                  for (let i in data.items) {
                      let item = data.items[i];
                      item.profile = mc.auth.get()
                      $($scope).find('table > tbody').append(await item_view(item))
                  }
              }
          } else {
              $($scope).find('table > tbody .loader').text("нет продаж")
          }

          data.items ? drawGraph(data.items, $scope) : void 0;

          mc.events.push('system:pagination.update', {
              id: 'offers',
              total: data.total,
              limit: data.limit,
              current: page
          });

      });

      mc.events.on('offers.details.filter.reset', async ($scope) => {
          mc.router.go(location.pathname);
      });

      mc.events.on("offers.details.filter.filter", async ($scope) => {
          filter.page = 1;
          for (let k in filter) {
              if (filter[k] === undefined) {
                  delete filter[k];
              }
          }
          mc.router.go(mc.router.hash(filter));
      });

      mc.events.on('offer.details.filter.range.change', (selected) => {
          // filter.start = selected.value;
      });

      mc.events.on('sys:page.init:controllers/offers/details/handler', (selected) => {
          // console.log($('#chart'))
      });


      return async ($scope, $params) => {
          let hash_params = mc.router.hash();
          filter = hash_params;
          page = parseInt(hash_params.page) || 1
          limit = parseInt(hash_params.limit) || 10
          filter.id = parseInt($params.id);

          mc.events.push('offers.details.filter.apply', $scope);
      }
  }
)
;