define(['microcore', 'apexcharts', 'json!/js/ru'], function (mc, ApexCharts, ruLang) {

    let chart;

    function draw($scope) {
        var options = {
            series: [{
                name: 'Конверсия',
                type: 'line',
                data: [30, 25, 36, 30, 50, 35, 64, 52, 59, 36, 100]
            }, {
                name: 'Нецелевые',
                type: 'column',
                data: [2, 10, 1, 20, 15, 5, 37, 21, 44, 22, 30]
            }, {
                name: 'Целевые',
                type: 'column',
                data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30]
            }],
            chart: {
                locales: [ruLang],
                defaultLocale: 'ru',
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
                colors: ['#56CCF2', '#D8DCF0', '#A09DC0'],
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%'
                }
            },

            fill: {
                type: 'solid',
                colors: ['#56CCF2', '#D8DCF0', '#A09DC0'],
            },
            labels: ['2021-11-15', '2021-11-16', '2021-11-17', '2021-11-18', '2021-11-19', '2021-11-20', '2021-11-21',
                '2021-11-22', '2021-11-23', '2021-11-24', '2021-11-25'
            ],
            markers: {
                size: [6, 0, 0],
                colors: ['#fff', '#fff', '#fff'],
                strokeColors: '#56CCF2',
                strokeWidth: 3,
                hover: {
                    size: 8
                }
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

        chart = new ApexCharts($($scope).find('.chart')[0], options);
        chart.render();
        chart.updateOptions({
            yaxis: [
                {
                    labels: {
                        formatter: (val, i) => {
                            console.log(chart.series.w.config.series);
                        }
                    }
                },
            ],
        })
    }

    mc.events.on('dashboard.merchant.stats.calls.toggle.series', (name) => {
        chart.toggleSeries(name);
    });

    mc.events.on("dashboard.merchant.stats.calls.sort", async (e) => {
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

    mc.events.on('dashboard.merchant.calls.list', async $scope => {
        let hash = mc.router.hash();
        let data = await mc.api.call('stats.dashboard.merchant.calls',
          hash.period ? {period: hash.period} : {})
        console.log(data);
    })

    return async function ($scope, $params) {

        mc.events.push('dashboard.merchant.calls.list')
        // draw($scope);
    }
});