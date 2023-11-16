define(['microcore', 'apexcharts', 'json!/js/ru'], function (mc, ApexCharts, ruLang) {

    let chart;

    function draw($scope){
        var options = {
            series: [{
                name: mc.i18n('dashboard.agency.spent'),
                type: 'line',
                data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39]
            },{
                name: mc.i18n('dashboard.agency.profit'),
                type: 'line',
                data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30]
            }, {
                name: mc.i18n('dashboard.agency.web_income'),
                type: 'line',
                data: [-2, -10, -1, -20, -15, -5, 37, 21, 44, 22, 30]
            }, {
                name: 'HOLD',
                type: 'line',
                data: [2, 10, 1, 20, 15, 5, 37, 21, 44, 22, 30]
            }],
            chart: {
                height: 265,
                type: 'line',
                stacked: false,
                toolbar: {
                    show: false
                },
            },
            stroke: {
                width: [3, 3, 3, 3],
                curve: 'smooth',
                colors: ['#F2C94C', '#26aceb', '#A09DC0', '#D8DCF0'],
            },
            /*fill: {
                type: 'solid',
                colors: ['#F2C94C', '#A09DC0', '#D8DCF0'],
                /!*
                opacity: [0.85, 0.25, 1],
                gradient: {
                    inverseColors: false,
                    shade: 'light',
                    type: "vertical",
                    opacityFrom: 0.85,
                    opacityTo: 0.55,
                    stops: [0, 100, 100, 100]
                }*!/
            },*/
            labels: ['2021-11-15', '2021-11-16', '2021-11-17', '2021-11-18', '2021-11-19', '2021-11-20', '2021-11-21',
                '2021-11-22', '2021-11-23', '2021-11-24', '2021-11-25'
            ],
            markers: {
                size: [6, 6, 6, 6],
                colors: ['#fff', '#fff', '#fff'],
                strokeColors: ['#F2C94C', '#26aceb', '#A09DC0', '#D8DCF0'],
                strokeWidth: 3,
                hover: {
                    size: 8
                }
            },
            tooltip: {
                enabled: true,
                shared: true,
                intersect: false,
                custom: function({series, seriesIndex, dataPointIndex, w}) {
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
            /*annotations: {
                yaxis: [
                    {
                        y: 0,
                        strokeDashArray: 0,
                        borderColor: 'red',
                        borderWidth: 1,
                        opacity: 1,
                        width: '120%',
                        offsetX: -20,
                        offsetY: 0,
                    }
                ],
                xaxis: [
                    {
                        x: 0,
                        strokeDashArray: 0,
                        borderColor: 'green',
                        borderWidth: 1,
                        opacity: 1,
                        width: '100%'
                    }
                ]
            }*/
        };

        chart = new ApexCharts($($scope).find('.finances_chart')[0], options);
        chart.render();
    }

    mc.events.on('dashboard.agency.stats.finances.toggle.series', ({name, btn}) => {
        btn.classList.toggle('toggled')
        chart.toggleSeries(name);
    });

    return async function ($scope, $params) {
        draw($scope);
    }
});