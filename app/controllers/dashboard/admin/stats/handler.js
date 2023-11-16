define(['microcore', 'mst!dashboard/admin/stats/item'], function (mc, item_view) {

    return async function ($scope, $params) {

        mc.api.call("stats.sales.admin", {
        }).then(async function (data) {
            if (data) {
                if (data.day){
                    $($scope).find('#stats-day').html('');
                    $($scope).find('#stats-day').append(await item_view(data.day));
                }
                if (data.week){
                    $($scope).find('#stats-week').html('');
                    $($scope).find('#stats-week').append(await item_view(data.week));
                }
                if (data.month){
                    $($scope).find('#stats-month').html('');
                    $($scope).find('#stats-month').append(await item_view(data.month));
                }
            } else {
                $($scope).find('.loader').text("Нет данных")
            }

        })
    }
});