define(['microcore'], function (mc) {

    let filter = {};

    mc.events.on('dashboard.merchant.stats.filter.range.change', async (selected) => {
        if (selected.value !== '')
            mc.router.go(mc.router.hash({period: selected.value}))
        else
            mc.router.go(location.pathname)
    });

    mc.events.on('dashboard.merchant.stats.filter', async ($scope) => {
        mc.api.call("stats.sales.merchant", filter).then(async function (data) {
            console.log(data);
            /*
            if (data) {
                $($scope).find('.stats-wrapper').html('');
                $($scope).find('.stats-wrapper').append(await item_view(data));
            } else {
                $($scope).find('.loader').text("Нет данных")
            }*/
        })
    });

    return async function ($scope, $params) {
        await mc.events.push('dashboard.merchant.stats.filter', $scope);
    }
});