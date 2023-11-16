define(['microcore', 'chart'], function (mc, Chart) {
    let filter = {}, chart;

    function drawChart(items, $scope){
        try{
            let labels = [], data = [];
            if (items && items.length){
                for (const item of items) {
                    labels.push(item.date);
                    data.push(item.income);
                }
            }

            if (typeof chart !== "undefined") {
                chart.destroy();
            }

            if (data.length > 0){
                document.querySelector('.no-data-placeholder').classList.add('hide');
                chart = new Chart(document.getElementById('chart'), {
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                type: 'line',
                                label: 'Заработано, руб',
                                data: data,
                                borderColor: 'rgba(255,187,0,0.6)',
                                backgroundColor: 'rgba(255,187,0,0.6)',
                                tension: 0.5
                            }
                        ]
                    },
                    config: {
                        options: {
                            responsive: true
                        }
                    }
                });
            } else {
                document.querySelector('.no-data-placeholder').classList.remove('hide');
            }
        } catch (e) {
            console.log(e.message);
        }
    }

    mc.events.on('dashboard:webmaster.graph.filter.range.start', async (selected) => {
        filter.start = selected.value
    });

    mc.events.on('dashboard:webmaster.graph.filter.range.finish', async (selected) => {
        filter.finish = selected.value
    });

    mc.events.on('dashboard:webmaster.graph.filter', async ($scope) => {
        let hash_params = mc.router.hash();
        let page = parseInt(hash_params.page) || 1;
        let limit = parseInt(hash_params.limit) || 10;
        let user = await mc.api.call('users.me');

        mc.api.call("stats.sales.graph", {
            start: filter.start,
            finish: filter.finish,
            limit: limit,
            offset: (page - 1) * limit
        }).then(async function (sales) {

            drawChart(sales.items, $scope);
            $('#graph span[data-total]').text(sales.sum);

            mc.events.push('system:pagination.update', {
                total: sales.total,
                limit: sales.limit,
                current: page
            })
        });
    });

    return async function ($scope, $params) {
        let t = new Date(), s = t.getTime();
        t = new Date(s - 864000000);
        let m = t.getMonth()+1, d = t.getDate();
        filter = {};
        filter.start = t.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d);
        await mc.events.push('dashboard:webmaster.graph.filter', $scope)
    }
});