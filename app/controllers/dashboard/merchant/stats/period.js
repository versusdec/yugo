define(['microcore', 'mst!dashboard/merchant/stats/item'], function (mc, item_view) {

    let filter = {};

    mc.events.on('dashboard:merchant.stats.filter.range.start', async (selected) => {
        filter.start = selected.value
    });

    mc.events.on('dashboard:merchant.stats.filter.range.finish', async (selected) => {
        filter.finish = selected.value
    });
    mc.events.on('dashboard:merchant.stats.filter', async ($scope) => {
        mc.api.call("stats.sales.merchant", filter).then(async function (data) {
            if (data) {
                $($scope).find('.stats-wrapper').html('');
                $($scope).find('.stats-wrapper').append(await item_view(data));
            } else {
                $($scope).find('.loader').text("Нет данных")
            }
        })
    });

    return async function ($scope, $params) {
        await mc.events.push('dashboard:merchant.stats.filter', $scope);
    }
});