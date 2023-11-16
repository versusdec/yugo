define(['microcore', 'mst!dashboard/webmaster/sales/item'], function (mc, item_view) {
    let filter = {};

    mc.events.on('dashboard:webmaster.sales.filter.range.start', async (selected) => {
        filter.start = selected.value
    });

    mc.events.on('dashboard:webmaster.sales.filter.range.finish', async (selected) => {
        filter.finish = selected.value
    });

    mc.events.on('dashboard:webmaster.sales.filter', async ($scope) => {
        let hash_params = mc.router.hash();
        let page = parseInt(hash_params.page) || 1;
        let limit = parseInt(hash_params.limit) || 10;
        let user = await mc.api.call('users.me');

        mc.api.call("stats.sales.sales", {
            start: filter.start,
            finish: filter.finish,
            limit: limit,
            offset: (page - 1) * limit
        }).then(async function (sales) {
            $($scope).find('tbody').html('');
            if (sales && sales.items && sales.items.length) {
                for (let i in sales.items) {
                    let item = sales.items[i];
                    item.filter = filter;
                    $($scope).find('tbody').append(await item_view(item))
                }
            } else {
                $($scope).find('.loader').text("нет лидов")
            }

            $('#sales span[data-total]').text(sales.sum);

            mc.events.push('system:pagination.update', {
                total: sales.total,
                limit: sales.limit,
                current: page
            })
        })
    });

    return async function ($scope, $params) {
        let t = new Date(), s = t.getTime();
        t = new Date(s - 864000000);
        let m = t.getMonth()+1, d = t.getDate();
        filter = {};
        filter.start = t.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d);
        await mc.events.push('dashboard:webmaster.sales.filter', $scope)
    }
});