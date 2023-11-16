define(['microcore', 'mst!dashboard/merchant/stats/item'], function (mc, item_view) {

    return async function ($scope, $params) {
        mc.api.call("stats.sales.merchant", {
        }).then(async function (data) {
            if (data) {
                $($scope).find('.stats-wrapper').html('');
                $($scope).find('.stats-wrapper').append(await item_view(data));
            } else {
                $($scope).find('.loader').text("Нет данных")
            }
        })
    }
});